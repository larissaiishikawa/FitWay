// app/(tabs)/profile.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';


export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';

  const handleLogout = () => {
    Alert.alert(
      "Sair da Conta",
      "Você tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: logout }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
            <Text style={styles.userName}>{user?.email}</Text>
            <Text style={styles.userEmail}>Seu e-mail: {user?.email}</Text>
          </View>
        </View>

        {/* Dados Pessoais (Ainda não implementado, como você pediu) */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados Pessoais</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Idade</Text>
            <Text style={styles.infoValue}>25 anos (Em breve)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Peso</Text>
            <Text style={styles.infoValue}>70 kg (Em breve)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Altura</Text>
            <Text style={styles.infoValue}>170 cm (Em breve)</Text>
          </View>
          <TouchableOpacity style={styles.buttonOutline}>
            <MaterialCommunityIcons name="pencil-outline" size={18} color="#374151" />
            <Text style={styles.buttonOutlineText}>Editar Informações</Text>
          </TouchableOpacity>
        </View>

        {/* Configurações */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configurações</Text>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#374151" />
            <Text style={styles.menuItemText}>Notificações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="shield-outline" size={22} color="#374151" />
            <Text style={styles.menuItemText}>Privacidade e Segurança</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.buttonDestructive} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color="white" />
            <Text style={styles.buttonDestructiveText}>Sair da Conta</Text>
          </TouchableOpacity>
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
    backgroundColor: '#111827',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  buttonOutline: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 20,
  },
  buttonOutlineText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 16,
  },
  buttonDestructive: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    padding: 14,
    borderRadius: 8,
  },
  buttonDestructiveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});