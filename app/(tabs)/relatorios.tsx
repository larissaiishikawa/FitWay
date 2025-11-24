import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from '@/components/Header';
import { ThemedText } from '@/components/themed-text';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

// FONTES REDUZIDAS PARA EVITAR CORTES
const fontSizes = {
  valueBig: isSmallScreen ? 20 : 24, // Reduzido de 24/28 para 20/24
  label: isSmallScreen ? 10 : 12,
};

export default function RelatoriosScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    currentWeight: "0",
    weightLost: "0.0",
    workoutsCount: 0,
    avgCalories: 0,
    avgSleep: "7.5",
  });

  useEffect(() => {
    if (!user) return;

    // 1. MONITORAMENTO EM TEMPO REAL DO PERFIL (PESO)
    // Isso garante que ao editar no perfil, atualiza aqui na hora.
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
            const userData = snap.data();
            const currentW = userData.weight || 0;
            const startW = userData.startWeight || currentW;
            
            setStats(prev => ({
                ...prev,
                currentWeight: String(currentW),
                // Se startWeight não existir, assume perda de 0
                weightLost: (startW - currentW).toFixed(1),
            }));
        }
        setLoading(false);
    });

    // 2. Carregar Dados de Treino e Refeições
    const fetchOtherData = async () => {
      try {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        // Média de Calorias
        const mealsRef = collection(db, 'meals');
        const qMeals = query(mealsRef, where('userId', '==', user.uid), where('createdAt', '>=', sevenDaysAgo));
        const mealsSnapshot = await getDocs(qMeals);
        let totalCals = 0;
        mealsSnapshot.forEach(doc => { totalCals += (doc.data().totalCalories || 0); });
        const calculatedAvgCalories = mealsSnapshot.size > 0 ? Math.round(totalCals / 7) : 0;

        // Contagem de Treinos
        const workoutsRef = collection(db, 'workouts');
        const qWorkouts = query(workoutsRef, where('userId', '==', user.uid));
        const workoutsSnapshot = await getDocs(qWorkouts);
        const workoutsTotal = workoutsSnapshot.size;

        setStats(prev => ({
          ...prev,
          workoutsCount: workoutsTotal,
          avgCalories: calculatedAvgCalories,
        }));

      } catch (error) {
        console.error("Erro ao carregar dados secundários:", error);
      }
    };

    fetchOtherData();

    return () => unsubscribeUser();
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

        {/* CARD RESUMO SEMANAL */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={20} color="#1F2937" />
            <ThemedText style={styles.cardTitle}>Resumo Semanal</ThemedText>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText 
                style={[styles.statValue, { color: '#10B981', fontSize: fontSizes.valueBig }]}
                adjustsFontSizeToFit // Garante que o texto diminua se não couber
                numberOfLines={1}
              >
                {stats.currentWeight}kg
              </ThemedText>
              <ThemedText style={[styles.statLabel, { fontSize: fontSizes.label }]}>Peso Atual</ThemedText>
            </View>

            <View style={styles.statItem}>
              <ThemedText 
                style={[styles.statValue, { color: '#3B82F6', fontSize: fontSizes.valueBig }]}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {stats.workoutsCount}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { fontSize: fontSizes.label }]}>Planos Ativos</ThemedText>
            </View>

            <View style={styles.statItem}>
              <ThemedText 
                style={[styles.statValue, { color: '#F97316', fontSize: fontSizes.valueBig }]}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {stats.avgCalories}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { fontSize: fontSizes.label }]}>Kcal média/dia</ThemedText>
            </View>

            <View style={styles.statItem}>
              <ThemedText 
                style={[styles.statValue, { color: '#8B5CF6', fontSize: fontSizes.valueBig }]}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {stats.avgSleep}h
              </ThemedText>
              <ThemedText style={[styles.statLabel, { fontSize: fontSizes.label }]}>Sono médio</ThemedText>
            </View>
          </View>
        </View>

        {/* CARD EVOLUÇÃO */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Evolução do Peso</ThemedText>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={48} color="#9CA3AF" />
            <ThemedText style={styles.chartText}>Gráfico de evolução</ThemedText>
            <ThemedText style={styles.chartSubText}>Dados insuficientes para gráfico</ThemedText>
          </View>
        </View>

        {/* CARD CONQUISTAS */}
        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Conquistas da Semana</ThemedText>
          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="ribbon" size={24} color="#D97706" />
              </View>
              <View style={styles.achievementInfo}>
                <ThemedText style={styles.achievementTitle}>Iniciante Focado</ThemedText>
                <ThemedText style={styles.achievementDesc}>Criou seu primeiro plano de dieta</ThemedText>
              </View>
            </View>
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  pageTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 20, marginLeft: 4 },
  
  card: {
    backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20 },
  statItem: { width: '45%', alignItems: 'center', marginBottom: 10 },
  statValue: { fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#6B7280', textAlign: 'center' },

  chartPlaceholder: { backgroundColor: '#F3F4F6', height: 150, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  chartText: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginTop: 8 },
  chartSubText: { fontSize: 12, color: '#9CA3AF' },

  achievementsList: { marginTop: 10 },
  achievementItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  achievementIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  achievementInfo: { flex: 1 },
  achievementTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  achievementDesc: { fontSize: 13, color: '#6B7280', marginTop: 2 },
});