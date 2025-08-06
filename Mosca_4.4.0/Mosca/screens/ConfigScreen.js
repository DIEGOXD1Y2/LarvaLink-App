import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import axios from 'axios';
import IP from '../components/config';

export default function ConfigScreen() {
  const [incubadora, setIncubadora] = useState(null);
  const API_URL = `${IP}/configuracion/1`;
  const [nuevaConfig, setNuevaConfig] = useState({
    tempMin: '',
    tempMax: '',
    humedadMin: '',
    humedadMax: ''
  });

  const validarCampos = () => {
    const { tempMin, tempMax, humedadMin, humedadMax } = nuevaConfig;
    if (!tempMin || !tempMax || !humedadMin || !humedadMax) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return false;
    }
    const tMin = parseFloat(tempMin);
    const tMax = parseFloat(tempMax);
    const hMin = parseFloat(humedadMin);
    const hMax = parseFloat(humedadMax);
    if ([tMin, tMax, hMin, hMax].some(isNaN)) {
      Alert.alert("Error", "Los valores deben ser numéricos.");
      return false;
    }
    if (tMin >= tMax) {
      Alert.alert("Error", "Temperatura mínima debe ser menor que la máxima.");
      return false;
    }
    if (hMin >= hMax) {
      Alert.alert("Error", "Humedad mínima debe ser menor que la máxima.");
      return false;
    }
    return true;
  };

  const guardarCambios = () => {
    if (!validarCampos()) return;
    axios.put(API_URL, {
      tempMin: parseFloat(nuevaConfig.tempMin),
      tempMax: parseFloat(nuevaConfig.tempMax),
      humedadMin: parseFloat(nuevaConfig.humedadMin),
      humedadMax: parseFloat(nuevaConfig.humedadMax),
    })
      .then(res => {
        Alert.alert("Éxito", "Configuración actualizada correctamente");
        setIncubadora(res.data);
      })
      .catch(err => {
        console.error('Error al guardar configuración:', err);
        Alert.alert("Error", "No se pudo actualizar la configuración. Revisa la conexión o los datos.");
      });
  };

  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        setIncubadora(res.data);
        setNuevaConfig({
          tempMin: res.data.tempMin.toString(),
          tempMax: res.data.tempMax.toString(),
          humedadMin: res.data.humedadMin.toString(),
          humedadMax: res.data.humedadMax.toString()
        });
      })
      .catch(err => {
        console.error('Error al obtener datos:', err);
        setIncubadora(null);
        Alert.alert("Error", "No se pudieron obtener los datos. Verifica la conexión.");
      });
  }, []);

  const soloNumeros = (text) => {
    return text.replace(/[^0-9.]/g, '');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 60}
    >
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.headerGradient}>
              <Text style={styles.welcomeText}>Configuración</Text>
              <Text style={styles.userName}>Control de Rangos</Text>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: '#66BB6A' }]} />
                <Text style={styles.statusText}>Sistema de Control Activo</Text>
              </View>
            </View>
          </View>

          {/* Current Values Section */}
          {incubadora ? (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={styles.iconText}>📊</Text>
                </View>
                <Text style={styles.sectionTitle}>VALORES ACTUALES</Text>
              </View>

              <View style={styles.currentValuesRow}>
                <View style={[styles.currentValueCard, styles.tempCard]}>
                  <Text style={styles.currentValueLabel}>🌡️ TEMPERATURA</Text>
                  <View style={styles.rangeContainer}>
                    <View style={styles.rangeItem}>
                      <Text style={[styles.rangeValue, { color: '#1976D2' }]}>{incubadora.tempMin}</Text>
                      <Text style={styles.rangeUnit}>°C MIN</Text>
                    </View>
                    <View style={styles.rangeDivider} />
                    <View style={styles.rangeItem}>
                      <Text style={[styles.rangeValue, { color: '#D32F2F' }]}>{incubadora.tempMax}</Text>
                      <Text style={styles.rangeUnit}>°C MAX</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.currentValueCard, styles.humidityCard]}>
                  <Text style={styles.currentValueLabel}>💧 HUMEDAD</Text>
                  <View style={styles.rangeContainer}>
                    <View style={styles.rangeItem}>
                      <Text style={[styles.rangeValue, { color: '#F57C00' }]}>{incubadora.humedadMin}</Text>
                      <Text style={styles.rangeUnit}>% MIN</Text>
                    </View>
                    <View style={styles.rangeDivider} />
                    <View style={styles.rangeItem}>
                      <Text style={[styles.rangeValue, { color: '#7B1FA2' }]}>{incubadora.humedadMax}</Text>
                      <Text style={styles.rangeUnit}>% MAX</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>⏳ Cargando configuración...</Text>
            </View>
          )}

          {/* Temperature Configuration Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#FFEBEE' }]}>
                <Text style={styles.iconText}>🌡️</Text>
              </View>
              <Text style={styles.sectionTitle}>CONFIGURAR TEMPERATURA</Text>
            </View>

            <View style={[styles.configCard, { borderLeftColor: '#F44336' }]}>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: '#1976D2' }]}>MÍNIMA</Text>
                  <TextInput
                    style={[styles.input, { borderColor: '#2196F3', color: '#1976D2' }]}
                    keyboardType="numeric"
                    placeholder="27"
                    placeholderTextColor="#90CAF9"
                    value={nuevaConfig.tempMin}
                    onChangeText={text => setNuevaConfig({ ...nuevaConfig, tempMin: soloNumeros(text) })}
                  />
                  <Text style={[styles.inputUnit, { color: '#1976D2' }]}>°C</Text>
                </View>
                <View style={styles.inputDivider} />
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: '#D32F2F' }]}>MÁXIMA</Text>
                  <TextInput
                    style={[styles.input, { borderColor: '#F44336', color: '#D32F2F' }]}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor="#FFAB91"
                    value={nuevaConfig.tempMax}
                    onChangeText={text => setNuevaConfig({ ...nuevaConfig, tempMax: soloNumeros(text) })}
                  />
                  <Text style={[styles.inputUnit, { color: '#D32F2F' }]}>°C</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Humidity Configuration Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#F3E5F5' }]}>
                <Text style={styles.iconText}>💧</Text>
              </View>
              <Text style={styles.sectionTitle}>CONFIGURAR HUMEDAD</Text>
            </View>

            <View style={[styles.configCard, { borderLeftColor: '#9C27B0' }]}>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: '#F57C00' }]}>MÍNIMA</Text>
                  <TextInput
                    style={[styles.input, { borderColor: '#FF9800', color: '#F57C00' }]}
                    keyboardType="numeric"
                    placeholder="70"
                    placeholderTextColor="#FFCC02"
                    value={nuevaConfig.humedadMin}
                    onChangeText={text => setNuevaConfig({ ...nuevaConfig, humedadMin: soloNumeros(text) })}
                  />
                  <Text style={[styles.inputUnit, { color: '#F57C00' }]}>%</Text>
                </View>
                <View style={styles.inputDivider} />
                <View style={styles.inputContainer}>
                  <Text style={[styles.inputLabel, { color: '#7B1FA2' }]}>MÁXIMA</Text>
                  <TextInput
                    style={[styles.input, { borderColor: '#9C27B0', color: '#7B1FA2' }]}
                    keyboardType="numeric"
                    placeholder="90"
                    placeholderTextColor="#CE93D8"
                    value={nuevaConfig.humedadMax}
                    onChangeText={text => setNuevaConfig({ ...nuevaConfig, humedadMax: soloNumeros(text) })}
                  />
                  <Text style={[styles.inputUnit, { color: '#7B1FA2' }]}>%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Text style={styles.iconText}>⚙️</Text>
              </View>
              <Text style={styles.sectionTitle}>ACCIONES</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.defaultButton}
                onPress={() => {
                  setNuevaConfig({
                    tempMin: '27',
                    tempMax: '30',
                    humedadMin: '70',
                    humedadMax: '90'
                  });
                  Alert.alert("Rangos por defecto", "Se aplicaron los valores:\nTemperatura: 27–30 °C\nHumedad: 70–90 %");
                }}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonIcon}>🔄</Text>
                  <Text style={styles.defaultButtonText}>USAR VALORES POR DEFECTO</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={guardarCambios}>
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonIcon}>💾</Text>
                  <Text style={styles.saveButtonText}>GUARDAR CAMBIOS</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerContainer: {
    marginBottom: 25,
  },
  headerGradient: {
    backgroundColor: '#7B1FA2',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#A5D6A7',
    fontWeight: '500',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#E8F5E9',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    flex: 1,
  },
  currentValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currentValueCard: {
    flex: 0.48,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  tempCard: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  humidityCard: {
    backgroundColor: '#FFF3E0',
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  currentValueLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeItem: {
    flex: 1,
    alignItems: 'center',
  },
  rangeDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  rangeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  rangeUnit: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    alignItems: 'center',
  },
  inputDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#FAFAFA',
    marginBottom: 4,
  },
  inputUnit: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  defaultButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  defaultButtonText: {
    color: '#FF9800',
    fontWeight: 'bold',
    fontSize: 14,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
