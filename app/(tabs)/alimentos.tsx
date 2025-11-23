import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { ThemedText } from '@/components/themed-text';

type FoodItem = {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  amount: number;
  unit: string;
};

// Unidades Padrão para seleção
const UNITS = ['g', 'kg', 'ml', 'l', 'un', 'fat.'];

export default function AlimentosScreen() {
  const { user } = useAuth();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para o formulário de novo alimento
  const [newFood, setNewFood] = useState<Omit<FoodItem, 'id' | 'calories'>>({ 
    name: '', protein: 0, carbs: 0, fat: 0, amount: 100, unit: 'g'
  });
  const [isAdding, setIsAdding] = useState(false);
  
  // Calcula calorias baseadas nos macros (4-4-9)
  const calculateCalories = (p: number, c: number, f: number) => Math.round((p * 4) + (c * 4) + (f * 9));

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Busca a lista de alimentos cadastrados PELO USUÁRIO (exclui o GLOBAL_FOODS para esta tela)
    const q = query(collection(db, 'food_database'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const foodList = snapshot.docs.map(docRef => ({
        id: docRef.id,
        ...(docRef.data() as any),
      })) as FoodItem[];
      setFoods(foodList);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar alimentos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleInputChange = (field: keyof typeof newFood, value: string) => {
    // Campos que devem aceitar decimais
    const numericFields = ['protein', 'carbs', 'fat', 'amount'];
    
    if (numericFields.includes(field as string)) {
      // PERMITE APENAS DÍGITOS E PONTO (.)
      const cleanedValue = value.replace(/[^0-9.]/g, ''); 
      // Converte para float, mas salva como number no estado
      const numericValue = cleanedValue === '' ? 0 : parseFloat(cleanedValue);
      setNewFood(prev => ({ ...prev, [field]: numericValue }));
    } else {
      // Para campos de texto
      setNewFood(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleUnitSelect = (unit: string) => {
    setNewFood(prev => ({ ...prev, unit }));
  };

  const handleSaveFood = async () => {
    if (!user || !newFood.name || !newFood.unit) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios (Nome e Unidade).');
      return;
    }

    const { name, protein, carbs, fat, amount, unit } = newFood;
    const finalCalories = calculateCalories(protein, carbs, fat);
    
    try {
      await addDoc(collection(db, 'food_database'), {
        userId: user.uid,
        name,
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        amount: Number(amount),
        unit,
        calories: finalCalories,
        createdAt: new Date(),
      });
      
      Alert.alert('Sucesso', `Alimento ${name} salvo! (${finalCalories} kcal)`);
      setNewFood({ name: '', protein: 0, carbs: 0, fat: 0, amount: 100, unit: 'g' });
      setIsAdding(false);
      
    } catch (error) {
      console.error('Erro ao salvar alimento:', error);
      Alert.alert('Erro', 'Falha ao salvar alimento.');
    }
  };
  
  const handleDeleteFood = (foodId: string) => {
      Alert.alert('Excluir', 'Tem certeza que deseja excluir este alimento?', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: async () => {
              try {
                await deleteDoc(doc(db, 'food_database', foodId));
                Alert.alert('Sucesso', 'Alimento excluído.');
              } catch (e) {
                console.error('Erro ao excluir:', e);
                Alert.alert('Erro', 'Falha ao excluir alimento.');
              }
          }}
      ]);
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <View style={styles.foodCard}>
      <View style={styles.foodInfo}>
        <ThemedText style={styles.foodNameText}>{item.name}</ThemedText>
        <ThemedText style={styles.foodUnitText}>Porção Base: {item.amount}{item.unit}</ThemedText>
      </View>

      <View style={styles.rightArea}>
        <View style={styles.foodMacros}>
          <Text style={styles.macroText}>P: {item.protein}g</Text>
          <Text style={styles.macroText}>C: {item.carbs}g</Text>
          <Text style={styles.macroText}>G: {item.fat}g</Text>
        </View>

        <ThemedText style={styles.foodCaloriesText}>{item.calories ?? calculateCalories(item.protein, item.carbs, item.fat)} kcal</ThemedText>
      </View>

      <TouchableOpacity onPress={() => handleDeleteFood(item.id!)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="FitWay" subtitle="Banco de Alimentos" />

      <View style={styles.content}>

        {/* Cabeçalho da seção */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            Alimentos Cadastrados
          </ThemedText>

          {/* Botão Novo alinhado à direita */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setIsAdding(!isAdding)}
            >
              <Ionicons 
                name={isAdding ? "close-circle" : "add"} 
                size={14} 
                color="white" 
              />
              <Text style={styles.addButtonText}>
                {isAdding ? "Fechar" : "Novo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulário de Adição */}
        {isAdding && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Adicionar Novo Alimento (Pessoal)</Text>
            <TextInput style={styles.input} placeholder="Nome do Alimento (Ex: Pão Integral)" value={newFood.name} onChangeText={(t) => handleInputChange('name', t)} />
            
            <View style={styles.macroRow}>
                <TextInput style={styles.macroInput} placeholder="Prot. (g)" keyboardType="numeric" value={String(newFood.protein || '')} onChangeText={(t) => handleInputChange('protein', t)} />
                <TextInput style={styles.macroInput} placeholder="Carb. (g)" keyboardType="numeric" value={String(newFood.carbs || '')} onChangeText={(t) => handleInputChange('carbs', t)} />
                <TextInput style={styles.macroInput} placeholder="Gord. (g)" keyboardType="numeric" value={String(newFood.fat || '')} onChangeText={(t) => handleInputChange('fat', t)} />
            </View>
            
            <View style={styles.macroRow}>
                <TextInput style={[styles.macroInput, {flex: 2}]} placeholder="Porção Base (Ex: 100)" keyboardType="numeric" value={String(newFood.amount || '')} onChangeText={(t) => handleInputChange('amount', t)} />
                
                {/* Seletor de Unidade */}
                <View style={[styles.macroInput, styles.unitSelectorContainer]}>
                    <Text style={styles.unitSelectorLabel}>Unidade:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitSelectorScroll}>
                        {UNITS.map(unit => (
                            <TouchableOpacity
                                key={unit}
                                style={[styles.unitButton, newFood.unit === unit && styles.unitButtonActive]}
                                onPress={() => handleUnitSelect(unit)}
                            >
                                <Text style={[styles.unitButtonText, newFood.unit === unit && styles.unitButtonTextActive]}>{unit}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
                {/* Fim Seletor de Unidade */}
            </View>

            <Text style={styles.calculatedCalories}>Calorias Calculadas: {calculateCalories(newFood.protein, newFood.carbs, newFood.fat)} kcal</Text>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveFood}>
              <Text style={styles.saveButtonText}>Salvar na Base de Dados</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && <ActivityIndicator size="large" color="#1F2937" style={{marginTop: 30}} />}

        {!loading && foods.length === 0 && !isAdding && (
            <ThemedText style={styles.emptyText}>Comece adicionando alimentos personalizados!</ThemedText>
        )}
        
        {/* Lista de Alimentos Cadastrados */}
        <FlatList
          data={foods}
          renderItem={renderFoodItem}
          keyExtractor={item => item.id!}
          contentContainerStyle={{ paddingBottom: 50 }}
          style={styles.list}
        />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#374151', flexShrink: 1 },
  
  // Botões de Ação
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexShrink: 1,
    gap: 8,
  },
  
  addButton: {
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 64,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    flexShrink: 1,
  },

  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 30 },
  
  // Formulário
  formContainer: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.08, elevation: 3 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, gap: 10 },
  macroInput: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 14, minWidth: 0 },
  calculatedCalories: { fontSize: 16, fontWeight: 'bold', color: '#10B981', textAlign: 'center', marginVertical: 10 },
  saveButton: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  
  // Seletor de Unidade
  unitSelectorContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 0, paddingHorizontal: 10 },
  unitSelectorLabel: { fontSize: 14, color: '#6B7280', marginRight: 8, fontWeight: '500' },
  unitSelectorScroll: { alignItems: 'center' },
  unitButton: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#E5E7EB', marginLeft: 5 },
  unitButtonActive: { backgroundColor: '#3B82F6' },
  unitButtonText: { color: '#4B5563', fontSize: 12, fontWeight: '600' },
  unitButtonTextActive: { color: 'white' },

  // Lista de Alimentos
  list: { flex: 1, marginTop: 8 },

  foodCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'white', 
    padding: 15, 
    borderRadius: 12, 
    marginBottom: 10, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    elevation: 2 
  },

  foodInfo: { flex: 1, marginRight: 10, minWidth: 0 },
  foodNameText: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  foodUnitText: { fontSize: 12, color: '#6B7280' },

  rightArea: { alignItems: 'flex-end', marginRight: 8 },
  foodMacros: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  macroText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },

  foodCaloriesText: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  deleteBtn: { paddingLeft: 10 },
});