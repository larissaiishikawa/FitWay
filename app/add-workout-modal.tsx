// FILE: app/add-workout-modal.tsx
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type ExerciseInput = {
  name: string;
  sets: string;
  reps: string;
};

export default function AddWorkoutModal() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<ExerciseInput[]>([]);
  
  // Estado temporário para o exercício que está sendo adicionado agora
  const [tempExercise, setTempExercise] = useState<ExerciseInput>({ name: '', sets: '', reps: '' });

  const handleAddExercise = () => {
    if (!tempExercise.name || !tempExercise.sets || !tempExercise.reps) {
      Alert.alert('Atenção', 'Preencha nome, séries e repetições do exercício.');
      return;
    }
    setExercises([...exercises, tempExercise]);
    setTempExercise({ name: '', sets: '', reps: '' }); // Limpa inputs
  };

  const handleRemoveExercise = (index: number) => {
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
  };

  const handleSaveWorkout = async () => {
    if (!user) return;
    if (!workoutName || exercises.length === 0) {
      Alert.alert('Erro', 'Dê um nome ao treino e adicione pelo menos um exercício.');
      return;
    }

    try {
      await addDoc(collection(db, 'workouts'), {
        userId: user.uid,
        name: workoutName,
        exercises: exercises,
        createdAt: new Date(),
      });
      Alert.alert('Sucesso', 'Treino criado!');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao salvar treino.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Novo Plano de Treino</ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.label}>Nome do Treino (ex: Treino A)</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Nome do treino"
          value={workoutName}
          onChangeText={setWorkoutName}
        />

        <ThemedText style={styles.sectionTitle}>Adicionar Exercícios</ThemedText>
        
        {/* Inputs para adicionar exercício */}
        <View style={styles.addExerciseBox}>
          <TextInput
            style={styles.input}
            placeholder="Nome (ex: Supino Reto)"
            value={tempExercise.name}
            onChangeText={(t) => setTempExercise({...tempExercise, name: t})}
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Séries (ex: 4)"
              keyboardType="numeric"
              value={tempExercise.sets}
              onChangeText={(t) => setTempExercise({...tempExercise, sets: t})}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Reps (ex: 12)"
              value={tempExercise.reps}
              onChangeText={(t) => setTempExercise({...tempExercise, reps: t})}
            />
          </View>
          <TouchableOpacity style={styles.addButtonOutline} onPress={handleAddExercise}>
            <Ionicons name="add-circle-outline" size={24} color="#1F2937" />
            <ThemedText style={styles.addButtonOutlineText}>Adicionar à lista</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Lista de exercícios adicionados */}
        {exercises.map((ex, index) => (
          <View key={index} style={styles.exerciseItem}>
            <View>
              <ThemedText style={styles.exerciseName}>{ex.name}</ThemedText>
              <ThemedText style={styles.exerciseDetails}>{ex.sets} séries x {ex.reps}</ThemedText>
            </View>
            <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout}>
          <ThemedText style={styles.saveButtonText}>Salvar Treino</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 6,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  addExerciseBox: {
    backgroundColor: '#E5E7EB',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
    borderRadius: 8,
    marginTop: 5,
  },
  addButtonOutlineText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#1F2937',
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});