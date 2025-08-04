import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity, Platform
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';

const AlertasScreen = () => {
  const [alertas, setAlertas] = useState([]);
  const [activaciones, setActivaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [mapaComponentes, setMapaComponentes] = useState({});

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
  const formatoFecha = (fecha) => fecha.toISOString().split('T')[0];
//url
  const cargarComponentes = async () => {
    try {
      const res = await axios.get('http://10.165.146.235:3000/componentes');
      const componentes = res.data;

      const mapa = {};
      componentes.forEach(c => {
        mapa[c._id] = c.nombreComponente;
      });
      setMapaComponentes(mapa);
    } catch (err) {
      console.error('Error al cargar componentes:', err);
    }
  };

  const cargarAlertas = async () => {
  if (!fechaSeleccionada) {
    console.warn('Fecha seleccionada inválida, no se carga alertas');
    return;
  }

  setCargando(true);
  setError(null);

  // Cambiar la URL para usar query string "fecha"
  const url = `http://10.165.146.235:3000/alertas/fecha?fecha=${formatoFecha(fechaSeleccionada)}`;

  try {
    const res = await axios.get(url);
    const data = res.data;

    if (!data || !Array.isArray(data.alertas) || !Array.isArray(data.activaciones)) {
      setError('❌ Respuesta inesperada del servidor');
      setAlertas([]);
      setActivaciones([]);
    } else {
      setAlertas(data.alertas);
      setActivaciones(data.activaciones);
    }
  } catch (err) {
    if (err.response?.status === 404) {
      console.warn('⚠️ Ruta no encontrada (404), ignorando este error');
      setAlertas([]);
      setActivaciones([]);
    } else {
      console.error('Error al cargar alertas:', err);
      setError('❌ Error al obtener alertas del servidor');
      setAlertas([]);
      setActivaciones([]);
    }
  } finally {
    setCargando(false);
  }
};




  const onChangeFecha = (event, selectedDate) => {
    if (selectedDate) {
      setFechaSeleccionada(selectedDate);
      setMostrarPicker(Platform.OS === 'ios');
      cargarAlertas();
    } else {
      setMostrarPicker(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarComponentes();
      cargarAlertas();
    }, [fechaSeleccionada])
  );

  useEffect(() => {
    const interval = setInterval(cargarAlertas, 60000);
    return () => clearInterval(interval);
  }, [fechaSeleccionada]);

  const renderAlerta = (alerta, index) => {
    const hora = new Date(alerta.fechaHora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const emoji = alerta.tipo === 'temperatura' ? '🌡️' : '💧';
    const color = alerta.tipo === 'temperatura' ? '#d84315' : '#0288d1';
    const cond = alerta.condicion === 'mayor' ? 'supera' : 'está por debajo de';

    return (
      <View key={`alert-${index}`} style={[styles.cardAlerta, { borderLeftColor: color }]}>
        <Text style={[styles.tipoAlerta, { color }]}>
          {emoji} {capitalize(alerta.tipo)}
        </Text>
        <Text style={styles.descripcionAlerta}>
          Valor <Text style={styles.valor}>{alerta.valor.toFixed(1)}</Text> {cond} el umbral <Text style={styles.umbral}>{alerta.umbral}</Text>.
        </Text>
        <Text style={styles.horaAlerta}>Hora: {hora}</Text>
      </View>
    );
  };

  const renderActivacion = (item, index) => {
    const hora = new Date(item.fechaRegistro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nombre = mapaComponentes[item.idComponente] || `ID ${item.idComponente}`;
    return (
      <View key={`act-${index}`} style={[styles.cardAlerta, { borderLeftColor: '#6a1b9a' }]}>
        <Text style={[styles.tipoAlerta, { color: '#6a1b9a' }]}>⚙️ Activación de actuador</Text>
        <Text style={styles.descripcionAlerta}>
          El componente <Text style={styles.valor}>{nombre}</Text> fue activado.
        </Text>
        <Text style={styles.horaAlerta}>Hora: {hora}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setMostrarPicker(true)} style={styles.fechaSelector}>
        <Text style={styles.fechaTexto}> {formatoFecha(fechaSeleccionada)}</Text>
      </TouchableOpacity>

      {mostrarPicker && (
        <DateTimePicker
          value={fechaSeleccionada}
          mode="date"
          display="default"
          onChange={onChangeFecha}
          maximumDate={new Date()}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.innerContainer}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargarAlertas} />}
      >
        <Text style={styles.title}>Alertas</Text>

        {cargando && (
          <View style={styles.cargandoContainer}>
            <ActivityIndicator size="large" color="#c62828" />
            <Text style={styles.cargandoTexto}>Cargando alertas...</Text>
          </View>
        )}

        {!cargando && error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTexto}>{error}</Text>
          </View>
        )}

        {!cargando && !error && alertas.length === 0 && activaciones.length === 0 && (
          <View style={styles.cardSinAlertas}>
            <Text style={styles.itemVerde}>✅ No se detectaron alertas ni activaciones</Text>
          </View>
        )}

        {!cargando && !error && (
          <>
            {alertas.map(renderAlerta)}
            {activaciones.map(renderActivacion)}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  innerContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 20,
    textAlign: 'center',
  },
  fechaSelector: {
    backgroundColor: '#fff8e1',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#ffb300',
  },
  fechaTexto: {
    fontSize: 16,
    color: '#ff6f00',
    fontWeight: '600',
  },
  cardAlerta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  tipoAlerta: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  descripcionAlerta: {
    fontSize: 16,
    color: '#333',
  },
  valor: {
    fontWeight: '700',
    color: '#d84315',
  },
  umbral: {
    fontWeight: '700',
    color: '#2e7d32',
  },
  horaAlerta: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  cardSinAlertas: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: '#2e7d32',
    alignItems: 'center',
  },
  itemVerde: {
    fontSize: 16,
    color: '#2e7d32',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    marginBottom: 12,
  },
  errorTexto: {
    color: '#b71c1c',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  cargandoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  cargandoTexto: {
    marginTop: 10,
    fontSize: 16,
    color: '#c62828',
  },
});

export default AlertasScreen;