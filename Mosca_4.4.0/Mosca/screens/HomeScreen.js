import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import IP from '../components/config';

const API_URL = `${IP}/incubadora`;

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

  const getStatusColor = (status) => {
    return status ? '#4CAF50' : '#FF5722';
  };

  const getStatusText = (status) => {
    return status ? 'ENCENDIDO' : 'APAGADO';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.userName}>{nombreCompleto || 'Usuario'}</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: cargando ? '#FFC107' : '#4CAF50' }]} />
              <Text style={styles.statusText}>
                {cargando ? 'Sincronizando...' : 'Sistema Activo'}
              </Text>
            </View>
          </View>
        </View>

        {cargando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Cargando datos del sistema...</Text>
          </View>
        ) : incubadora ? (
          <>
            {/* Environmental Parameters Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Text style={styles.iconText}>🌡️</Text>
                </View>
                <Text style={styles.sectionTitle}>PARÁMETROS AMBIENTALES</Text>
              </View>

              {/* Sensor Cards */}
              <View style={styles.sensorsRow}>
                <View style={[styles.sensorCard, styles.sensorCardA]}>
                  <Text style={styles.sensorLabel}>SENSOR A</Text>
                  <View style={styles.sensorData}>
                    <Text style={styles.sensorValue}>{incubadora.temperaturaSensor1 ?? '---'}</Text>
                    <Text style={styles.sensorUnit}>°C</Text>
                  </View>
                  <View style={styles.sensorData}>
                    <Text style={styles.sensorValue}>{incubadora.humedadSensor1 ?? '---'}</Text>
                    <Text style={styles.sensorUnit}>%</Text>
                  </View>
                </View>

                <View style={[styles.sensorCard, styles.sensorCardB]}>
                  <Text style={styles.sensorLabel}>SENSOR B</Text>
                  <View style={styles.sensorData}>
                    <Text style={styles.sensorValue}>{incubadora.temperaturaSensor2 ?? '---'}</Text>
                    <Text style={styles.sensorUnit}>°C</Text>
                  </View>
                  <View style={styles.sensorData}>
                    <Text style={styles.sensorValue}>{incubadora.humedadSensor2 ?? '---'}</Text>
                    <Text style={styles.sensorUnit}>%</Text>
                  </View>
                </View>
              </View>

              {/* Average Values Card */}
              <View style={styles.averageCard}>
                <Text style={styles.averageTitle}>PROMEDIOS DEL SISTEMA</Text>
                <View style={styles.averageRow}>
                  <View style={styles.averageItem}>
                    <Text style={styles.averageLabel}>Temperatura</Text>
                    <Text style={styles.averageValue}>
                      {incubadora.temperaturaPromedio ? incubadora.temperaturaPromedio.toFixed(1) : '---'} °C
                    </Text>
                  </View>
                  <View style={styles.averageDivider} />
                  <View style={styles.averageItem}>
                    <Text style={styles.averageLabel}>Humedad</Text>
                    <Text style={styles.averageValue}>
                      {incubadora.humedadPromedio ? incubadora.humedadPromedio.toFixed(1) : '---'} %
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Actuators Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Text style={styles.iconText}>⚙️</Text>
                </View>
                <Text style={styles.sectionTitle}>ESTADO DE ACTUADORES</Text>
              </View>

              <View style={styles.actuatorsContainer}>
                <View style={styles.actuatorCard}>
                  <View style={styles.actuatorHeader}>
                    <Text style={styles.actuatorIcon}>🔥</Text>
                    <Text style={styles.actuatorName}>Calefacción</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incubadora.estCalefactor) }]}>
                    <Text style={styles.statusBadgeText}>{getStatusText(incubadora.estCalefactor)}</Text>
                  </View>
                </View>

                <View style={styles.actuatorCard}>
                  <View style={styles.actuatorHeader}>
                    <Text style={styles.actuatorIcon}>💨</Text>
                    <Text style={styles.actuatorName}>Ventilador</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incubadora.estVentilador) }]}>
                    <Text style={styles.statusBadgeText}>{getStatusText(incubadora.estVentilador)}</Text>
                  </View>
                </View>

                <View style={styles.actuatorCard}>
                  <View style={styles.actuatorHeader}>
                    <Text style={styles.actuatorIcon}>💧</Text>
                    <Text style={styles.actuatorName}>Humidificador</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incubadora.estHumificador) }]}>
                    <Text style={styles.statusBadgeText}>{getStatusText(incubadora.estHumificador)}</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataIcon}>📊</Text>
            <Text style={styles.noDataText}>Sin datos disponibles</Text>
            <Text style={styles.noDataSubtext}>Verifique la conexión del sistema</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    backgroundColor: '#2E7D32',
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
    marginTop: 15,
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
    backgroundColor: '#E8F5E9',
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
  sensorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  sensorCard: {
    flex: 0.48,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  sensorCardA: {
    backgroundColor: '#E3F2FD',
  },
  sensorCardB: {
    backgroundColor: '#FFF3E0',
  },
  sensorLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  sensorData: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565C0',
  },
  sensorUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  averageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  averageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 15,
    textAlign: 'center',
  },
  averageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  averageItem: {
    flex: 1,
    alignItems: 'center',
  },
  averageDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  averageLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  averageValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  actuatorsContainer: {
    gap: 12,
  },
  actuatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
  actuatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actuatorIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  actuatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
  },
});