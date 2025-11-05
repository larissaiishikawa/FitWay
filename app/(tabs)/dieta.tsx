import { ThemedText } from "@/components/themed-text";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from 'expo-router';

export default function DietaScreen() {
  
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
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Diário Alimentar</ThemedText>
          
          <Link href="/add-meal-modal" asChild>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color="white" />
              <ThemedText style={styles.addButtonText}>Adicionar</ThemedText>
            </TouchableOpacity>
          </Link>

        </View>

        <View style={styles.nutritionCard}>
          <View style={styles.nutritionItem}>
            <ThemedText style={styles.nutritionValue}>1,847</ThemedText>
            <ThemedText style={styles.nutritionLabel}>Calorias</ThemedText>
          </View>
          <View style={styles.nutritionItem}>
            <ThemedText style={[styles.nutritionValue, { color: '#3B82F6' }]}>98g</ThemedText>
            <ThemedText style={styles.nutritionLabel}>Proteínas</ThemedText>
          </View>
          <View style={styles.nutritionItem}>
            <ThemedText style={[styles.nutritionValue, { color: '#F59E0B' }]}>210g</ThemedText>
            <ThemedText style={styles.nutritionLabel}>Carboidratos</ThemedText>
          </View>
        </View>

        <View style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <ThemedText style={styles.mealTitle}>Café da Manhã</ThemedText>
            <TouchableOpacity style={styles.editButton}>
              <ThemedText style={styles.editButtonText}>Editar</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.mealDescription}>2 fatias de pão integral + ovo</ThemedText>
          <ThemedText style={styles.mealCalories}>380 kcal</ThemedText>
        </View>

        <View style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <ThemedText style={styles.mealTitle}>Almoço</ThemedText>
            <TouchableOpacity style={styles.editButton}>
              <ThemedText style={styles.editButtonText}>Editar</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.mealDescription}>Arroz + feijão + frango grelhado</ThemedText>
          <ThemedText style={styles.mealCalories}>720 kcal</ThemedText>
        </View>

        <View style={styles.mealCard}>
          <View style={styles.mealHeader}>
            <ThemedText style={styles.mealTitle}>Lanche</ThemedText>
            <TouchableOpacity style={styles.editButton}>
              <ThemedText style={styles.editButtonText}>Editar</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.mealDescription}>Banana + aveia</ThemedText>
          <ThemedText style={styles.mealCalories}>180 kcal</ThemedText>
        </View>

        <TouchableOpacity style={styles.addDinnerButton}>
          <Ionicons name="add" size={24} color="#374151" />
          <ThemedText style={styles.addDinnerText}>Adicionar Jantar</ThemedText>
        </TouchableOpacity>
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
  },
  addDinnerText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
});
