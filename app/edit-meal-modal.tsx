import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Alert, Text, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function EditMealModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(true);
  
  const mealId = id as string;

  useEffect(() => {
    if (!mealId || !user) {
      setLoading(false);
      return;
    }

    const fetchMeal = async () => {
      try {
        const docRef = doc(db, 'meals', mealId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setDescription(data.description || '');
          setCalories(String(data.calories) || '');
        } else {
          Alert.alert('Erro', 'Refeição não encontrada.');
          router.back();
        }
      } catch (error) {
        console.error('Erro ao buscar refeição:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [mealId, user]);

  const handleCaloriesChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setCalories(numericText);
  };

  const handleSaveMeal = async () => {
    if (!user || !mealId) return;
    if (!name || !calories) {
      Alert.alert('Erro', 'Por favor, preencha nome e calorias.');
      return;
    }
    
    const caloriesNum = parseInt(calories, 10);
    if (isNaN(caloriesNum)) {
        Alert.alert('Erro', 'Valor de calorias inválido.');
        return;
    }

    try {
      const mealData = {
        name: name,
        description: description,
        calories: caloriesNum,
      };
      await updateDoc(doc(db, 'meals', mealId), mealData);
      Alert.alert('Sucesso!', 'Refeição atualizada.');
      router.back(); 
    } catch (error) {
      console.error('Erro ao salvar refeição: ', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const handleDeleteMeal = () => {
    Alert.alert(
      "Excluir Refeição",
      "Tem certeza que deseja excluir esta refeição?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive", 
          onPress: async () => {
            if (!mealId) return;
            try {
              await deleteDoc(doc(db, 'meals', mealId));
              router.back();
            } catch (error) {
              console.error('Erro ao excluir:', error);
              Alert.alert('Erro', 'Não foi possível excluir a refeição.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1F2937" />
        <Text style={styles.loadingText}>Carregando dados da refeição...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Editar Refeição</ThemedText>
      
      <TextInput
        style={styles.input}
        placeholder="Nome da refeição"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Calorias"
        value={calories}
        onChangeText={handleCaloriesChange}
        keyboardType="numeric"
      />
      
      <TouchableOpacity style={styles.button} onPress={handleSaveMeal}>
        <ThemedText style={styles.buttonText}>Salvar Alterações</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteMeal}>
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
        <ThemedText style={styles.deleteButtonText}>Excluir Refeição</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  button: {
    backgroundColor: '#1F2937',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#FEE2E2', // Vermelho claro para indicar destruição
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});