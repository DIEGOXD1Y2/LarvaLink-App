import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';

export default function HomeScreen({ userIdentifier, navigation, onLogout }) {
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
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>{userIdentifier || 'Usuario'}</Text>

        {incubadora ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>📊 Estado Actual</Text>
            <Text style={styles.item}>🌡️ Temperatura: {incubadora.temperActual} °C</Text>
            <Text style={styles.item}>💧 Humedad: {incubadora.humedActual} %</Text>
            <Text style={styles.item}>Sensor Temp: {incubadora.estSensorTemp ? '✅' : '❌'}</Text>
            <Text style={styles.item}>Sensor Hum: {incubadora.estSensorHum ? '✅' : '❌'}</Text>
            <Text style={styles.item}>Ventilador: {incubadora.estVentilador ? 'Encendido' : 'Apagado'}</Text>
            <Text style={styles.item}>Humificador: {incubadora.estHumificador ? 'Encendido' : 'Apagado'}</Text>
            <Text style={styles.item}>Calefactor: {incubadora.estCalefactor ? 'Encendido' : 'Apagado'}</Text>
          </View>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Cargando datos o sin datos disponibles</Text>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={onLogout}
      >
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#f1f8e9',
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#33691e',
  },
  item: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#d32f2f',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
