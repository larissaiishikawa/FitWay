import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Alert, Text, ActivityIndicator, ScrollView, Modal, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot } from 'firebase/firestore'; 
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type FoodItemDB = {
  id: string;
  name: string;
  amount: number; 
  unit: string;   
  calories: number; 
  protein: number;
  carbs: number;
  fat: number;
  userId: string;
};

type MealFoodItem = FoodItemDB & {
  customAmount: string; 
  customUnit: string;   
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

const GLOBAL_USER_ID = "GLOBAL_FOODS";
const UNITS = ['g', 'kg', 'ml', 'l', 'un', 'fat.'];

export default function EditMealModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const { user } = useAuth();
  
  const [mealName, setMealName] = useState('');
  const [foods, setFoods] = useState<MealFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const mealId = id as string;

  // Estados do Modal
  const [dbFoods, setDbFoods] = useState<FoodItemDB[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedFoodBase, setSelectedFoodBase] = useState<FoodItemDB | null>(null);
  const [customAmount, setCustomAmount] = useState('1'); 
  const [customUnit, setCustomUnit] = useState('g');
  
  const [editIndex, setEditIndex] = useState<number | null>(null);


  // 1. Carregar Refeição
  useEffect(() => {
    if (!mealId || !user) { setLoading(false); return; }
    const fetchMeal = async () => {
      try {
        const docRef = doc(db, 'meals', mealId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMealName(data.name || '');
          setFoods(data.foods || []); 
        } else { Alert.alert('Erro', 'Refeição não encontrada.'); router.back(); }
      } catch (error) { console.error('Erro ao buscar:', error); } finally { setLoading(false); }
    };
    fetchMeal();
  }, [mealId, user]);
  
  // 2. Carregar Base
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'food_database'), where('userId', 'in', [user.uid, GLOBAL_USER_ID]));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<FoodItemDB, 'id'> })) as FoodItemDB[];
      setDbFoods(list.filter(item => item.name)); 
    });
    return () => unsubscribe();
  }, [user]);

  // --- LÓGICA DE CÁLCULO SEGURA (Proteção contra NaN) ---
  const calculateTotalMacros = (foodBase: FoodItemDB, amount: number, unit: string) => {
      let factor = 0;
      // Garante que foodBase.amount seja um número válido > 0
      const baseAmount = parseFloat(String(foodBase.amount)) || 100; 

      if (unit === foodBase.unit) factor = amount / baseAmount;
      else if (unit === 'un' || unit === 'fat.') factor = amount; 
      else factor = amount / baseAmount;
      
      if (isNaN(factor) || factor < 0) factor = 0;

      // Proteção: Se o valor base for undefined/null, usa 0
      const p = parseFloat(String(foodBase.protein)) || 0;
      const c = parseFloat(String(foodBase.carbs)) || 0;
      const f = parseFloat(String(foodBase.fat)) || 0;
      const cal = parseFloat(String(foodBase.calories)) || 0;

      return {
          totalCalories: Math.round(cal * factor),
          totalProtein: parseFloat((p * factor).toFixed(1)),
          totalCarbs: parseFloat((c * factor).toFixed(1)),
          totalFat: parseFloat((f * factor).toFixed(1)),
      };
  };

  const totalMealCalories = foods.reduce((sum, f) => sum + (f.totalCalories || 0), 0);
  const liveCalculatedMacros = selectedFoodBase ? calculateTotalMacros(selectedFoodBase, parseFloat(customAmount) || 0, customUnit) : null;

  // --- AÇÕES ---

  const handleEditItem = (index: number) => {
    const itemToEdit = foods[index];
    setSelectedFoodBase(itemToEdit); 
    setCustomAmount(itemToEdit.customAmount || '1');
    setCustomUnit(itemToEdit.customUnit || itemToEdit.unit);
    setEditIndex(index); 
    setSearchQuery(''); 
    setIsModalVisible(true);
  };

  const handleAddNewItem = () => {
    setSelectedFoodBase(null);
    setCustomAmount('1');
    setCustomUnit('g');
    setEditIndex(null); 
    setSearchQuery('');
    setIsModalVisible(true);
  };

  const handleRemoveItem = (index: number) => {
    const updated = foods.filter((_, i) => i !== index);
    setFoods(updated);
  };

  const handleConfirmModal = () => {
    if (!selectedFoodBase) return;
    const amountNum = parseFloat(customAmount);
    if (isNaN(amountNum) || amountNum <= 0) { Alert.alert('Erro', 'Quantidade inválida.'); return; }

    const calculated = calculateTotalMacros(selectedFoodBase, amountNum, customUnit);

    const newItem: MealFoodItem = {
        ...selectedFoodBase,
        customAmount: String(amountNum),
        customUnit: customUnit,
        ...calculated
    };

    if (editIndex !== null) {
        const updatedFoods = [...foods];
        updatedFoods[editIndex] = newItem;
        setFoods(updatedFoods);
    } else {
        setFoods([...foods, newItem]);
    }
    setIsModalVisible(false);
  };

  const handleSaveMeal = async () => {
    if (!user || !mealId) return;
    if (!mealName || foods.length === 0) { Alert.alert('Erro', 'Preencha o nome e adicione alimentos.'); return; }
    
    try {
      const mealData = {
        name: mealName,
        totalCalories: totalMealCalories,
        foods: foods, 
      };
      await updateDoc(doc(db, 'meals', mealId), mealData);
      Alert.alert('Sucesso!', 'Refeição atualizada.');
      router.back(); 
    } catch (error) { console.error(error); Alert.alert('Erro', 'Falha ao salvar.'); }
  };

  const handleDeleteMeal = () => {
    Alert.alert("Excluir", "Tem certeza?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
            await deleteDoc(doc(db, 'meals', mealId));
            router.back();
        }}
    ]);
  };

  const filteredDbFoods = dbFoods.filter(food => food.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Função auxiliar para renderizar texto seguro (evita NaNg)
  const renderMacro = (val: number | undefined) => {
      const num = val || 0;
      return isNaN(num) ? '0.0' : num.toFixed(1);
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#1F2937" /></View>;

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <ThemedText style={styles.title}>Editar Refeição</ThemedText>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <ThemedText style={styles.label}>Nome da Refeição</ThemedText>
            <TextInput style={styles.inputMain} value={mealName} onChangeText={setMealName} />

            <ThemedText style={styles.sectionTitle}>Alimentos ({foods.length})</ThemedText>
            
            <View style={styles.totalCard}>
                <ThemedText style={styles.totalLabel}>Total Atualizado:</ThemedText>
                <ThemedText style={styles.totalValue}>{isNaN(totalMealCalories) ? 0 : totalMealCalories} kcal</ThemedText>
            </View>

            {/* LISTA DE ALIMENTOS (CARDS INTERATIVOS) */}
            {foods.map((food, index) => (
                <TouchableOpacity key={index} style={styles.foodCard} onPress={() => handleEditItem(index)}>
                    <View style={{flex: 1}}>
                        <ThemedText style={styles.foodName}>{food.name}</ThemedText>
                        <ThemedText style={styles.foodDetails}>
                            {food.customAmount}{food.customUnit} 
                            {/* Proteção contra NaN na exibição */}
                            <Text style={{fontSize: 12, color: '#9CA3AF'}}> 
                                {` (P:${renderMacro(food.totalProtein)}g C:${renderMacro(food.totalCarbs)}g G:${renderMacro(food.totalFat)}g)`}
                            </Text>
                        </ThemedText>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                        <ThemedText style={styles.foodCalories}>{food.totalCalories || 0} kcal</ThemedText>
                        <Text style={styles.editHint}>Toque para editar</Text>
                    </View>
                    
                    <TouchableOpacity style={styles.removeBtn} onPress={(e) => { e.stopPropagation(); handleRemoveItem(index); }}>
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addButtonOutline} onPress={handleAddNewItem}>
                <Ionicons name="add-circle" size={24} color="#1F2937" />
                <ThemedText style={styles.addButtonOutlineText}>Adicionar Novo Item</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteMeal}>
                <ThemedText style={styles.deleteButtonText}>Excluir Refeição Completa</ThemedText>
            </TouchableOpacity>
        </ScrollView>

        <View style={styles.footer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeal}>
                <ThemedText style={styles.saveButtonText}>Salvar Alterações</ThemedText>
            </TouchableOpacity>
        </View>

        {/* MODAL UNIFICADO */}
        <Modal animationType="slide" visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>
                        {editIndex !== null ? 'Editar Quantidade' : 'Adicionar Item'}
                    </ThemedText>
                    <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                        <Ionicons name="close" size={30} color="#1F2937" />
                    </TouchableOpacity>
                </View>

                {editIndex === null && !selectedFoodBase ? (
                    <>
                        <TextInput 
                            style={styles.inputSearch} 
                            placeholder="Pesquisar..." 
                            value={searchQuery} 
                            onChangeText={setSearchQuery} 
                        />
                        <FlatList
                            data={filteredDbFoods}
                            keyExtractor={item => item.id}
                            renderItem={({item}) => (
                                <TouchableOpacity style={styles.searchItem} onPress={() => {
                                    setSelectedFoodBase(item);
                                    setCustomAmount('1');
                                    setCustomUnit(item.unit); 
                                }}>
                                    <Text style={styles.searchItemName}>{item.name}</Text>
                                    <Text style={styles.searchItemDetails}>{item.amount}{item.unit} | {item.calories} kcal</Text>
                                    <Ionicons name="add-circle-outline" size={24} color="#3B82F6" />
                                </TouchableOpacity>
                            )}
                        />
                    </>
                ) : (
                    <View style={styles.selectedFoodBox}>
                         <View style={styles.foodHeaderRow}>
                            <ThemedText style={styles.selectedTitle}>{selectedFoodBase?.name}</ThemedText>
                            {editIndex === null && (
                                <TouchableOpacity onPress={() => setSelectedFoodBase(null)}>
                                    <Text style={{color: '#3B82F6'}}>Trocar</Text>
                                </TouchableOpacity>
                            )}
                         </View>
                        
                        <ThemedText style={styles.selectedDetails}>
                            Base: {selectedFoodBase?.amount}{selectedFoodBase?.unit} = {selectedFoodBase?.calories} kcal
                        </ThemedText>

                        <View style={styles.customAmountRow}>
                            <TextInput
                                style={[styles.input, styles.amountInput]}
                                placeholder="Qtd"
                                keyboardType="numeric"
                                value={customAmount}
                                onChangeText={(t) => setCustomAmount(t.replace(/[^0-9.]/g, ''))}
                            />
                            
                            <View style={styles.unitSelectorContainerModal}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {UNITS.map(u => (
                                        <TouchableOpacity 
                                            key={u} 
                                            style={[styles.unitButton, customUnit === u && styles.unitButtonActive]}
                                            onPress={() => setCustomUnit(u)}
                                        >
                                            <Text style={[styles.unitButtonText, customUnit === u && styles.unitButtonTextActive]}>{u}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>

                        <View style={styles.resultBox}>
                            <Text style={styles.resultLabel}>Resultado:</Text>
                            <Text style={styles.resultValue}>{liveCalculatedMacros?.totalCalories || 0} kcal</Text>
                            <Text style={styles.resultMacros}>
                                P: {renderMacro(liveCalculatedMacros?.totalProtein)}g  C: {renderMacro(liveCalculatedMacros?.totalCarbs)}g  G: {renderMacro(liveCalculatedMacros?.totalFat)}g
                            </Text>
                        </View>

                        <TouchableOpacity style={styles.addToMealButton} onPress={handleConfirmModal}>
                            <Ionicons name={editIndex !== null ? "checkmark" : "add"} size={24} color="white" />
                            <ThemedText style={styles.addToMealButtonText}>
                                {editIndex !== null ? 'Atualizar Item' : 'Adicionar à Refeição'}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#E5E7EB' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  content: { flex: 1, padding: 20 },
  footer: { padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#E5E7EB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  label: { fontSize: 14, color: '#4B5563', marginBottom: 6, fontWeight: '600' },
  inputMain: { backgroundColor: 'white', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', marginBottom: 15, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 10, marginBottom: 10 },
  totalCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#D1FAE5', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#10B981' },
  totalLabel: { fontSize: 16, fontWeight: '500', color: '#065F46' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#065F46' },

  // CARD DE ALIMENTO NA LISTA (VISUALIZAÇÃO)
  foodCard: { backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  foodName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  foodDetails: { fontSize: 14, color: '#4B5563', marginTop: 2 },
  foodCalories: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  editHint: { fontSize: 10, color: '#3B82F6', marginTop: 2 },
  removeBtn: { marginLeft: 15, padding: 5 },

  addButtonOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: '#1F2937', backgroundColor: 'white', borderRadius: 8, marginTop: 5, marginBottom: 20, borderStyle: 'dashed' },
  addButtonOutlineText: { marginLeft: 8, fontWeight: '600', color: '#1F2937' },
  deleteButton: { alignItems: 'center', padding: 15 },
  deleteButtonText: { color: '#EF4444', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#1F2937', padding: 16, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // MODAL
  modalContainer: { flex: 1, backgroundColor: '#F3F4F6', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  inputSearch: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#D1D5DB', fontSize: 16 },
  
  searchItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 8 },
  searchItemName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  searchItemDetails: { fontSize: 12, color: '#6B7280' },

  // BOX DE SELEÇÃO / EDIÇÃO
  selectedFoodBox: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  foodHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  selectedTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', flex: 1 },
  selectedDetails: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  
  customAmountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  input: { backgroundColor: '#F9FAFB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', fontSize: 16 },
  amountInput: { flex: 0.4, textAlign: 'center' },
  
  unitSelectorContainerModal: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 50, backgroundColor: '#F9FAFB', borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', paddingHorizontal: 5 },
  unitButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#E5E7EB', marginRight: 8 },
  unitButtonActive: { backgroundColor: '#3B82F6' },
  unitButtonText: { color: '#4B5563', fontSize: 14, fontWeight: '600' },
  unitButtonTextActive: { color: 'white' },

  resultBox: { backgroundColor: '#F3F4F6', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  resultLabel: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase' },
  resultValue: { fontSize: 24, fontWeight: 'bold', color: '#10B981', marginVertical: 5 },
  resultMacros: { fontSize: 12, color: '#4B5563' },

  addToMealButton: { backgroundColor: '#1F2937', paddingVertical: 14, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  addToMealButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
});