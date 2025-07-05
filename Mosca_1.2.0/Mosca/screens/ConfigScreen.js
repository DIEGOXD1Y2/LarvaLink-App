import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';


export default function ConfigScreen() {
  const [incubadora, setIncubadora] = useState(null);
  const API_URL = 'http://192.168.0.11:3000/incubadora'; // Cambia si es necesario
  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        console.log('📦 Datos incubadora:', res.data);
        setIncubadora(res.data);
      })
      .catch(err => {
        console.error('Error al obtener datos:', err);
        setIncubadora(null);
      });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.text}>Aquí puedes poner opciones de configuración</Text>
              <ScrollView contentContainerStyle={styles.innerContainer}>
                {incubadora ? (
                  <View style={styles.card}>
                    <Text style={styles.sectionTitle}>⚙️ Configuración</Text>
                    <Text style={styles.item}>Temp Mín: {incubadora.configuracionRango.tempMin} °C</Text>
                    <Text style={styles.item}>Temp Máx: {incubadora.configuracionRango.tempMax} °C</Text>
                    <Text style={styles.item}>Humedad Mín: {incubadora.configuracionRango.humedadMin} %</Text>
                    <Text style={styles.item}>Humedad Máx: {incubadora.configuracionRango.humedadMax} %</Text>
                  </View>
                ) : (
                  <Text style={{ textAlign: 'center', marginTop: 20 }}>Cargando datos o sin datos disponibles</Text>
                )}
              </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  innerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});
