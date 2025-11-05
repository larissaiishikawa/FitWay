import { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';

export default function AddMealModal() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');

  const handleSaveMeal = async () => {
    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para salvar uma refeição.');
      return;
    }
    if (!name || !calories) {
      Alert.alert('Erro', 'Por favor, preencha pelo menos o nome e as calorias.');
      return;
    }
    try {
      const mealData = {
        name: name,
        description: description,
        calories: parseInt(calories, 10),
        createdAt: new Date(),
        userId: user.uid,
      };
      await addDoc(collection(db, 'meals'), mealData);
      Alert.alert('Sucesso!', 'Sua refeição foi salva.');
      router.back(); 
    } catch (error) {
      console.error('Erro ao salvar refeição: ', error);
      Alert.alert('Erro', 'Não foi possível salvar a refeição.');
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Adicionar Nova Refeição</ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Nome da refeição (ex: Almoço)"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição (ex: Arroz, feijão e frango)"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Calorias (ex: 720)"
        value={calories}
        onChangeText={setCalories}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.button} onPress={handleSaveMeal}>
        <ThemedText style={styles.buttonText}>Salvar Refeição</ThemedText>
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
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});