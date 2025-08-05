import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import axios from 'axios';
import IP from '../components/config';

export default function ConfigScreen() {
  const [incubadora, setIncubadora] = useState(null);
  const API_URL = `${IP}/configuracion/1`; // Actualiza con tu endpoint correcto

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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>AJUSTES DE RANGOS</Text>

          {incubadora ? (
            <View style={styles.valoresCard}>
              <Text style={styles.subtitle}>VALORES ACTUALES:</Text>
              <Text style={styles.item}><Text style={styles.itemLabel}>Temperatura mínima:</Text> {incubadora.tempMin} °C</Text>
              <Text style={styles.item}><Text style={styles.itemLabel}>Temperatura máxima:</Text> {incubadora.tempMax} °C</Text>
              <Text style={styles.item}><Text style={styles.itemLabel}>Humedad mínima:</Text> {incubadora.humedadMin} %</Text>
              <Text style={styles.item}><Text style={styles.itemLabel}>Humedad máxima:</Text> {incubadora.humedadMax} %</Text>
            </View>
          ) : (
            <Text style={{ textAlign: 'center', marginBottom: 16 }}>Cargando datos o sin datos disponibles</Text>
          )}

          <Text style={styles.subtitle}> Rango de Temperatura</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="MIN"
              value={nuevaConfig.tempMin}
              onChangeText={text => setNuevaConfig({ ...nuevaConfig, tempMin: soloNumeros(text) })}
            />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="MAX"
              value={nuevaConfig.tempMax}
              onChangeText={text => setNuevaConfig({ ...nuevaConfig, tempMax: soloNumeros(text) })}
            />
          </View>

          <Text style={styles.subtitle}>💧 Rango de Humedad</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="MIN"
              value={nuevaConfig.humedadMin}
              onChangeText={text => setNuevaConfig({ ...nuevaConfig, humedadMin: soloNumeros(text) })}
            />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="MAX"
              value={nuevaConfig.humedadMax}
              onChangeText={text => setNuevaConfig({ ...nuevaConfig, humedadMax: soloNumeros(text) })}
            />
          </View>

          {/* Botón para establecer rangos por defecto */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#3b82f6', marginBottom: 10 }]}
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
            <Text style={styles.buttonText}>USAR VALORES POR DEFECTO</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={guardarCambios}>
            <Text style={styles.buttonText}>GUARDAR CAMBIOS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#1b5e20',
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#1b5e20',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  input: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    textAlign: 'center',
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#4ade80',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  valoresCard: {
    backgroundColor: '#f1f8e9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  item: {
    fontSize: 15,
    marginVertical: 2,
  },
  itemLabel: {
    fontWeight: 'bold',
    color: '#1b5e20',
  },
});
