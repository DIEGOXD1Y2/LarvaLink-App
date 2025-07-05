import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen({ userIdentifier, navigation, onLogout }) {
  // Valores simulados (pueden venir de props, estado o API real)
  const temperatura = 27.4;
  const humedad = 58;
  const actuadores = {
    calefaccion: false,
    ventilador: true,
    humidificador: true,
  };
  const alerta = temperatura > 30 || humedad < 40;

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>{userIdentifier || 'Usuario'}</Text>

        {/* Indicadores de clima */}
        <View style={styles.dataBox}>
          <Text style={styles.label}>Temperatura promedio:</Text>
          <Text style={styles.value}>{temperatura} °C</Text>
        </View>

        <View style={styles.dataBox}>
          <Text style={styles.label}>Humedad promedio:</Text>
          <Text style={styles.value}>{humedad} %</Text>
        </View>

        {/* Estado de actuadores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actuadores</Text>
          <Text>Calefacción: {actuadores.calefaccion ? 'Encendida' : 'Apagada'}</Text>
          <Text>Ventilador: {actuadores.ventilador ? 'Encendido' : 'Apagado'}</Text>
          <Text>Humidificador: {actuadores.humidificador ? 'Encendido' : 'Apagado'}</Text>
        </View>

        {/* Indicador de alerta */}


        {/* Botón de cerrar sesión */}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8f5e9', justifyContent: 'center', paddingHorizontal: 20 },
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
  title: { fontSize: 28, fontWeight: 'bold', color: '#1b5e20', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#333', marginBottom: 25 },
  dataBox: {
    backgroundColor: '#f1f8e9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
  },
  label: { fontSize: 16, color: '#555' },
  value: { fontSize: 20, fontWeight: 'bold', color: '#33691e' },
  section: { marginVertical: 10, width: '100%' },
  sectionTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  alertBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#c8e6c9',
    width: '100%',
    alignItems: 'center',
  },
  alertActive: {
    backgroundColor: '#ffcdd2',
  },
  alertText: {
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
