import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';
import { Alert } from 'react-native';

type HeaderProps = {
  title: string;
  subtitle: string;
};

export default function Header({ title, subtitle }: HeaderProps) {
  const { user, logout } = useAuth();

  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <ThemedText style={styles.appTitle}>{title}</ThemedText>
        <ThemedText style={styles.appSubtitle}>{subtitle}</ThemedText>
      </View>
      
      <TouchableOpacity style={styles.profileButton} onPress={() => {
        Alert.alert('TESTE 1', 'O botão de perfil FOI CLICADO!');
        logout();
      }}>
        <ThemedText style={styles.profileInitial}>{userInitial}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});