import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, where, writeBatch } from 'firebase/firestore'; // Adicionado writeBatch
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
  amount: number; // Porção base
  unit: string;   // Unidade base (ex: 100g)
};

// Unidades Padrão para seleção
const UNITS = ['g', 'kg', 'ml', 'l', 'un', 'fat.'];

// JSON BASE GLOBAL DE ALIMENTOS (Inserido no código para importação de uso único)
const GLOBAL_FOODS_JSON = [
  { "name": "Iogurte Natural (Integral)", "protein": 4.1, "carbs": 5.6, "fat": 3.5, "amount": 100, "unit": "g", "calories": 67.5 },
  { "name": "Pão Francês", "protein": 7.5, "carbs": 58.6, "fat": 2.2, "amount": 50, "unit": "un", "calories": 286.6 },
  { "name": "Arroz Branco Cozido", "protein": 2.5, "carbs": 28.0, "fat": 0.2, "amount": 100, "unit": "g", "calories": 128 },
  { "name": "Peito de Frango (Grelhado)", "protein": 31.0, "carbs": 0.0, "fat": 3.6, "amount": 100, "unit": "g", "calories": 159.6 },
  { "name": "Ovo Cozido", "protein": 12.6, "carbs": 1.1, "fat": 10.6, "amount": 50, "unit": "un", "calories": 155 },
  { "name": "Banana Nanica", "protein": 1.1, "carbs": 22.3, "fat": 0.3, "amount": 100, "unit": "g", "calories": 95.8 },
  { "name": "Leite Integral", "protein": 3.3, "carbs": 4.7, "fat": 3.4, "amount": 100, "unit": "ml", "calories": 61.8 },
  { "name": "Maçã com casca", "protein": 0.3, "carbs": 13.8, "fat": 0.2, "amount": 100, "unit": "un", "calories": 52 },
];

