// app/(tabs)/profile.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

type UserData = {
  fullName?: string;
  email?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  goal?: string;
  bmi?: number;
};

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: "",
    age: "",
    weight: "",
    height: "",
    gender: "",
    goal: "",
  });
  const scrollViewRef = useRef<ScrollView>(null);

  const userInitial = userData?.fullName
    ? userData.fullName[0].toUpperCase()
    : user?.email
    ? user.email[0].toUpperCase()
    : "U";

  const loadUserData = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
        setEditData({
          fullName: data.fullName || "",
          age: data.age?.toString() || "",
          weight: data.weight?.toString() || "",
          height: data.height?.toString() || "",
          gender: data.gender || "",
          goal: data.goal || "",
        });
      } else {
        // Se não existem dados, inicializa com valores vazios para permitir edição
        setUserData(null);
        setEditData({
          fullName: "",
          age: "",
          weight: "",
          height: "",
          gender: "",
          goal: "",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Scroll automático quando entrar no modo de edição
  useEffect(() => {
    if (isEditing && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 300, animated: true });
      }, 100);
    }
  }, [isEditing]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Restaura os dados originais
    if (userData) {
      setEditData({
        fullName: userData.fullName || "",
        age: userData.age?.toString() || "",
        weight: userData.weight?.toString() || "",
        height: userData.height?.toString() || "",
        gender: userData.gender || "",
        goal: userData.goal || "",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validação
    if (
      !editData.fullName ||
      !editData.age ||
      !editData.weight ||
      !editData.height ||
      !editData.gender ||
      !editData.goal
    ) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const ageNum = parseInt(editData.age, 10);
    const weightNum = parseFloat(editData.weight);
    const heightNum = parseInt(editData.height, 10);

    if (isNaN(ageNum) || ageNum <= 0 || ageNum > 150) {
      Alert.alert("Erro", "Por favor, insira uma idade válida.");
      return;
    }
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
      Alert.alert("Erro", "Por favor, insira um peso válido.");
      return;
    }
    if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
      Alert.alert("Erro", "Por favor, insira uma altura válida.");
      return;
    }

    try {
      const updatedData = {
        fullName: editData.fullName.trim(),
        email: user.email || "",
        age: ageNum,
        weight: weightNum,
        height: heightNum,
        gender: editData.gender.trim(),
        goal: editData.goal.trim(),
        updatedAt: new Date(),
        bmi: parseFloat((weightNum / Math.pow(heightNum / 100, 2)).toFixed(2)),
      };

      // Se não existem dados, cria o documento. Se existem, atualiza.
      if (!userData) {
        const newUserData = {
          ...updatedData,
          createdAt: new Date(),
        };
        await setDoc(doc(db, "users", user.uid), newUserData);
        setUserData(newUserData as UserData);
      } else {
        await updateDoc(doc(db, "users", user.uid), updatedData);
        setUserData({ ...userData, ...updatedData });
      }

      // Fecha o modo de edição
      setIsEditing(false);

      Alert.alert("Sucesso!", "Seus dados foram salvos com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
      Alert.alert("Erro", "Não foi possível salvar os dados. Tente novamente.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Sair da Conta", "Você tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.card}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
            <Text style={styles.userName}>
              {userData?.fullName || user?.email}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Dados Pessoais */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dados Pessoais</Text>

          {loading ? (
            <Text style={styles.loadingText}>Carregando dados...</Text>
          ) : isEditing ? (
            // Modo de edição
            <>
              <View style={styles.editField}>
                <Text style={styles.editLabel}>Nome completo</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.fullName}
                  onChangeText={(text) =>
                    setEditData({ ...editData, fullName: text })
                  }
                  placeholder="Seu nome completo"
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Idade</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.age}
                  onChangeText={(text) =>
                    setEditData({ ...editData, age: text })
                  }
                  placeholder="25"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Peso (kg)</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.weight}
                  onChangeText={(text) =>
                    setEditData({ ...editData, weight: text })
                  }
                  placeholder="70"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Altura (cm)</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.height}
                  onChangeText={(text) =>
                    setEditData({ ...editData, height: text })
                  }
                  placeholder="170"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Sexo</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.gender}
                  onChangeText={(text) =>
                    setEditData({ ...editData, gender: text })
                  }
                  placeholder="Feminino/Masculino"
                />
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Objetivo principal</Text>
                <TextInput
                  style={styles.editInput}
                  value={editData.goal}
                  onChangeText={(text) =>
                    setEditData({ ...editData, goal: text })
                  }
                  placeholder="Ex: Perder peso"
                />
              </View>

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.buttonCancel}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.buttonCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonSave}
                  onPress={handleSave}
                >
                  <Text style={styles.buttonSaveText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nome</Text>
                <Text style={styles.infoValue}>
                  {userData?.fullName || "Não informado"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Idade</Text>
                <Text style={styles.infoValue}>
                  {userData?.age ? `${userData.age} anos` : "Não informado"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Peso</Text>
                <Text style={styles.infoValue}>
                  {userData?.weight ? `${userData.weight} kg` : "Não informado"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Altura</Text>
                <Text style={styles.infoValue}>
                  {userData?.height ? `${userData.height} cm` : "Não informado"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sexo</Text>
                <Text style={styles.infoValue}>
                  {userData?.gender || "Não informado"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Objetivo</Text>
                <Text style={styles.infoValue}>
                  {userData?.goal || "Não informado"}
                </Text>
              </View>
              {userData?.bmi && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>IMC</Text>
                  <Text style={styles.infoValue}>{userData.bmi}</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.buttonOutline}
                onPress={() => setIsEditing(true)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={18}
                  color="#374151"
                />
                <Text style={styles.buttonOutlineText}>Editar Informações</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Configurações */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Configurações</Text>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={22}
              color="#374151"
            />
            <Text style={styles.menuItemText}>Notificações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons
              name="shield-outline"
              size={22}
              color="#374151"
            />
            <Text style={styles.menuItemText}>Privacidade e Segurança</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.buttonDestructive}
            onPress={handleLogout}
          >
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
    backgroundColor: "#F3F4F6",
  },
  header: {
    backgroundColor: "#111827",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  scrollContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
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
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#9CA3AF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  buttonOutline: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    marginTop: 20,
  },
  buttonOutlineText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuItemText: {
    fontSize: 16,
    color: "#1F2937",
    marginLeft: 16,
  },
  buttonDestructive: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EF4444",
    padding: 14,
    borderRadius: 8,
  },
  buttonDestructiveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 20,
  },
  editField: {
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 12,
  },
  buttonCancel: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  buttonCancelText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonSave: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#1F2937",
    alignItems: "center",
  },
  buttonSaveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
