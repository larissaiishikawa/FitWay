import React, { useState, useEffect } from 'react';
import { ThemedText } from "@/components/themed-text";
import { View, StyleSheet, FlatList, ScrollView, TouchableOpacity } from "react-native";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';

type Meal = {
  id: string;
  name: string;
  description: string;
  calories: number;
};

export default function RelatoriosScreen() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setMeals([]); 
      return;
    }
    
    const mealsCollection = collection(db, "meals");
    const q = query(mealsCollection, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mealsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meal[];
      setMeals(mealsList);
      setLoading(false);
    });

    return () => unsubscribe(); 
    
  }, [user]); 

  return (
    <View style={styles.container}>
      {/* Usa o Header reutilizável */}
      <Header title="FitWay" subtitle="Sua jornada saudável" />

      <ScrollView style={styles.content}>
        <ThemedText style={styles.mainTitle}>Refeições Registradas</ThemedText>
        {loading && <ThemedText>Carregando refeições...</ThemedText>}
        
        {!loading && meals.length === 0 && (
          <ThemedText style={styles.emptyText}>Nenhuma refeição registrada ainda. Adicione uma na aba "Dieta"!</ThemedText>
        )}

        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.mealItemCard}>
              <ThemedText style={styles.mealName}>{item.name}</ThemedText>
              <ThemedText style={styles.mealDescription}>{item.description}</ThemedText>
              <ThemedText style={styles.mealCalories}>{item.calories} kcal</ThemedText>
            </View>
          )}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
  },
  mealItemCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  mealDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginVertical: 4,
  },
  mealCalories: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    color: '#374151',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 30,
  },
});