export default function AlimentosScreen() {
  const { user } = useAuth();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para o formulário de novo alimento
  const [newFood, setNewFood] = useState<Omit<FoodItem, 'id' | 'calories'>>({ 
    name: '', protein: 0, carbs: 0, fat: 0, amount: 100, unit: 'g'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false); // Novo estado para o loading da importação
  
  // Calcula calorias baseadas nos macros (4-4-9)
  const calculateCalories = (p: number, c: number, f: number) => (p * 4) + (c * 4) + (f * 9);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Busca a lista de alimentos cadastrados PELO USUÁRIO (exclui o GLOBAL_FOODS para esta tela)
    const q = query(collection(db, 'food_database'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const foodList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FoodItem[];
      setFoods(foodList);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar alimentos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Função TEMPORÁRIA para importação em lote
  const handleBatchImport = async () => {
    if (!user) return Alert.alert("Erro", "Usuário não logado.");
    
    setIsImporting(true);
    const batch = writeBatch(db);
    const globalUserId = "GLOBAL_FOODS";
    const foodsCollectionRef = collection(db, 'food_database');

    try {
        GLOBAL_FOODS_JSON.forEach((food) => {
            const newDocRef = doc(foodsCollectionRef);
            batch.set(newDocRef, {
                ...food,
                userId: globalUserId,
                createdAt: new Date(),
                // Recalcula para garantir consistência de tipo no Firestore
                calories: calculateCalories(food.protein, food.carbs, food.fat) 
            });
        });

        await batch.commit();
        Alert.alert("Sucesso!", `Importação de ${GLOBAL_FOODS_JSON.length} alimentos globais concluída. Seu modal de dieta agora poderá encontrá-los.`);
        
        // Remove o botão temporariamente após o sucesso (ou após recarregar a tela)
        // Você pode comentar a linha abaixo para deixar o botão visível para testes repetidos
        // setIsImporting(false); 

    } catch (e) {
        console.error("Erro na importação em lote:", e);
        Alert.alert("Erro", "Falha ao importar dados. Verifique a conexão e o console.");
    } finally {
        setIsImporting(false);
    }
  };


  const handleInputChange = (field: keyof typeof newFood, value: string) => {
    // Campos que devem aceitar decimais
    const numericFields = ['protein', 'carbs', 'fat', 'amount'];
    
    if (numericFields.includes(field as string)) {
      // PERMITE APENAS DÍGITOS E PONTO (.)
      const cleanedValue = value.replace(/[^0-9.]/g, ''); 
      // Converte para float, mas salva como string no estado de input
      const numericValue = parseFloat(cleanedValue) || 0; 
      
      // Salvamos o valor como Number no estado, mas usamos o valor limpo para o display se o usuário ainda estiver digitando o ponto.
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
        // Garante que macros e amount são salvos como Numbers
        protein: parseFloat(String(protein)),
        carbs: parseFloat(String(carbs)),
        fat: parseFloat(String(fat)),
        amount: parseFloat(String(amount)),
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
              await deleteDoc(doc(db, 'food_database', foodId));
              Alert.alert('Sucesso', 'Alimento excluído.');
          }}
      ]);
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <View style={styles.foodCard}>
      <View style={styles.foodInfo}>
        <ThemedText style={styles.foodNameText}>{item.name}</ThemedText>
        <ThemedText style={styles.foodUnitText}>Porção Base: {item.amount}{item.unit}</ThemedText>
      </View>
      <View style={styles.foodMacros}>
        <Text style={styles.macroText}>P: {item.protein}g</Text>
        <Text style={styles.macroText}>C: {item.carbs}g</Text>
        <Text style={styles.macroText}>G: {item.fat}g</Text>
      </View>
      <ThemedText style={styles.foodCaloriesText}>{item.calories} kcal</ThemedText>
      <TouchableOpacity onPress={() => handleDeleteFood(item.id!)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="FitWay" subtitle="Banco de Alimentos" />

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Alimentos Cadastrados</ThemedText>
          <View style={styles.actionButtons}>
            {/* BOTÃO TEMPORÁRIO DE IMPORTAÇÃO */}
            <TouchableOpacity 
                style={styles.importButton} 
                onPress={handleBatchImport} 
                disabled={isImporting}
            >
                {isImporting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.importButtonText}>Importar Base (1x)</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding(!isAdding)}>
              <Ionicons name={isAdding ? "close-circle" : "add"} size={20} color="white" />
              <ThemedText style={styles.addButtonText}>{isAdding ? "Fechar" : "Novo"}</ThemedText>
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
  content: { flex: 1, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold', color: '#374151' },
  
  // Botões de Ação
  actionButtons: { flexDirection: 'row', alignItems: 'center', gap: 10 }, // Novo container para botões
  addButton: { backgroundColor: '#1F2937', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 4 },
  importButton: { 
      backgroundColor: '#3B82F6', 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingHorizontal: 12, 
      paddingVertical: 8, 
      borderRadius: 8,
  },
  importButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#6B7280', marginTop: 30 },
  
  // Formulário
  formContainer: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, gap: 10 },
  macroInput: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 14 },
  calculatedCalories: { fontSize: 16, fontWeight: 'bold', color: '#10B981', textAlign: 'center', marginVertical: 10 },
  saveButton: { backgroundColor: '#3B82F6', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  
  // Seletor de Unidade
  unitSelectorContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 0, paddingHorizontal: 10 },
  unitSelectorLabel: { fontSize: 14, color: '#6B7280', marginRight: 5, fontWeight: '500' },
  unitSelectorScroll: { alignItems: 'center' },
  unitButton: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#E5E7EB', marginLeft: 5 },
  unitButtonActive: { backgroundColor: '#3B82F6' },
  unitButtonText: { color: '#4B5563', fontSize: 12, fontWeight: '600' },
  unitButtonTextActive: { color: 'white' },

  // Lista de Alimentos
  list: { flex: 1 },
  foodCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  foodInfo: { flex: 1, marginRight: 10 },
  foodNameText: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  foodUnitText: { fontSize: 12, color: '#6B7280' },
  foodMacros: { flexDirection: 'row', gap: 8, marginRight: 15 },
  macroText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  foodCaloriesText: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  deleteBtn: { paddingLeft: 10 },
});