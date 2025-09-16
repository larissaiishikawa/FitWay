import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.welcomeContainer}>
        <ThemedText type="title" style={styles.welcomeTitle}>
          Bem vindo ao FitWay! 🏃‍♂️
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Seu companheiro de fitness
        </ThemedText>
        <ThemedText style={styles.description}>
          Comece sua jornada fitness hoje mesmo. Acompanhe seus treinos, defina
          metas e alcance seus objetivos com o FitWay.
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeContainer: {
    alignItems: "center",
    maxWidth: 300,
  },
  welcomeTitle: {
    textAlign: "center",
    marginBottom: 16,
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    fontSize: 18,
    opacity: 0.8,
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
    fontSize: 16,
    opacity: 0.7,
  },
});
