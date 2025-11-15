import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [gender, setGender] = useState("");
  const [goal, setGoal] = useState("");

  const handleRegister = async () => {
    // Validação
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !fullName ||
      !age ||
      !weight ||
      !height ||
      !gender ||
      !goal
    ) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // Validação de tipos numéricos
    const ageNum = parseInt(age, 10);
    const weightNum = parseFloat(weight);
    const heightNum = parseInt(height, 10);

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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Estrutura completa dos dados do usuário
      const userData = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        age: ageNum,
        weight: weightNum,
        height: heightNum,
        gender: gender.trim(),
        goal: goal.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
        // Calcula o IMC (Índice de Massa Corporal)
        bmi: parseFloat((weightNum / Math.pow(heightNum / 100, 2)).toFixed(2)),
      };

      // Salva os dados no Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      Alert.alert("Sucesso!", "Conta criada com sucesso!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"),
        },
      ]);
    } catch (error: any) {
      console.error("Erro ao cadastrar usuário:", error);
      let errorMessage = "Erro ao criar conta. Tente novamente.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este e-mail já está em uso.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "E-mail inválido.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "A senha é muito fraca.";
      }

      Alert.alert("Erro no Cadastro", errorMessage);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Criar nova conta</Text>
        </View>

        {/* Card de Credenciais */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações de Acesso</Text>

          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="#6B7280"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color="#6B7280"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Text style={styles.label}>Confirmar senha</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={20}
              color="#6B7280"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* Card de Informações Básicas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Informações Básicas</Text>

          <Text style={styles.label}>Nome completo</Text>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color="#6B7280"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Idade</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="70"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Altura (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="170"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>Sexo</Text>
              <TextInput
                style={styles.input}
                placeholder="Feminino/Masculino"
                value={gender}
                onChangeText={setGender}
              />
            </View>
          </View>

          <Text style={styles.label}>Objetivo principal</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Perder peso"
            value={goal}
            onChangeText={setGoal}
          />
        </View>

        {/* Botão Criar Conta */}
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegister}>
          <Text style={styles.buttonPrimaryText}>Criar conta e começar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
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
    marginBottom: 20,
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    // Estilo mínimo para os textinputs sem container
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  buttonPrimary: {
    backgroundColor: "#1F2937",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
  },
  buttonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    flex: 1,
    maxWidth: "48%",
  },
});
