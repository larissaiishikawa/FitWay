import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, FlatList, ActivityIndicator, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Tipos base (atualizados para incluir macros)
type FoodItemDB = {
  id: string;
  name: string;
  amount: number; // Porção base (ex: 100)
  unit: string;   // Unidade base (ex: g)
  calories: number; 
  protein: number;
  carbs: number;
  fat: number;
  userId: string;
};

// Tipo para o alimento adicionado à refeição (com a quantidade customizada)
type MealFoodItem = FoodItemDB & {
  customAmount: string; // O input customizado (ex: 45)
  customUnit: string;   // A unidade ESCOLHIDA pelo usuário (ex: 'un' ou 'g')
  totalCalories: number; // Calculado
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

// Constante para o ID Global
const GLOBAL_USER_ID = "GLOBAL_FOODS";

// Unidades Padrão para seleção (Compartilhadas com alimentos.tsx)
const UNITS = ['g', 'kg', 'ml', 'l', 'un', 'fat.'];


export default function AddMealModal() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [mealName, setMealName] = useState('');
  const [foods, setFoods] = useState<MealFoodItem[]>([]);
  
  // Estados para o Modal de Seleção de Alimento
  const [dbFoods, setDbFoods] = useState<FoodItemDB[]>([]);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFoodBase, setSelectedFoodBase] = useState<FoodItemDB | null>(null);
  const [customAmount, setCustomAmount] = useState('1'); 
  const [customUnit, setCustomUnit] = useState('g'); // Unidade de consumo (padrão 'g')

  // Busca alimentos da base de dados do usuário E da base global
  useEffect(() => {
    if (!user) return;
    
    const q = query(
        collection(db, 'food_database'), 
        where('userId', 'in', [user.uid, GLOBAL_USER_ID]) 
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() as Omit<FoodItemDB, 'id'> 
      })) as FoodItemDB[];

      setDbFoods(list.filter(item => item.name)); 
    }, (error) => {
      console.error("Erro ao carregar base de alimentos:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Calcula o total de calorias da refeição
  const totalCalories = foods.reduce((sum, food) => sum + food.totalCalories, 0);
  
  const openSearchModal = () => {
    setSearchQuery('');
    setSelectedFoodBase(null);
    setCustomAmount('1'); 
    setCustomUnit('g'); // Reseta a unidade de consumo
    setIsSearchModalVisible(true);
  };
  
  // Função de cálculo de macros baseado na porção customizada e na UNIDADE base
  const calculateTotalMacros = (foodBase: FoodItemDB, amount: number, unit: string) => {
      // Regra Simplificada de Conversão:
      // Se a unidade de consumo for igual à unidade base (ex: 100g de 100g base): fator = amount / base.amount
      // Se a unidade de consumo for 'un' ou 'fat.', tratamos como 1 porção inteira (fator = 1)
      
      let factor = 0;
      
      if (unit === foodBase.unit) {
          factor = amount / foodBase.amount;
      } else if (unit === 'un' || unit === 'fat.') {
          // Ex: se o usuário seleciona 'un' (unidade), e a base é 100g/un, ele quer 'amount' (ex: 2) vezes a base
          // Aqui, simplificamos: 1 'un' consumida é igual à porção base do alimento.
          // Se o usuário coloca 2 un, fator = 2.
          factor = amount; 
          // NOTA: Para unidades de peso (g, kg), a lógica é mais precisa e é tratada acima.
      } else {
        // Fallback: usar o fator mais básico (quantidade consumida / porção base)
        factor = amount / foodBase.amount;
      }
      
      // Proteção contra NaN
      if (isNaN(factor) || foodBase.amount === 0) factor = 0;

      return {
          totalCalories: Math.round(foodBase.calories * factor),
          totalProtein: parseFloat((foodBase.protein * factor).toFixed(1)),
          totalCarbs: parseFloat((foodBase.carbs * factor).toFixed(1)),
          totalFat: parseFloat((foodBase.fat * factor).toFixed(1)),
      };
  };
  
  // Calcula os macros em tempo real para o item selecionado no modal
  const liveCalculatedMacros = selectedFoodBase ? calculateTotalMacros(selectedFoodBase, parseFloat(customAmount) || 0, customUnit) : null;


  const handleAddFoodToMeal = () => {
    if (!selectedFoodBase) return;
    const amountNum = parseFloat(customAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
        Alert.alert('Erro', `Quantidade consumida inválida.`);
        return;
    }
    
    const calculatedMacros = calculateTotalMacros(selectedFoodBase, amountNum, customUnit);
    
    const newMealFoodItem: MealFoodItem = {
        ...selectedFoodBase, 
        customAmount: String(amountNum), 
        customUnit: customUnit, // Salva a unidade ESCOLHIDA pelo usuário
        ...calculatedMacros, 
    };

    setFoods([...foods, newMealFoodItem]);
    setIsSearchModalVisible(false); 
  };

  const handleRemoveFood = (index: number) => {
    const updated = foods.filter((_, i) => i !== index);
    setFoods(updated);
  };

  const handleSaveMeal = async () => {
    if (!user || !mealName || foods.length === 0) {
      Alert.alert('Erro', 'Dê um nome e adicione alimentos à refeição.');
      return;
    }

    try {
      await addDoc(collection(db, 'meals'), {
        userId: user.uid,
        name: mealName,
        totalCalories: totalCalories,
        foods: foods, // Array de alimentos detalhado e calculado
        createdAt: new Date(),
      });
      Alert.alert('Sucesso', 'Refeição registrada com detalhes!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao salvar refeição.');
    }
  };
  
  // Filtra a lista de alimentos para o modal de busca
  const filteredDbFoods = dbFoods.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDbFoodItem = ({ item }: { item: FoodItemDB }) => (
    <TouchableOpacity 
        style={[styles.searchItem, selectedFoodBase?.id === item.id && styles.searchItemSelected]} 
        onPress={() => setSelectedFoodBase(item)}
    >
        <View style={{flex: 1}}>
            <ThemedText style={styles.searchItemName}>{item.name}</ThemedText>
            <ThemedText style={styles.searchItemDetails}>
                Base: {item.amount}{item.unit} | {item.calories} kcal 
                {item.userId === GLOBAL_USER_ID ? ' (Global)' : ' (Pessoal)'}
            </ThemedText>
        </View>
        <Ionicons name={selectedFoodBase?.id === item.id ? "checkmark-circle" : "radio-button-off-outline"} size={24} color="#3B82F6" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Registrar Refeição</ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Nome da Refeição */}
        <ThemedText style={styles.label}>Nome da Refeição (ex: Jantar)</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Nome da refeição"
          value={mealName}
          onChangeText={setMealName}
        />

        <ThemedText style={styles.sectionTitle}>Alimentos Consumidos ({foods.length})</ThemedText>
        
        {/* Total de Calorias */}
        <View style={styles.totalCard}>
            <ThemedText style={styles.totalLabel}>Total da Refeição:</ThemedText>
            <ThemedText style={styles.totalValue}>{totalCalories} kcal</ThemedText>
        </View>

        {/* Botão Adicionar Alimento via Base de Dados */}
        <TouchableOpacity style={styles.addFoodButton} onPress={openSearchModal}>
            <Ionicons name="search" size={20} color="white" />
            <ThemedText style={styles.addFoodButtonText}>Buscar Alimento na Base</ThemedText>
        </TouchableOpacity>
        
        {/* Lista de alimentos adicionados */}
        {foods.map((food, index) => (
          <View key={index} style={styles.foodItem}>
            <View style={{flex: 1}}>
              <ThemedText style={styles.foodName}>{food.name}</ThemedText>
              <ThemedText style={styles.foodDetails}>
                  {food.customAmount} {food.customUnit} | P:{food.totalProtein}g C:{food.totalCarbs}g G:{food.totalFat}g
              </ThemedText>
            </View>
            <ThemedText style={styles.foodCalories}>{food.totalCalories} kcal</ThemedText>
            <TouchableOpacity onPress={() => handleRemoveFood(index)} style={styles.removeButton}>
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={{height: 40}} /> 
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeal}>
          <ThemedText style={styles.saveButtonText}>Salvar Refeição</ThemedText>
        </TouchableOpacity>
      </View>

      {/* MODAL DE BUSCA E SELEÇÃO DE ALIMENTOS */}
      <Modal animationType="slide" visible={isSearchModalVisible} onRequestClose={() => setIsSearchModalVisible(false)}>
        <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>Buscar e Adicionar Alimento</ThemedText>
                <TouchableOpacity onPress={() => setIsSearchModalVisible(false)}>
                    <Ionicons name="close" size={30} color="#1F2937" />
                </TouchableOpacity>
            </View>
            
            <TextInput
                style={styles.inputSearch}
                placeholder="Pesquisar alimento..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {/* Lista de alimentos filtrada */}
            <FlatList
                data={filteredDbFoods}
                renderItem={renderDbFoodItem}
                keyExtractor={item => item.id}
                style={styles.searchList}
                ListEmptyComponent={() => (
                    <ThemedText style={styles.emptySearch}>Nenhum alimento encontrado. Adicione um na aba 'Alimentos'.</ThemedText>
                )}
            />
            
            {/* Se um alimento estiver selecionado, mostra o input de quantidade */}
            {selectedFoodBase && (
                <View style={styles.selectedFoodBox}>
                    <ThemedText style={styles.selectedTitle}>{selectedFoodBase.name}</ThemedText>
                    <ThemedText style={styles.selectedDetails}>Porção base: {selectedFoodBase.amount}{selectedFoodBase.unit} ({selectedFoodBase.calories} kcal)</ThemedText>
                    
                    <View style={styles.customAmountRow}>
                        <TextInput
                            style={[styles.input, styles.amountInput]}
                            placeholder={`Ex: 50`}
                            keyboardType="numeric"
                            value={customAmount}
                            onChangeText={(t) => setCustomAmount(t.replace(/[^0-9.]/g, ''))} 
                        />
                        {/* Seletor de Unidade de Consumo */}
                        <View style={styles.unitSelectorContainerModal}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitSelectorScroll}>
                                {UNITS.map(unit => (
                                    <TouchableOpacity
                                        key={unit}
                                        style={[styles.unitButton, customUnit === unit && styles.unitButtonActive]}
                                        onPress={() => setCustomUnit(unit)}
                                    >
                                        <Text style={[styles.unitButtonText, customUnit === unit && styles.unitButtonTextActive]}>{unit}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        
                        <TouchableOpacity style={styles.addToMealButton} onPress={handleAddFoodToMeal}>
                            <Ionicons name="add" size={24} color="white" />
                            <ThemedText style={styles.addToMealButtonText}>Adicionar</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <ThemedText style={styles.finalCalorieText}>
                        Resultado: {liveCalculatedMacros?.totalCalories} kcal
                    </ThemedText>
                </View>
            )}

        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6' 
  },
  header: { 
    padding: 20, 
    backgroundColor: 'white', 
    borderBottomWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1F2937' 
  },
  content: { 
    flex: 1, 
    padding: 20 
  },
  label: { 
    fontSize: 14, 
    color: '#4B5563', 
    marginBottom: 6, 
    fontWeight: '600' 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1F2937', 
    marginTop: 20, 
    marginBottom: 10 
  },
  input: { 
    backgroundColor: 'white', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    marginBottom: 12, 
    fontSize: 16 
  },

  // Lista de Alimentos na Refeição
  foodItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10, 
    elevation: 2 
  },
  foodName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1F2937' 
  },
  foodDetails: { 
    fontSize: 12, 
    color: '#6B7280' 
  },
  foodCalories: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#10B981', 
    marginLeft: 10 
  },
  removeButton: { 
    paddingLeft: 10 
  },

  // Footer & Save
  footer: { 
    padding: 20, 
    backgroundColor: 'white', 
    borderTopWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  saveButton: { 
    backgroundColor: '#1F2937', 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  saveButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  // Total Card
  totalCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#D1FAE5', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#10B981' 
  },
  totalLabel: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: '#065F46' 
  },
  totalValue: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#065F46' 
  },

  // Botão Adicionar Alimento
  addFoodButton: { 
    backgroundColor: '#3B82F6', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    borderRadius: 8, 
    marginBottom: 20 
  },
  addFoodButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '600', 
    marginLeft: 8 
  },

  // --- Modal Styles ---
  modalContainer: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', 
    padding: 20 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#1F2937' 
  },
  inputSearch: { 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#D1D5DB', 
    fontSize: 16 
  },
  searchList: { 
    flex: 1, 
    marginBottom: 10 
  },
  emptySearch: { 
    textAlign: 'center', 
    color: '#6B7280', 
    marginTop: 20 
  },

  // Itens da Lista de Busca
  searchItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: 'transparent' 
  },
  searchItemSelected: { 
    borderColor: '#3B82F6', 
    backgroundColor: '#EFF6FF' 
  },
  searchItemName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1F2937' 
  },
  searchItemDetails: { 
    fontSize: 12, 
    color: '#6B7280' 
  },

  // Item Selecionado - Custom Amount Row
  selectedFoodBox: { 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 12, 
    marginTop: 10, 
    borderWidth: 2, 
    borderColor: '#3B82F6' 
  },
  selectedTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1F2937', 
    marginBottom: 5 
  },
  selectedDetails: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginBottom: 15 
  },
  customAmountRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    marginBottom: 10 
  },
  amountInput: { 
    flex: 0.5, 
    marginBottom: 0 
  },
  customUnitText: { 
    fontSize: 16, 
    color: '#4B5563', 
    fontWeight: 'bold' 
  },
  addToMealButton: { 
    backgroundColor: '#1F2937', 
    paddingVertical: 10, 
    paddingHorizontal: 15, 
    borderRadius: 8, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  addToMealButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginLeft: 5 
  },
  finalCalorieText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#10B981', 
    textAlign: 'center', 
    marginTop: 10 
  },

  // Seletor de Unidade Modal
  unitSelectorContainerModal: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 40, 
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  unitButton: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    backgroundColor: '#E5E7EB', 
    marginLeft: 5 
  },
  unitButtonActive: { 
    backgroundColor: '#3B82F6' 
  },
  unitButtonText: { 
    color: '#4B5563', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  unitButtonTextActive: { 
    color: 'white' 
  },
  unitSelectorScroll: { 
    alignItems: 'center', 
    paddingHorizontal: 5 
  },
});