import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from "@/components/themed-text";
import Header from '@/components/Header';

const getTodayDateId = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [userName, setUserName] = useState('Usuário');
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [workoutsCount, setWorkoutsCount] = useState(0);
  const [waterIntake, setWaterIntake] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const CALORIE_GOAL = 2000; 
  const WATER_GOAL = 8; // Ajustado para 8 copos conforme protótipo (2L)

  const todayId = getTodayDateId();

  // --- CARREGAMENTO DE DADOS (Mantido igual) ---
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    getDoc(userDocRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setUserName(data.fullName ? data.fullName.split(' ')[0] : 'Usuário');
      }
    });

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);

    const qMeals = query(
      collection(db, 'meals'),
      where('userId', '==', user.uid),
      where('createdAt', '>=', todayStart),
      where('createdAt', '<=', todayEnd)
    );

    const unsubscribeMeals = onSnapshot(qMeals, (snapshot) => {
      const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().totalCalories || 0), 0);
      setCaloriesConsumed(total);
    });

    const qWorkouts = query(collection(db, 'workouts'), where('userId', '==', user.uid));
    const unsubscribeWorkouts = onSnapshot(qWorkouts, (snapshot) => {
      setWorkoutsCount(snapshot.size);
    });

    const dailyStatsRef = doc(db, 'daily_stats', `${user.uid}_${todayId}`);
    const unsubscribeWater = onSnapshot(dailyStatsRef, (docSnap) => {
      if (docSnap.exists()) {
        setWaterIntake(docSnap.data().waterIntake || 0);
      } else {
        setWaterIntake(0);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeMeals();
      unsubscribeWorkouts();
      unsubscribeWater();
    };
  }, [user]);

  const handleAddWater = async () => {
    if (!user) return;
    const dailyStatsRef = doc(db, 'daily_stats', `${user.uid}_${todayId}`);
    try {
      await setDoc(dailyStatsRef, {
        userId: user.uid,
        dateId: todayId,
        waterIntake: increment(1),
        lastUpdated: new Date()
      }, { merge: true });
    } catch (error) {
      console.error("Erro ao salvar água:", error);
    }
  };

  const calorieProgress = Math.min(caloriesConsumed / CALORIE_GOAL, 1);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Header title="FitWay" subtitle="Sua jornada saudável" />

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* 1. CARD RESUMO DE HOJE */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <MaterialCommunityIcons name="target" size={20} color="#1F2937" />
            <ThemedText style={styles.cardTitle}>Resumo de Hoje</ThemedText>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{caloriesConsumed.toFixed(0).toLocaleString()}</ThemedText>
              <ThemedText style={styles.statLabel}>kcal consumidas</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{workoutsCount}/3</ThemedText>
              <ThemedText style={styles.statLabel}>treinos da semana</ThemedText>
            </View>
          </View>

          <View style={styles.progressRow}>
            <ThemedText style={styles.progressLabel}>Meta calórica diária</ThemedText>
            <ThemedText style={styles.progressLabel}>{caloriesConsumed.toFixed(0)}/{CALORIE_GOAL.toLocaleString()}</ThemedText>
          </View>
          
          <View style={styles.progressBarBg}>
            <View style={[styles.progressFill, { width: `${calorieProgress * 100}%` }]} />
          </View>
        </View>

        {/* 2. CARD METAS DE HOJE */}
        <View style={styles.card}>
          <ThemedText style={[styles.cardTitle, {marginBottom: 16}]}>Metas de Hoje</ThemedText>
          
          {/* Item Água (Clicável) */}
          <TouchableOpacity style={styles.goalRow} onPress={handleAddWater}>
            <View style={styles.goalIconLabel}>
                <Ionicons name="water-outline" size={20} color="#3B82F6" />
                <ThemedText style={styles.goalText}>Beber 2L de água</ThemedText>
            </View>
            <View style={styles.badgeGray}>
                <ThemedText style={styles.badgeText}>{waterIntake}/{WATER_GOAL} copos</ThemedText>
            </View>
          </TouchableOpacity>

          {/* Item Vegetais (Estático) */}
          <View style={styles.goalRow}>
            <View style={styles.goalIconLabel}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#10B981" />
                <ThemedText style={styles.goalText}>5 porções de vegetais</ThemedText>
            </View>
            <View style={styles.badgeBorder}>
                <ThemedText style={styles.badgeText}>3/5</ThemedText>
            </View>
          </View>

          {/* Item Exercício (Estático) */}
          <View style={styles.goalRow}>
            <View style={styles.goalIconLabel}>
                <MaterialCommunityIcons name="dumbbell" size={20} color="#F97316" />
                <ThemedText style={styles.goalText}>30 min de exercício</ThemedText>
            </View>
            <View style={styles.badgeBlack}>
                <ThemedText style={styles.badgeTextWhite}>Concluído</ThemedText>
            </View>
          </View>
        </View>

        {/* 3. CARD LEMBRETE */}
        <View style={[styles.card, styles.reminderCard]}>
            <View style={styles.reminderIconBg}>
                <Ionicons name="calendar-outline" size={20} color="#D97706" />
            </View>
            <View>
                <ThemedText style={styles.reminderTitle}>Lembrete: Hora do lanche da tarde!</ThemedText>
                <ThemedText style={styles.reminderSubtitle}>Sugestão: frutas + castanhas</ThemedText>
            </View>
        </View>

        {/* 4. ATALHOS RÁPIDOS (Mantidos como pedido) */}
        <ThemedText style={styles.sectionTitle}>Acesso Rápido</ThemedText>
        <View style={styles.shortcutsRow}>
            <TouchableOpacity 
                style={styles.shortcutCard} 
                onPress={() => router.push('/add-meal-modal' as any)}
                activeOpacity={0.7}
            >
                <View style={[styles.shortcutIcon, {backgroundColor: '#DCFCE7'}]}>
                    <Ionicons name="restaurant" size={24} color="#16A34A" />
                </View>
                <ThemedText style={styles.shortcutText}>Registrar Refeição</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.shortcutCard}
                onPress={() => router.push('/(tabs)/treino' as any)}
                activeOpacity={0.7}
            >
                <View style={[styles.shortcutIcon, {backgroundColor: '#F3F4F6'}]}>
                    <Ionicons name="barbell" size={24} color="#374151" />
                </View>
                <ThemedText style={styles.shortcutText}>Meus Treinos</ThemedText>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' }, // Fundo branco geral para limpar visual
  content: { flex: 1 },
  scrollContentContainer: { 
    padding: 20, 
    paddingBottom: 100 
  },
  
  // Card Styles Comuns
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Borda sutil cinza
    // Sombra bem suave
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // Card 1: Resumo
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '500', color: '#1F2937' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 32, fontWeight: '400', color: '#1F2937', marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#6B7280' },

  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: '#374151' },
  progressBarBg: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#111827', borderRadius: 4 }, // Barra Preta como na imagem

  // Card 2: Metas (Lista)
  goalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  goalIconLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalText: { fontSize: 15, color: '#374151' },
  
  // Badges
  badgeGray: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeBorder: { borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeBlack: { backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  badgeTextWhite: { fontSize: 12, fontWeight: '600', color: 'white' },

  // Card 3: Lembrete
  reminderCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  reminderIconBg: { 
    width: 40, height: 40, borderRadius: 20, 
    backgroundColor: '#FEF3C7', // Amarelo claro
    justifyContent: 'center', alignItems: 'center', 
    marginRight: 16 
  },
  reminderTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  reminderSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  // Acesso Rápido
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151', marginBottom: 12, marginTop: 10 },
  shortcutsRow: { flexDirection: 'row', gap: 15 },
  shortcutCard: { 
    flex: 1, 
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100, 
  },
  shortcutIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  shortcutText: { fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' },
});