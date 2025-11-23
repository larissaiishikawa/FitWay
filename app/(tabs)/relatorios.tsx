import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from '@/components/Header';
import { ThemedText } from '@/components/themed-text';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function RelatoriosScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Estado para armazenar as estatísticas reais
  const [stats, setStats] = useState({
    currentWeight: "0",
    weightLost: "0.0", // Calculado ou Mock
    workoutsCount: 0,
    avgCalories: 0,
    avgSleep: "7.5", // Mock (ainda não temos feature de sono)
  });

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // 1. Buscar Peso do Usuário no Perfil
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        let currentW = 0;
        let startW = 0;

        if (userSnap.exists()) {
          const userData = userSnap.data();
          currentW = userData.weight || 0;
          startW = userData.startWeight || currentW; // Assume peso inicial = atual se não existir
        }

        // 2. Buscar Refeições dos Últimos 7 Dias para Média de Kcal
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        const mealsRef = collection(db, 'meals');
        const qMeals = query(
          mealsRef,
          where('userId', '==', user.uid),
          where('createdAt', '>=', sevenDaysAgo)
        );

        const mealsSnapshot = await getDocs(qMeals);
        let totalCals = 0;
        mealsSnapshot.forEach(doc => {
          totalCals += (doc.data().totalCalories || 0);
        });
        
        // Média simples (Total / 7 dias)
        const calculatedAvgCalories = Math.round(totalCals / 7);

        // 3. Contar Planos de Treino (Como proxy para "Treinos")
        const workoutsRef = collection(db, 'workouts');
        const qWorkouts = query(workoutsRef, where('userId', '==', user.uid));
        const workoutsSnapshot = await getDocs(qWorkouts);
        const workoutsTotal = workoutsSnapshot.size;

        // Atualizar Estado
        setStats({
          currentWeight: String(currentW),
          weightLost: (startW - currentW).toFixed(1), // Diferença simples
          workoutsCount: workoutsTotal,
          avgCalories: calculatedAvgCalories,
          avgSleep: "7.5" // Mantido estático
        });

      } catch (error) {
        console.error("Erro ao carregar relatório:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#1F2937" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="FitWay" subtitle="Sua jornada saudável" />

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <ThemedText style={styles.pageTitle}>Relatórios e Evolução</ThemedText>

        {/* 1. CARD RESUMO SEMANAL */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={20} color="#1F2937" />
            <ThemedText style={styles.cardTitle}>Resumo Semanal</ThemedText>
          </View>

          <View style={styles.statsGrid}>
            {/* Item 1: Peso */}
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: '#10B981' }]}>
                {stats.currentWeight}kg
              </ThemedText>
              <ThemedText style={styles.statLabel}>Peso Atual</ThemedText>
            </View>

            {/* Item 2: Treinos */}
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: '#3B82F6' }]}>
                {stats.workoutsCount}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Planos Ativos</ThemedText>
            </View>

            {/* Item 3: Calorias */}
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: '#F97316' }]}>
                {stats.avgCalories}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Kcal média/dia</ThemedText>
            </View>

            {/* Item 4: Sono (Mock) */}
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: '#8B5CF6' }]}>
                {stats.avgSleep}h
              </ThemedText>
              <ThemedText style={styles.statLabel}>Sono médio</ThemedText>
            </View>
          </View>
        </View>

        {/* 2. CARD EVOLUÇÃO DO PESO (Gráfico Placeholder) */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Evolução do Peso</ThemedText>
          
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={48} color="#9CA3AF" />
            <ThemedText style={styles.chartText}>Gráfico de evolução</ThemedText>
            <ThemedText style={styles.chartSubText}>Dados insuficientes para gráfico</ThemedText>
          </View>
        </View>

        {/* 3. CARD CONQUISTAS DA SEMANA */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Conquistas da Semana</ThemedText>
          
          <View style={styles.achievementsList}>
            {/* Conquista 1 */}
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="ribbon" size={24} color="#D97706" />
              </View>
              <View style={styles.achievementInfo}>
                <ThemedText style={styles.achievementTitle}>Iniciante Focado</ThemedText>
                <ThemedText style={styles.achievementDesc}>Criou seu primeiro plano de dieta</ThemedText>
              </View>
            </View>

            {/* Conquista 2 */}
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="water" size={24} color="#2563EB" />
              </View>
              <View style={styles.achievementInfo}>
                <ThemedText style={styles.achievementTitle}>Hidratação Master</ThemedText>
                <ThemedText style={styles.achievementDesc}>Acompanhando metas diárias</ThemedText>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, 
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    marginLeft: 4,
  },
  
  // Estilos Gerais dos Cards
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  // Grid de Estatísticas (Resumo Semanal)
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  statItem: {
    width: '45%', 
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Gráfico Placeholder
  chartPlaceholder: {
    backgroundColor: '#F3F4F6',
    height: 150,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  chartText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
  },
  chartSubText: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Lista de Conquistas
  achievementsList: {
    marginTop: 10,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  achievementDesc: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
});