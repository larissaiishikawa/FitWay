import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from '@/components/Header';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Header title="FitWay" subtitle="Sua jornada saudável" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics" size={24} color="#374151" />
            <ThemedText style={styles.cardTitle}>Resumo de Hoje</ThemedText>
          </View>
          
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <ThemedText style={styles.metricValue}>1,847</ThemedText>
              <ThemedText style={styles.metricLabel}>kcal consumidas</ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText style={styles.metricValue}>2/3</ThemedText>
              <ThemedText style={styles.metricLabel}>treinos da semana</ThemedText>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <ThemedText style={styles.progressLabel}>Meta calórica diária</ThemedText>
              <ThemedText style={styles.progressValue}>1,847/2,000</ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '92.35%' }]} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Metas de Hoje</ThemedText>
          
          <View style={styles.goalsList}>
            <View style={styles.goalItem}>
              <Ionicons name="water" size={20} color="#3B82F6" />
              <ThemedText style={styles.goalText}>Beber 2L de água</ThemedText>
              <View style={styles.goalProgress}>
                <ThemedText style={styles.goalProgressText}>6/8 copos</ThemedText>
              </View>
            </View>
            
            <View style={styles.goalItem}>
              <Ionicons name="leaf" size={20} color="#10B981" />
              <ThemedText style={styles.goalText}>5 porções de vegetais</ThemedText>
              <View style={styles.goalProgress}>
                <ThemedText style={styles.goalProgressText}>3/5</ThemedText>
              </View>
            </View>
            
            <View style={styles.goalItem}>
              <Ionicons name="fitness" size={20} color="#F59E0B" />
              <ThemedText style={styles.goalText}>30 min de exercício</ThemedText>
              <View style={styles.goalCompleted}>
                <ThemedText style={styles.goalCompletedText}>Concluído</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.reminderItem}>
            <Ionicons name="calendar" size={20} color="#F59E0B" />
            <ThemedText style={styles.reminderText}>Lembrete: Hora do lanche da tarde!</ThemedText>
          </View>
          <ThemedText style={styles.reminderSuggestion}>Sugestão: frutas + castanhas</ThemedText>
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
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#374151',
  },
  progressValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  goalsList: {
    marginTop: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  goalProgress: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goalProgressText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  goalCompleted: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goalCompletedText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  reminderSuggestion: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 32,
  },
});
