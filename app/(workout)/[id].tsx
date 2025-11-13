// FILE: app/workout/[id].tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

type Exercise = {
  name: string;
  sets: string;
  reps: string;
};

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Estados de Dados e Edição
  const [workoutData, setWorkoutData] = useState<any>(null); // Dados originais
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedExercises, setEditedExercises] = useState<Exercise[]>([]);

  // --- LÓGICA DO CRONÔMETRO GLOBAL (Tempo de Treino) ---
  const [globalSeconds, setGlobalSeconds] = useState(0);
  const [isGlobalActive, setIsGlobalActive] = useState(false);
  const globalIntervalRef = useRef<number | null>(null);

  // --- LÓGICA DO CRONÔMETRO DE DESCANSO (Modal) ---
  const [restModalVisible, setRestModalVisible] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);
  const restIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'workouts', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setWorkoutData(data);
          setEditedName(data.name);
          setEditedExercises(data.exercises || []);
        } else {
          Alert.alert('Erro', 'Treino não encontrado');
          router.back();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, [id]);

  useEffect(() => {
    if (isGlobalActive) {
      globalIntervalRef.current = setInterval(() => {
        setGlobalSeconds((s) => s + 1);
      }, 1000);
    } else if (!isGlobalActive && globalIntervalRef.current) {
      clearInterval(globalIntervalRef.current);
    }
    return () => {
      if (globalIntervalRef.current) clearInterval(globalIntervalRef.current);
    };
  }, [isGlobalActive]);

  // Rest Timer
  useEffect(() => {
    if (isRestActive) {
      restIntervalRef.current = setInterval(() => {
        setRestSeconds((s) => s + 1);
      }, 1000);
    } else if (!isRestActive && restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
    }
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isRestActive]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };


  const handleSave = async () => {
    try {
      const docRef = doc(db, 'workouts', id as string);
      await updateDoc(docRef, {
        name: editedName,
        exercises: editedExercises
      });
      
      setWorkoutData({ ...workoutData, name: editedName, exercises: editedExercises });
      setIsEditing(false);
      Alert.alert('Sucesso', 'Treino atualizado!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const handleDeleteWorkout = () => {
    Alert.alert('Excluir Treino', 'Tem certeza? Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Excluir', 
        style: 'destructive', 
        onPress: async () => {
            await deleteDoc(doc(db, 'workouts', id as string));
            router.back();
        }
      }
    ]);
  };

  const updateExerciseField = (index: number, field: keyof Exercise, value: string) => {
    const updated = [...editedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setEditedExercises(updated);
  };

  const removeExercise = (index: number) => {
    const updated = editedExercises.filter((_, i) => i !== index);
    setEditedExercises(updated);
  };

  const addNewExercise = () => {
    setEditedExercises([...editedExercises, { name: '', sets: '', reps: '' }]);
  };

  const toggleGlobal = () => setIsGlobalActive(!isGlobalActive);
  const resetGlobal = () => { setIsGlobalActive(false); setGlobalSeconds(0); };

  const openRestTimer = () => {
    setRestSeconds(0);
    setIsRestActive(true);
    setRestModalVisible(true);
  };
  const closeRestTimer = () => {
    setIsRestActive(false);
    setRestModalVisible(false);
  };

  if (loading) return <View style={styles.container}><Text style={{marginTop:50, textAlign:'center'}}>Carregando...</Text></View>;

  return (
    <View style={styles.container}>
      
      <View style={styles.headerDashboard}>
        <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>{isEditing ? "Editando Treino" : "Treino em Andamento"}</Text>
            
            <TouchableOpacity onPress={() => {
                if (isEditing) handleSave(); 
                else setIsEditing(true);
            }} style={styles.saveEditButton}>
                <Text style={styles.saveEditText}>{isEditing ? "Salvar" : "Editar"}</Text>
            </TouchableOpacity>
        </View>

        {/* Cronômetro Global */}
        {!isEditing && (
            <View style={styles.timerDashboard}>
                <Text style={styles.globalTimerLabel}>Tempo Total</Text>
                <Text style={styles.globalTimerValue}>{formatTime(globalSeconds)}</Text>
                <View style={styles.globalControls}>
                    <TouchableOpacity onPress={toggleGlobal} style={styles.globalControlBtn}>
                        <Ionicons name={isGlobalActive ? "pause" : "play"} size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={resetGlobal} style={styles.globalControlBtn}>
                        <Ionicons name="refresh" size={24} color="#1F2937" />
                    </TouchableOpacity>
                </View>
            </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Nome do Treino */}
        <View style={styles.nameSection}>
            {isEditing ? (
                <View>
                    <Text style={styles.label}>Nome do Treino</Text>
                    <TextInput 
                        style={styles.inputMain} 
                        value={editedName} 
                        onChangeText={setEditedName} 
                    />
                </View>
            ) : (
                <Text style={styles.workoutNameDisplay}>{workoutData?.name}</Text>
            )}
        </View>

        {/* Lista de Exercícios */}
        <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Exercícios</Text>
            {isEditing && (
                <TouchableOpacity onPress={handleDeleteWorkout}>
                    <Text style={{color:'#EF4444', fontWeight:'bold'}}>Excluir Treino</Text>
                </TouchableOpacity>
            )}
        </View>

        {editedExercises.map((ex, index) => (
          <View key={index} style={styles.card}>
            {isEditing ? (
                // --- MODO EDIÇÃO ---
                <View style={styles.editModeCard}>
                    <View style={styles.editHeader}>
                        <Text style={styles.editIndex}>#{index + 1}</Text>
                        <TouchableOpacity onPress={() => removeExercise(index)}>
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                    
                    <TextInput 
                        style={styles.input} 
                        value={ex.name} 
                        placeholder="Nome do Exercício"
                        onChangeText={(t) => updateExerciseField(index, 'name', t)}
                    />
                    <View style={styles.rowInputs}>
                        <TextInput 
                            style={[styles.input, {flex:1, marginRight:8}]} 
                            value={ex.sets} 
                            placeholder="Séries"
                            keyboardType="numeric"
                            onChangeText={(t) => updateExerciseField(index, 'sets', t)}
                        />
                        <TextInput 
                            style={[styles.input, {flex:1}]} 
                            value={ex.reps} 
                            placeholder="Reps"
                            onChangeText={(t) => updateExerciseField(index, 'reps', t)}
                        />
                    </View>
                </View>
            ) : (
                // --- MODO VISUALIZAÇÃO ---
                <View style={styles.viewModeCard}>
                    <View style={styles.exerciseNumber}>
                        <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.exerciseName}>{ex.name}</Text>
                        <Text style={styles.exerciseMeta}>{ex.sets} séries • {ex.reps}</Text>
                    </View>
                    {/* Botão de Descanso */}
                    <TouchableOpacity style={styles.timerButtonIcon} onPress={openRestTimer}>
                        <Ionicons name="timer-outline" size={24} color="#3B82F6" />
                        <Text style={styles.restText}>Descanso</Text>
                    </TouchableOpacity>
                </View>
            )}
          </View>
        ))}

        {/* Botão Adicionar Exercício (Só no Edit) */}
        {isEditing && (
            <TouchableOpacity style={styles.addExerciseBtn} onPress={addNewExercise}>
                <Ionicons name="add-circle" size={24} color="#1F2937" />
                <Text style={styles.addExerciseText}>Adicionar Exercício</Text>
            </TouchableOpacity>
        )}

        {/* Espaçador para o fim da rolagem */}
        <View style={{height: 100}} /> 
      </ScrollView>

      {/* MODAL DO TIMER DE DESCANSO 
      */}
      <Modal animationType="fade" transparent={true} visible={restModalVisible} onRequestClose={closeRestTimer}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Descanso</Text>
                <TouchableOpacity onPress={closeRestTimer}>
                    <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
            </View>
            
            <Text style={styles.restTimerText}>{formatTime(restSeconds)}</Text>

            <View style={styles.modalControls}>
                <TouchableOpacity onPress={() => { setIsRestActive(!isRestActive) }} style={styles.modalBtnMain}>
                    <Ionicons name={isRestActive ? "pause" : "play"} size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setRestSeconds(0); setIsRestActive(false); }} style={styles.modalBtnSec}>
                    <Ionicons name="refresh" size={24} color="#374151" />
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 15,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  exerciseNumber: {
    backgroundColor: '#E5E7EB',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    fontWeight: 'bold',
    color: '#374151',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  exerciseMeta: {
    color: '#6B7280',
    marginTop: 2,
  },
  timerButtonIcon: {
    padding: 8,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#1F2937',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
  },

  // Modal Timer Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  timerDisplay: {
    marginBottom: 30,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerHint: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  modalBtnSec: {
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header styles
  headerDashboard: {
    backgroundColor: '#1F2937',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconButton: {
    padding: 8,
  },
  saveEditButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  saveEditText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Timer Dashboard
  timerDashboard: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: 'center',
  },
  globalTimerLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  globalTimerValue: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    marginBottom: 12,
  },
  globalControls: {
    flexDirection: 'row',
    gap: 12,
  },
  globalControlBtn: {
    backgroundColor: '#E5E7EB',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Name Section
  nameSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputMain: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  workoutNameDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  // List Section
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  // Edit Mode Styles
  editModeCard: {
    width: '100%',
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editIndex: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 10,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 8,
  },
  // View Mode Styles
  viewModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  restText: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 4,
  },
  // Add Exercise Button
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    gap: 8,
  },
  addExerciseText: {
    color: '#1F2937',
    fontWeight: '600',
    fontSize: 14,
  },
  // Modal Styles
  restTimerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
    marginVertical: 20,
  },
  modalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
  },
  modalBtnMain: {
    backgroundColor: '#3B82F6',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});