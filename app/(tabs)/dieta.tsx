import React, { useState, useEffect } from 'react';
import { ThemedText } from "@/components/themed-text";
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from 'expo-router';
import Header from '@/components/Header';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';

type Meal = {
  id: string;
  name: string;
  description: string;
  calories: number;
};

const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const todayEnd = new Date();
todayEnd.setHours(23, 59, 59, 999);

export default function DietaScreen() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const router = useRouter(); 
  const [loading, setLoading] = useState(true);

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const mockProtein = 98; 
  const mockCarbs = 210; 

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setMeals([]);
      return;
    }
    
    const q = query(
      collection(db, 'meals'),
      where('userId', '==', user.uid),
      where('createdAt', '>=', todayStart),
      where('createdAt', '<=', todayEnd)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mealsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Meal[];
      setMeals(mealsList);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar refeições:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const sortedMeals = [...meals].sort((a: any, b: any) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime());

  const MealItem = ({ meal }: { meal: Meal }) => (
      <View style={styles.mealCard}>
          <View style={styles.mealHeader}>
              <ThemedText style={styles.mealTitle}>{meal.name}</ThemedText>
              <TouchableOpacity style={styles.editButton} onPress={() => router.push({ 
                    pathname: "/edit-meal-modal",
                    params: { id: meal.id }
                } as any)}>
                  <ThemedText style={styles.editButtonText}>Editar</ThemedText>
              </TouchableOpacity>
          </View>
          <ThemedText style={styles.mealDescription}>{meal.description}</ThemedText>
          <ThemedText style={styles.mealCalories}>{meal.calories} kcal</ThemedText>
      </View>
  );

  return (
    <View style={styles.container}>
      
      <Header title="FitWay" subtitle="Diário Alimentar" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Refeições de Hoje</ThemedText>
          
          <Link href="/add-meal-modal" asChild>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color="white" />
              <ThemedText style={styles.addButtonText}>Adicionar</ThemedText>
            </TouchableOpacity>
          </Link>

        </View>

        <View style={styles.nutritionCard}>
          <View style={styles.nutritionItem}>
            <ThemedText style={styles.nutritionValue}>{totalCalories.toLocaleString()}</ThemedText>
            <ThemedText style={styles.nutritionLabel}>Calorias</ThemedText>
          </View>
          <View style={styles.nutritionItem}>
            <ThemedText style={[styles.nutritionValue, { color: '#3B82F6' }]}>{mockProtein}g</ThemedText>
            <ThemedText style={styles.nutritionLabel}>Proteínas</ThemedText>
          </View>
          <View style={styles.nutritionItem}>
            <ThemedText style={[styles.nutritionValue, { color: '#F59E0B' }]}>{mockCarbs}g</ThemedText>
            <ThemedText style={styles.nutritionLabel}>Carboidratos</ThemedText>
          </View>
        </View>

        {loading && <ThemedText style={{textAlign: 'center', marginVertical: 20}}>Carregando refeições...</ThemedText>}
        
        {!loading && sortedMeals.length === 0 && (
            <ThemedText style={styles.emptyText}>Adicione sua primeira refeição do dia!</ThemedText>
        )}

        {/* Refeições Dinâmicas */}
        {sortedMeals.map((meal) => (
            <MealItem key={meal.id} meal={meal} />
        ))}

        <Link href="/add-meal-modal" asChild>
          <TouchableOpacity style={styles.addDinnerButton}>
            <Ionicons name="add" size={24} color="#374151" />
            <ThemedText style={styles.addDinnerText}>Adicionar mais refeições</ThemedText>
          </TouchableOpacity>
        </Link>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  addButton: {
    backgroundColor: '#1F2937',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  nutritionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  mealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  mealDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  mealCalories: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  addDinnerButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 40, 
  },
  addDinnerText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 30,
  }
});