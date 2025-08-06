import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
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

      // Crear fecha local sin conversión UTC
      const fechaLocal = new Date();
      const fechaRegistro = new Date(fechaLocal.getTime() - (fechaLocal.getTimezoneOffset() * 60000));

      await axios.put(`${BASE_URL}/componentes/estado/${idComponente}`, {
        estado: valor,
        idInfoIncubadora: 1, // Cambia este valor si manejas más incubadoras
        fechaRegistro: fechaRegistro.toISOString(), // Enviar fecha ajustada
        // O alternativamente, enviar como timestamp local:
        // fechaRegistro: Date.now(),
        // O como fecha formateada local:
        // fechaRegistro: formatearFechaLocal(new Date())
      });
    } catch (err) {
      Alert.alert('Error', 'No se pudo actualizar el estado.');
      console.error('Error al actualizar estado:', err);
      // Revertir cambio local si falla el request
      setEstados(prev => ({
        ...prev,
        [nombreCampo]: !valor
      }));
    } finally {
      setActualizando(false);
    }
  };

  // Función auxiliar para formatear fecha local (alternativa)
  const formatearFechaLocal = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hours = String(fecha.getHours()).padStart(2, '0');
    const minutes = String(fecha.getMinutes()).padStart(2, '0');
    const seconds = String(fecha.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const getComponentIcon = (tipo, nombre) => {
    if (tipo === 'actuador') {
      if (nombre.toLowerCase().includes('calefac')) return '🔥';
      if (nombre.toLowerCase().includes('ventilador')) return '💨';
      if (nombre.toLowerCase().includes('humidif')) return '💧';
      return '⚙️';
    }
    return '📊';
  };

  const getComponentType = (tipo) => {
    return tipo === 'actuador' ? 'ACTUADOR' : 'SENSOR';
  };

  const getStatusColor = (estado) => {
    return estado ? '#4CAF50' : '#FF5722';
  };

  if (cargando) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Cargando componentes...</Text>
        </View>
      </View>
    );
  }

  if (Object.keys(estados).length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataIcon}>🔧</Text>
          <Text style={styles.noDataText}>No hay componentes disponibles</Text>
          <Text style={styles.noDataSubtext}>Verifique la conexión del sistema</Text>
        </View>
      </View>
    );
  }

  // Separar actuadores y sensores
  const actuadores = Object.keys(estados).filter(key => 
    componentesData[key]?.tipo === 'actuador'
  );
  const sensores = Object.keys(estados).filter(key => 
    componentesData[key]?.tipo === 'sensor'
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            <Text style={styles.title}>Control de Sistema</Text>
            <Text style={styles.subtitle}>Gestión en tiempo real de componentes</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: actualizando ? '#FFC107' : '#4CAF50' }]} />
              <Text style={styles.statusText}>
                {actualizando ? 'Actualizando...' : 'Sistema Listo'}
              </Text>
            </View>
            {/* Mostrar zona horaria actual para debug */}
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>
                Zona horaria: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </Text>
              <Text style={styles.debugText}>
                Hora local: {new Date().toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Actuadores Section */}
        {actuadores.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.iconText}>⚙️</Text>
              </View>
              <Text style={styles.sectionTitle}>ACTUADORES</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{actuadores.length}</Text>
              </View>
            </View>

            <View style={styles.componentsContainer}>
              {actuadores.map(key => (
                <View key={key} style={styles.componentCard}>
                  <View style={styles.componentHeader}>
                    <View style={styles.componentIconContainer}>
                      <Text style={styles.componentIcon}>
                        {getComponentIcon(componentesData[key]?.tipo, componentesData[key]?.nombre)}
                      </Text>
                    </View>
                    <View style={styles.componentInfo}>
                      <Text style={styles.componentName}>
                        {componentesData[key]?.nombre || key}
                      </Text>
                      <Text style={styles.componentType}>
                        {getComponentType(componentesData[key]?.tipo)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.controlContainer}>
                    <View style={[styles.statusIndicatorSmall, { backgroundColor: getStatusColor(estados[key]) }]}>
                      <Text style={styles.statusIndicatorText}>
                        {estados[key] ? 'ON' : 'OFF'}
                      </Text>
                    </View>
                    <Switch
                      value={estados[key]}
                      onValueChange={(valor) => actualizarEstado(key, valor)}
                      disabled={actualizando}
                      trackColor={{ false: "#E0E0E0", true: "#81C784" }}
                      thumbColor={estados[key] ? "#4CAF50" : "#BDBDBD"}
                      style={styles.switch}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Sensores Section */}
        {sensores.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Text style={styles.iconText}>📊</Text>
              </View>
              <Text style={styles.sectionTitle}>SENSORES</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{sensores.length}</Text>
              </View>
            </View>

            <View style={styles.componentsContainer}>
              {sensores.map(key => (
                <View key={key} style={styles.componentCard}>
                  <View style={styles.componentHeader}>
                    <View style={styles.componentIconContainer}>
                      <Text style={styles.componentIcon}>
                        {getComponentIcon(componentesData[key]?.tipo, componentesData[key]?.nombre)}
                      </Text>
                    </View>
                    <View style={styles.componentInfo}>
                      <Text style={styles.componentName}>
                        {componentesData[key]?.nombre || key}
                      </Text>
                      <Text style={styles.componentType}>
                        {getComponentType(componentesData[key]?.tipo)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.controlContainer}>
                    <View style={[styles.statusIndicatorSmall, { backgroundColor: getStatusColor(estados[key]) }]}>
                      <Text style={styles.statusIndicatorText}>
                        {estados[key] ? 'ON' : 'OFF'}
                      </Text>
                    </View>
                    <Switch
                      value={estados[key]}
                      onValueChange={(valor) => actualizarEstado(key, valor)}
                      disabled={actualizando}
                      trackColor={{ false: "#E0E0E0", true: "#64B5F6" }}
                      thumbColor={estados[key] ? "#2196F3" : "#BDBDBD"}
                      style={styles.switch}
                    />
                  </View>
                </View>
              ))}
            </View>
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
    backgroundColor: '#1565C0',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#BBDEFB',
    marginBottom: 15,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#E3F2FD',
    fontSize: 14,
    fontWeight: '500',
  },
  debugInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  debugText: {
    color: '#E3F2FD',
    fontSize: 11,
    marginBottom: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  countBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  componentsContainer: {
    gap: 12,
  },
  componentCard: {
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
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  componentIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  componentIcon: {
    fontSize: 24,
  },
  componentInfo: {
    flex: 1,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  componentType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  controlContainer: {
    alignItems: 'center',
    gap: 8,
  },
  statusIndicatorSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 40,
    alignItems: 'center',
  },
  statusIndicatorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
});
