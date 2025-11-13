// FILE: app/(tabs)/treino.tsx
import React, { useState, useEffect } from 'react';
import { ThemedText } from "@/components/themed-text";
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from '@/components/Header';
import { Link, useRouter } from 'expo-router';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';

export default function TreinoScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'workouts'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkouts(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <View style={styles.container}>
     <Header title="FitWay" subtitle="Seus Treinos" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Meus Planos</ThemedText>
          <Link href="/add-workout-modal" asChild>
            <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={20} color="white" />
                <ThemedText style={styles.addButtonText}>Novo</ThemedText>
            </TouchableOpacity>
          </Link>
        </View>

        {loading && <ThemedText>Carregando treinos...</ThemedText>}
        
        {!loading && workouts.length === 0 && (
            <View style={styles.emptyState}>
                <Ionicons name="barbell-outline" size={48} color="#9CA3AF" />
                <ThemedText style={styles.emptyText}>Você ainda não criou nenhum treino.</ThemedText>
                <Link href="/add-workout-modal" asChild>
                    <TouchableOpacity style={styles.emptyButton}>
                        <ThemedText style={styles.emptyButtonText}>Criar meu primeiro treino</ThemedText>
                    </TouchableOpacity>
                </Link>
            </View>
        )}

        {workouts.map((item) => (
            <TouchableOpacity 
                key={item.id} 
                style={styles.workoutCard}
                onPress={() => router.push({
                  pathname: "/(workout)/[id]",
                  params: { id: item.id }
                })}
            >
                <View style={styles.cardIcon}>
                    <Ionicons name="fitness" size={24} color="#1F2937" />
                </View>
                <View style={styles.cardInfo}>
                    <ThemedText style={styles.workoutTitle}>{item.name}</ThemedText>
                    <ThemedText style={styles.workoutExercises}>
                        {item.exercises?.length || 0} exercícios
                    </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
            </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6' 
  },
  content: { 
    flex: 1, 
    padding: 20 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#374151' 
  },
  addButton: { 
    backgroundColor: '#1F2937', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 8 
  },
  addButtonText: { 
    color: 'white', 
    fontSize: 14, 
    fontWeight: '600', 
    marginLeft: 4 
  },

  // Card Estilizado
  workoutCard: { 
    backgroundColor: 'white', 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 2 
  },
  cardIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  cardInfo: { 
    flex: 1 
  },
  workoutTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1F2937' 
  },
  workoutExercises: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginTop: 2 
  },

  // Empty State
  emptyState: { 
    alignItems: 'center', 
    marginTop: 40 
  },
  emptyText: { 
    color: '#6B7280', 
    marginTop: 10, 
    fontSize: 16 
  },
  emptyButton: { 
    marginTop: 15, 
    paddingVertical: 10 
  },
  emptyButtonText: { 
    color: '#3B82F6', 
    fontWeight: 'bold' 
  },
});