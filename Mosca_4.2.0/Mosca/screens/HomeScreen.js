import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

const API_URL = 'http://10.165.146.235:3000/incubadora';

export default function HomeScreen({ userData }) {
  const [incubadora, setIncubadora] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = () => {
    setCargando(true);
    axios.get(API_URL)
      .then(res => {
        setIncubadora(res.data);
        setCargando(false);
      })
      .catch(err => {
        console.error('Error al obtener datos:', err);
        setIncubadora(null);
        setCargando(false);
      });
  };

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  const nombreCompleto = `${userData?.nombre || ''} ${userData?.primerApell || ''} ${userData?.segundoApell || ''}`.trim();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>{nombreCompleto || 'Usuario'}</Text>

        {cargando ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Cargando datos...</Text>
        ) : incubadora ? (
          <>
            <Text style={styles.sectionTitle}>PARÁMETROS DE AMBIENTE</Text>

            <View style={styles.card}>
              <Text style={styles.item}>Temp. Sensor A: {incubadora.temperaturaSensor1 ?? '---'} °C</Text>
              <Text style={styles.item}>Humedad Sensor A: {incubadora.humedadSensor1 ?? '---'} %</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.item}>Temp. Sensor B: {incubadora.temperaturaSensor2 ?? '---'} °C</Text>
              <Text style={styles.item}>Humedad Sensor B: {incubadora.humedadSensor2 ?? '---'} %</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.item}>Temperatura Promedio: {incubadora.temperaturaPromedio?.toFixed(1) ?? '---'} °C</Text>
              <Text style={styles.item}>Humedad Promedio: {incubadora.humedadPromedio?.toFixed(1) ?? '---'} %</Text>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>ACTUADORES / ESTADO ACTUAL</Text>
            <View style={styles.card}>
              <Text style={styles.item}>Calefacción: {incubadora.estCalefactor ? 'encendido' : 'apagado'}</Text>
              <Text style={styles.item}>Ventilador: {incubadora.estVentilador ? 'encendido' : 'apagado'}</Text>
              <Text style={styles.item}>Humificador: {incubadora.estHumificador ? 'encendido' : 'apagado'}</Text>
            </View>
          </>
        ) : (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>Sin datos disponibles</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#33691e',
  },
  card: {
    backgroundColor: '#f1f8e9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  item: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
});
