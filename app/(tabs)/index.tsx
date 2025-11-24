import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Text } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';

// Componente de Texto Simples para substituir ThemedText se ele estiver causando problemas
const ThemedText = ({ style, children, numberOfLines }: any) => (
  <Text style={[{ color: '#1F2937', fontSize: 14 }, style]} numberOfLines={numberOfLines}>{children}</Text>
);

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

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
  const WATER_GOAL = 8; 

  const todayId = getTodayDateId();

  useEffect(() => {
    if (!user) return;

    // Nome do Usuário
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setUserName(data.fullName ? data.fullName.split(' ')[0] : 'Usuário');
      }
    });

    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);

    // Calorias
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

    // Treinos
    const qWorkouts = query(collection(db, 'workouts'), where('userId', '==', user.uid));
    const unsubscribeWorkouts = onSnapshot(qWorkouts, (snapshot) => {
      setWorkoutsCount(snapshot.size);
    });

    // Água
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

  const safeNumber = (num: number) => isNaN(num) ? 0 : num;

  return (
    <View style={styles.container}>
      <Header title={`Olá, ${userName}!`} subtitle="Sua jornada saudável" />

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.responsiveContainer}>
          
          {/* 1. CARD RESUMO DE HOJE */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <MaterialCommunityIcons name="bullseye-arrow" size={20} color="#1F2937" />
              <ThemedText style={styles.cardTitle}>Resumo de Hoje</ThemedText>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
                    {safeNumber(caloriesConsumed).toFixed(0).toLocaleString()}
                </ThemedText>
                <ThemedText style={styles.statLabel}>kcal consumidas</ThemedText>
              </View>
              
              <View style={styles.verticalDivider} />

              <View style={styles.statItem}>
                <ThemedText style={[styles.statValue, isSmallScreen && styles.statValueSmall]}>
                    {safeNumber(workoutsCount)}
                </ThemedText>
                <ThemedText style={styles.statLabel}>planos de treino</ThemedText>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <ThemedText style={styles.progressLabelText}>Meta diária</ThemedText>
                <ThemedText style={styles.progressLabelText}>
                    {safeNumber(caloriesConsumed).toFixed(0)}/{CALORIE_GOAL}
                </ThemedText>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressFill, { width: `${calorieProgress * 100}%` }]} />
              </View>
            </View>
          </View>

          {/* 2. CARD METAS DE HOJE */}
          <View style={styles.card}>
            <ThemedText style={[styles.cardTitle, {marginBottom: 12}]}>Metas de Hoje</ThemedText>
            
            <TouchableOpacity style={styles.goalRow} onPress={handleAddWater} activeOpacity={0.7}>
              <View style={styles.goalLeft}>
                  <Ionicons name="water-outline" size={20} color="#3B82F6" />
                  <ThemedText style={styles.goalText}>Beber 2L de água</ThemedText>
              </View>
              <View style={styles.badgeGray}>
                  <ThemedText style={styles.badgeText}>{waterIntake}/{WATER_GOAL} copos</ThemedText>
              </View>
            </TouchableOpacity>

            <View style={styles.goalRow}>
              <View style={styles.goalLeft}>
                  <MaterialCommunityIcons name="carrot" size={20} color="#10B981" />
                  <ThemedText style={styles.goalText}>5 porções vegetais</ThemedText>
              </View>
              <View style={styles.badgeBorder}>
                  <ThemedText style={styles.badgeText}>3/5</ThemedText>
              </View>
            </View>

            <View style={[styles.goalRow, {borderBottomWidth: 0}]}>
              <View style={styles.goalLeft}>
                  <MaterialCommunityIcons name="dumbbell" size={20} color="#F97316" />
                  <ThemedText style={styles.goalText}>30 min exercício</ThemedText>
              </View>
              <View style={styles.badgeBlack}>
                  <ThemedText style={styles.badgeTextWhite}>Feito</ThemedText>
              </View>
            </View>
          </View>

          {/* 3. CARD LEMBRETE */}
          <View style={[styles.card, styles.reminderCard]}>
              <View style={styles.reminderIconBg}>
                  <Ionicons name="calendar-outline" size={20} color="#D97706" />
              </View>
              <View style={{flex: 1}}>
                  <ThemedText style={styles.reminderTitle} numberOfLines={1}>Lembrete: Lanche da tarde</ThemedText>
                  <ThemedText style={styles.reminderSubtitle} numberOfLines={1}>Sugestão: frutas + castanhas</ThemedText>
              </View>
          </View>

          {/* 4. ACESSO RÁPIDO */}
          <ThemedText style={styles.sectionTitle}>Acesso Rápido</ThemedText>
          <View style={styles.shortcutsRow}>
              <TouchableOpacity 
                  style={styles.shortcutCard} 
                  onPress={() => router.push('/add-meal-modal' as any)}
                  activeOpacity={0.8}
              >
                  <View style={[styles.shortcutIcon, {backgroundColor: '#DCFCE7'}]}>
                      <Ionicons name="restaurant" size={22} color="#16A34A" />
                  </View>
                  <ThemedText style={styles.shortcutText}>Refeição</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                  style={styles.shortcutCard}
                  onPress={() => router.push('/(tabs)/treino' as any)}
                  activeOpacity={0.8}
              >
                  <View style={[styles.shortcutIcon, {backgroundColor: '#F3F4F6'}]}>
                      <Ionicons name="barbell" size={22} color="#374151" />
                  </View>
                  <ThemedText style={styles.shortcutText}>Treinos</ThemedText>
              </TouchableOpacity>
          </View>

        </View> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1 },
  
  scrollContentContainer: { 
    paddingHorizontal: 16, 
    paddingTop: 16,
    paddingBottom: 100, 
    flexGrow: 1,
  },

  responsiveContainer: {
    width: '100%',
    maxWidth: 600, 
    alignSelf: 'center',
  },
  
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 2 },
  statValueSmall: { fontSize: 24 }, 
  statLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  verticalDivider: { width: 1, height: 30, backgroundColor: '#E5E7EB' },

  progressContainer: { marginTop: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabelText: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
  progressBarBg: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#111827', borderRadius: 4 }, 

  goalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  goalLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 10 },
  goalText: { fontSize: 14, color: '#374151', flexShrink: 1 }, 
  
  badgeGray: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeBorder: { borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeBlack: { backgroundColor: '#111827', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  badgeTextWhite: { fontSize: 11, fontWeight: '600', color: 'white' },

  reminderCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  reminderIconBg: { 
    width: 36, height: 36, borderRadius: 18, 
    backgroundColor: '#FEF3C7', 
    justifyContent: 'center', alignItems: 'center', 
    marginRight: 12 
  },
  reminderTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  reminderSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 1 },

  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginBottom: 10, marginTop: 8, marginLeft: 4 },
  shortcutsRow: { flexDirection: 'row', gap: 12 },
  shortcutCard: { 
    flex: 1, 
    backgroundColor: 'white', 
    padding: 12, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 80, 
    elevation: 1,
  },
  shortcutIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  shortcutText: { fontSize: 13, fontWeight: '600', color: '#374151', textAlign: 'center' },
});