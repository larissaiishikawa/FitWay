import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from '@/components/Header';

export default function TreinoScreen() {
  return (
    <View style={styles.container}>
     <Header title="FitWay" subtitle="Sua jornada saudável" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Plano de Treino</ThemedText>
          <View style={styles.weekTag}>
            <ThemedText style={styles.weekText}>Semana 2/4</ThemedText>
          </View>
        </View>

        <View style={styles.workoutCard}>
          <ThemedText style={styles.workoutTitle}>Treino de Hoje - Peito e Tríceps</ThemedText>
          
          <View style={styles.exerciseList}>
            <View style={styles.exerciseItem}>
              <View style={styles.exerciseNumber}>
                <ThemedText style={styles.exerciseNumberText}>1</ThemedText>
              </View>
              <View style={styles.exerciseInfo}>
                <ThemedText style={styles.exerciseName}>Flexão de braço</ThemedText>
                <ThemedText style={styles.exerciseReps}>3x12 repetições</ThemedText>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={16} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.exerciseItem}>
              <View style={styles.exerciseNumber}>
                <ThemedText style={styles.exerciseNumberText}>2</ThemedText>
              </View>
              <View style={styles.exerciseInfo}>
                <ThemedText style={styles.exerciseName}>Supino com halteres</ThemedText>
                <ThemedText style={styles.exerciseReps}>3x10 repetições</ThemedText>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={16} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.exerciseItem}>
              <View style={styles.exerciseNumber}>
                <ThemedText style={styles.exerciseNumberText}>3</ThemedText>
              </View>
              <View style={styles.exerciseInfo}>
                <ThemedText style={styles.exerciseName}>Tríceps no banco</ThemedText>
                <ThemedText style={styles.exerciseReps}>3x15 repetições</ThemedText>
              </View>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={16} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.startWorkoutButton}>
            <ThemedText style={styles.startWorkoutText}>Iniciar Treino</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.weekSection}>
          <ThemedText style={styles.weekSectionTitle}>Esta Semana</ThemedText>
          
          <View style={styles.weekSchedule}>
            <View style={styles.dayItem}>
              <ThemedText style={styles.dayName}>Segunda - Peito e Tríceps</ThemedText>
              <View style={[styles.statusTag, { backgroundColor: '#1F2937' }]}>
                <ThemedText style={[styles.statusText, { color: 'white' }]}>Concluído</ThemedText>
              </View>
            </View>

            <View style={styles.dayItem}>
              <ThemedText style={styles.dayName}>Terça - Descanso</ThemedText>
              <View style={[styles.statusTag, { backgroundColor: '#F3F4F6' }]}>
                <ThemedText style={[styles.statusText, { color: '#6B7280' }]}>-</ThemedText>
              </View>
            </View>

            <View style={styles.dayItem}>
              <ThemedText style={styles.dayName}>Quarta - Costas e Bíceps</ThemedText>
              <View style={[styles.statusTag, { backgroundColor: '#1F2937' }]}>
                <ThemedText style={[styles.statusText, { color: 'white' }]}>Concluído</ThemedText>
              </View>
            </View>

            <View style={styles.dayItem}>
              <ThemedText style={styles.dayName}>Quinta - Pernas</ThemedText>
              <View style={[styles.statusTag, { backgroundColor: '#F3F4F6' }]}>
                <ThemedText style={[styles.statusText, { color: '#6B7280' }]}>Hoje</ThemedText>
              </View>
            </View>

            <View style={styles.dayItem}>
              <ThemedText style={styles.dayName}>Sexta - Ombros</ThemedText>
              <View style={[styles.statusTag, { backgroundColor: '#F3F4F6' }]}>
                <ThemedText style={[styles.statusText, { color: '#6B7280' }]}>Pendente</ThemedText>
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#1F2937',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  appSubtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 2,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
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
  weekTag: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  weekText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  workoutCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  exerciseList: {
    marginBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exerciseNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  exerciseReps: {
    fontSize: 12,
    color: '#6B7280',
  },
  playButton: {
    padding: 8,
  },
  startWorkoutButton: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  startWorkoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekSection: {
    marginBottom: 20,
  },
  weekSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
  },
  weekSchedule: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dayItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
