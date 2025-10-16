import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RelatoriosScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.appTitle}>FitWay</ThemedText>
          <ThemedText style={styles.appSubtitle}>Sua jornada saudável</ThemedText>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <ThemedText style={styles.profileInitial}>U</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={styles.mainTitle}>Relatórios e Evolução</ThemedText>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trending-up" size={20} color="#374151" />
            <ThemedText style={styles.cardTitle}>Resumo Semanal</ThemedText>
          </View>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <ThemedText style={[styles.metricValue, { color: '#10B981' }]}>-1.2kg</ThemedText>
              <ThemedText style={styles.metricLabel}>Peso perdido</ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText style={[styles.metricValue, { color: '#3B82F6' }]}>4/5</ThemedText>
              <ThemedText style={styles.metricLabel}>Treinos realizados</ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText style={[styles.metricValue, { color: '#F59E0B' }]}>1,950</ThemedText>
              <ThemedText style={styles.metricLabel}>Kcal média/dia</ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText style={[styles.metricValue, { color: '#8B5CF6' }]}>7.5h</ThemedText>
              <ThemedText style={styles.metricLabel}>Sono médio</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Evolução do Peso</ThemedText>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={48} color="#9CA3AF" />
            <ThemedText style={styles.chartText}>Gráfico de evolução</ThemedText>
            <ThemedText style={styles.chartSubtext}>Últimos 30 dias</ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.cardTitle}>Conquistas da Semana</ThemedText>
          
          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="trophy" size={20} color="white" />
              </View>
              <View style={styles.achievementInfo}>
                <ThemedText style={styles.achievementTitle}>Consistência</ThemedText>
                <ThemedText style={styles.achievementDescription}>5 dias seguidos de metas cumpridas</ThemedText>
              </View>
            </View>

            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, { backgroundColor: '#3B82F6' }]}>
                <Ionicons name="water" size={20} color="white" />
              </View>
              <View style={styles.achievementInfo}>
                <ThemedText style={styles.achievementTitle}>Hidratação Master</ThemedText>
                <ThemedText style={styles.achievementDescription}>Meta de água atingida 7 dias</ThemedText>
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
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  chartPlaceholder: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  chartText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  chartSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  achievementsList: {
    marginTop: 8,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
});
