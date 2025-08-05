import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import IP from '../components/config';

const BASE_URL = IP; // Asegúrate de que esta IP coincida con tu servidor

export default function ControlScreen() {
  const [estados, setEstados] = useState({});
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [componentesData, setComponentesData] = useState({});

  useEffect(() => {
    axios.get(`${BASE_URL}/incubadora/1`)
      .then(res => {
        const raw = res.data;
        const transformedEstados = {};
        const componentesCompletos = {};

        Object.keys(raw).forEach(key => {
          const { estado, id, nombre } = raw[key];
          const match = key.match(/^(sensor|actuador)_(.+)_(\d+)$/);
          if (!match) return;

          const tipo = match[1];
          const nombreClave = match[2];
          // Aquí incluimos el id en el key para que sea único y coincida con backend
          const label = `${tipo}_${nombreClave}_${id}`;

          transformedEstados[label] = estado;
          componentesCompletos[label] = { id, nombre, tipo };
        });

        setEstados(transformedEstados);
        setComponentesData(componentesCompletos);
        setCargando(false);
      })
      .catch(err => {
        console.error('Error al obtener componentes:', err);
        Alert.alert('Error', 'No se pudieron cargar los componentes.');
        setCargando(false);
      });
  }, []);

  const actualizarEstado = async (nombreCampo, valor) => {
    if (actualizando) return;
    setActualizando(true);

    const componente = componentesData[nombreCampo];
    const idComponente = componente?.id;

    if (!idComponente) {
      Alert.alert('Error', `No se encontró el ID para ${nombreCampo}`);
      setActualizando(false);
      return;
    }

    // Validar que valor sea booleano
    if (typeof valor !== 'boolean') {
      Alert.alert('Error', 'El estado debe ser booleano');
      setActualizando(false);
      return;
    }

    try {
      setEstados(prev => ({
        ...prev,
        [nombreCampo]: valor
      }));

      await axios.put(`${BASE_URL}/componentes/estado/${idComponente}`, {
        estado: valor,
        idInfoIncubadora: 1 // Cambia este valor si manejas más incubadoras
      });
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el estado.');
      console.error(err);
      // Revertir cambio local si falla el request
      setEstados(prev => ({
        ...prev,
        [nombreCampo]: !valor
      }));
    } finally {
      setActualizando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.container}>
        <Text style={{ fontSize: 16 }}>Cargando datos...</Text>
      </View>
    );
  }

  if (Object.keys(estados).length === 0) {
    return (
      <View style={styles.container}>
        <Text>No hay componentes para mostrar.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Control de Componentes</Text>
        <Text style={styles.subtitle}>Interruptores para actuar en tiempo real</Text>

        {Object.keys(estados).map(key => (
          <View key={key} style={styles.card}>
            <Text style={styles.item}>{componentesData[key]?.nombre || key}</Text>
            <Switch
              value={estados[key]}
              onValueChange={(valor) => actualizarEstado(key, valor)}
              disabled={actualizando}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={estados[key] ? "#f5dd4b" : "#f4f3f4"}
            />
          </View>
        ))}
      </View>
    </ScrollView>
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
  card: {
    backgroundColor: '#f1f8e9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    fontSize: 16,
    color: '#333',
  },
});



