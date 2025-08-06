import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, TouchableOpacity, Platform
} from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import IP from '../components/config';

const AlertasScreen = () => {
  const [alertas, setAlertas] = useState([]);
  const [activaciones, setActivaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [mapaComponentes, setMapaComponentes] = useState({});
  const [tipoSeleccionado, setTipoSeleccionado] = useState('temperatura');

  // Crear mapeo estático de incubadoras
  const crearMapaIncubadoras = () => {
    const mapa = {};
    for (let i = 1; i <= 20; i++) {
      mapa[i] = `Incubadora ${i}`;
    }
    return mapa;
  };

  const [mapaIncubadoras] = useState(crearMapaIncubadoras());

  // Función para formatear fecha para el endpoint
  const formatoFecha = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Función para mostrar fecha en formato legible
  const formatoFechaLegible = (fecha) => {
    const opciones = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  };

  // Función para extraer solo la hora de una fecha ISO (sin conversión)
  const extraerHora = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    // Extraer solo la parte de la hora del string ISO
    const match = fechaISO.match(/T(\d{2}:\d{2}:\d{2})/);
    return match ? match[1] : fechaISO;
  };

  // Función para extraer solo la fecha de una fecha ISO
  const extraerFecha = (fechaISO) => {
    if (!fechaISO) return 'N/A';
    // Extraer solo la parte de la fecha del string ISO
    const match = fechaISO.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : fechaISO;
  };

  // Cargar componentes
  const cargarComponentes = async () => {
  try {
    const res = await axios.get(`${IP}/componentes`);
    const componentes = res.data;
    const mapa = {};    
    componentes.forEach(c => {
      mapa[c._id] = c.nombreComponente;
    });
    
    setMapaComponentes(mapa);
  } catch (err) {
    console.error('❌ Error al cargar componentes:', err.message);
  }
};

  const cargarAlertas = async () => {
    if (!fechaSeleccionada) {
      console.warn('Fecha seleccionada inválida');
      return;
    }

    setCargando(true);
    setError(null);

    const fechaFormateada = formatoFecha(fechaSeleccionada);
    const url = `${IP}/alertas/fecha?fecha=${fechaFormateada}`;
    try {
      const res = await axios.get(url);
      const data = res.data;
      // Ordenar alertas por fecha (más recientes PRIMERO)
      const alertasOrdenadas = (data.alertas || []).sort((a, b) =>
        new Date(b.fechaHora) - new Date(a.fechaHora)
      );

      const activacionesOrdenadas = (data.activaciones || []).sort((a, b) =>
        new Date(b.fechaRegistro) - new Date(a.fechaRegistro)
      );

      setAlertas(alertasOrdenadas);
      setActivaciones(activacionesOrdenadas);
    } catch (err) {
      console.error('❌ Error al cargar alertas:', err);
      setError(`Error: ${err.response?.status || 'Conexión'}`);
      setAlertas([]);
      setActivaciones([]);
    } finally {
      setCargando(false);
    }
  };

  const onChangeFecha = (event, selectedDate) => {
    setMostrarPicker(false);
    
    if (event.type === 'dismissed') {
      return;
    }
    
    if (selectedDate) {
      setFechaSeleccionada(selectedDate);
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

  // Separar alertas por tipo
  const alertasTemperatura = alertas.filter(alerta => alerta.tipo === 'temperatura');
  const alertasHumedad = alertas.filter(alerta => alerta.tipo === 'humedad');

  // Opciones de filtro
  const opcionesFiltro = [
    {
      id: 'temperatura',
      titulo: 'Temperatura',
      icon: '🌡️',
      color: '#FF5722',
      bgColor: '#FFF3E0',
      count: alertasTemperatura.length
    },
    {
      id: 'humedad',
      titulo: 'Humedad',
      icon: '💧',
      color: '#2196F3',
      bgColor: '#E3F2FD',
      count: alertasHumedad.length
    },
    {
      id: 'activaciones',
      titulo: 'Activaciones',
      icon: '⚙️',
      color: '#9C27B0',
      bgColor: '#F3E5F5',
      count: activaciones.length
    }
  ];

  const renderAlertaTemperatura = (alerta, index) => {
    const nombreComponente = mapaComponentes[alerta.idComponente] || `Componente ${alerta.idComponente}`;
    const nombreIncubadora = mapaIncubadoras[alerta.idInfoIncubadora] || `Incubadora ${alerta.idInfoIncubadora}`;
    const cond = alerta.condicion === 'mayor' ? 'supera' : 'está por debajo de';

    return (
      <View key={`temp-${index}`} style={[styles.alertCard, styles.temperatureCard]}>
        {/* Header elegante */}
        <View style={styles.alertHeader}>
          <View style={[styles.alertIconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.alertIcon}>🌡️</Text>
          </View>
          <View style={styles.alertInfo}>
            <Text style={styles.alertType}>ALERTA DE TEMPERATURA</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.alertTime}>⏰ {extraerHora(alerta.fechaHora)}</Text>
              <Text style={styles.alertDate}>📅 {extraerFecha(alerta.fechaHora)}</Text>
            </View>
          </View>
          <View style={[styles.severityBadge, styles.temperatureBadge]}>
            <Text style={styles.severityText}>CRÍTICO</Text>
          </View>
        </View>
        
        {/* Descripción principal */}
        <View style={styles.mainDescription}>
          <Text style={styles.alertDescription}>
            El valor de temperatura <Text style={styles.alertValue}>{alerta.valor}°C</Text> {cond} el umbral establecido de{' '}
            <Text style={styles.alertThreshold}>{alerta.umbral}°C</Text>
          </Text>
        </View>

      </View>
    );
  };

  const renderAlertaHumedad = (alerta, index) => {
    const nombreComponente = mapaComponentes[alerta.idComponente] || `Componente ${alerta.idComponente}`;
    const nombreIncubadora = mapaIncubadoras[alerta.idInfoIncubadora] || `Incubadora ${alerta.idInfoIncubadora}`;
    const cond = alerta.condicion === 'mayor' ? 'supera' : 'está por debajo de';

    return (
      <View key={`hum-${index}`} style={[styles.alertCard, styles.humidityCard]}>
        {/* Header elegante */}
        <View style={styles.alertHeader}>
          <View style={[styles.alertIconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.alertIcon}>💧</Text>
          </View>
          <View style={styles.alertInfo}>
            <Text style={styles.alertType}>ALERTA DE HUMEDAD</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.alertTime}>⏰ {extraerHora(alerta.fechaHora)}</Text>
              <Text style={styles.alertDate}>📅 {extraerFecha(alerta.fechaHora)}</Text>
            </View>
          </View>
          <View style={[styles.severityBadge, styles.humidityBadge]}>
            <Text style={styles.severityText}>CRÍTICO</Text>
          </View>
        </View>
        
        {/* Descripción principal */}
        <View style={styles.mainDescription}>
          <Text style={styles.alertDescription}>
            El valor de humedad <Text style={styles.alertValue}>{alerta.valor}%</Text> {cond} el umbral establecido de{' '}
            <Text style={styles.alertThreshold}>{alerta.umbral}%</Text>
          </Text>
        </View>
      </View>
    );
  };

  const renderActivacion = (item, index) => {
    const nombreComponente = mapaComponentes[item.idComponente] || `Componente ${item.idComponente}`;
    const nombreIncubadora = mapaIncubadoras[item.idInfoIncubadora] || `Incubadora ${item.idInfoIncubadora}`;

    return (
      <View key={`act-${index}`} style={[styles.alertCard, styles.activationCard]}>
        {/* Header elegante */}
        <View style={styles.alertHeader}>
          <View style={[styles.alertIconContainer, { backgroundColor: '#F3E5F5' }]}>
            <Text style={styles.alertIcon}>⚙️</Text>
          </View>
          <View style={styles.alertInfo}>
            <Text style={styles.alertType}>ACTIVACIÓN: {nombreComponente.toUpperCase()}</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.alertTime}>⏰ {extraerHora(item.fechaRegistro)}</Text>
              <Text style={styles.alertDate}>📅 {extraerFecha(item.fechaRegistro)}</Text>
            </View>
          </View>
          <View style={[styles.severityBadge, styles.activationBadge]}>
            <Text style={styles.severityText}>INFO</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderContenidoSeleccionado = () => {
    if (cargando) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF5722" />
          <Text style={styles.loadingText}>Cargando datos de la base de datos...</Text>
          <Text style={styles.loadingSubtext}>
            📅 Fecha: {formatoFecha(fechaSeleccionada)}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={cargarAlertas}
          >
            <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    let contenido = [];
    let sinDatos = false;

    switch (tipoSeleccionado) {
      case 'temperatura':
        if (alertasTemperatura.length === 0) {
          sinDatos = true;
        } else {
          contenido = alertasTemperatura.map(renderAlertaTemperatura);
        }
        break;
      case 'humedad':
        if (alertasHumedad.length === 0) {
          sinDatos = true;
        } else {
          contenido = alertasHumedad.map(renderAlertaHumedad);
        }
        break;
      case 'activaciones':
        if (activaciones.length === 0) {
          sinDatos = true;
        } else {
          contenido = activaciones.map(renderActivacion);
        }
        break;
    }

    if (sinDatos) {
      const opcionActual = opcionesFiltro.find(op => op.id === tipoSeleccionado);
      return (
        <View style={[styles.noAlertsContainer, { backgroundColor: opcionActual.bgColor }]}>
          <Text style={styles.noAlertsIcon}>{opcionActual.icon}</Text>
          <Text style={styles.noAlertsText}>Sin registros de {opcionActual.titulo.toLowerCase()}</Text>
          <Text style={styles.noAlertsSubtext}>
            No hay datos en la base de datos para {formatoFechaLegible(fechaSeleccionada)}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.alertsContainer}>
        {contenido}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerGradient}>
          <Text style={styles.title}>Alertas</Text>
          <Text style={styles.subtitle}>Visualización directa de datos almacenados</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: cargando ? '#FFC107' : '#4CAF50' }]} />
            <Text style={styles.statusText}>
              {cargando ? 'Consultando BD...' : 'Datos actualizados'}
            </Text>
          </View>
        </View>
      </View>

      {/* Date Selector */}
      <TouchableOpacity onPress={() => setMostrarPicker(true)} style={styles.dateSelector}>
        <View style={styles.dateSelectorContent}>
          <Text style={styles.dateSelectorIcon}>📅</Text>
          <View style={styles.dateSelectorInfo}>
            <Text style={styles.dateSelectorLabel}>Fecha de consulta</Text>
            <Text style={styles.dateSelectorDate}>{formatoFechaLegible(fechaSeleccionada)}</Text>
            <Text style={styles.dateSelectorDateISO}>Formato BD: {formatoFecha(fechaSeleccionada)}</Text>
          </View>
        </View>
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

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterScrollContainer}
        >
          {opcionesFiltro.map((opcion) => (
            <TouchableOpacity
              key={opcion.id}
              style={[
                styles.filterTab,
                tipoSeleccionado === opcion.id && styles.filterTabActive,
                { borderColor: opcion.color, backgroundColor: tipoSeleccionado === opcion.id ? opcion.bgColor : '#FFFFFF' }
              ]}
              onPress={() => setTipoSeleccionado(opcion.id)}
            >
              <View style={styles.filterTabContent}>
                <Text style={styles.filterTabIcon}>{opcion.icon}</Text>
                <View style={styles.filterTabInfo}>
                  <Text style={[
                    styles.filterTabText,
                    tipoSeleccionado === opcion.id && styles.filterTabTextActive
                  ]}>
                    {opcion.titulo}
                  </Text>
                  <View style={[styles.filterTabBadge, { backgroundColor: opcion.color }]}>
                    <Text style={styles.filterTabBadgeText}>{opcion.count}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content Section */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={cargando} onRefresh={cargarAlertas} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Header */}
        <View style={styles.sectionHeaderContainer}>
          <View style={styles.sectionHeader}>
            <View style={[
              styles.sectionIcon,
              tipoSeleccionado === 'temperatura' && styles.temperatureSection,
              tipoSeleccionado === 'humedad' && styles.humiditySection,
              tipoSeleccionado === 'activaciones' && styles.activationSection
            ]}>
              <Text style={styles.sectionIconText}>
                {opcionesFiltro.find(op => op.id === tipoSeleccionado)?.icon}
              </Text>
            </View>
            <Text style={styles.sectionTitle}>
              {opcionesFiltro.find(op => op.id === tipoSeleccionado)?.titulo.toUpperCase()}
            </Text>
            <View style={[
              styles.countBadge,
              tipoSeleccionado === 'temperatura' && styles.temperatureCountBadge,
              tipoSeleccionado === 'humedad' && styles.humidityCountBadge,
              tipoSeleccionado === 'activaciones' && styles.activationCountBadge
            ]}>
              <Text style={styles.countText}>
                {opcionesFiltro.find(op => op.id === tipoSeleccionado)?.count}
              </Text>
            </View>
          </View>
        </View>

        {/* Dynamic Content */}
        {renderContenidoSeleccionado()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  headerGradient: {
    backgroundColor: '#ce1313ff',
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
    color: '#C5CAE9',
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
    color: '#E8EAF6',
    fontSize: 14,
    fontWeight: '500',
  },
  dateSelector: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1A237E',
  },
  dateSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateSelectorIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  dateSelectorInfo: {
    flex: 1,
  },
  dateSelectorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dateSelectorDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 2,
  },
  dateSelectorDateISO: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterScrollContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterTab: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    minWidth: 140,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabActive: {
    borderWidth: 2,
  },
  filterTabContent: {
    alignItems: 'center',
  },
  filterTabIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  filterTabInfo: {
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  filterTabTextActive: {
    color: '#333',
  },
  filterTabBadge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterTabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sectionHeaderContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  temperatureSection: {
    backgroundColor: '#FFF3E0',
  },
  humiditySection: {
    backgroundColor: '#E3F2FD',
  },
  activationSection: {
    backgroundColor: '#F3E5F5',
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  countBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  temperatureCountBadge: {
    backgroundColor: '#FF5722',
  },
  humidityCountBadge: {
    backgroundColor: '#2196F3',
  },
  activationCountBadge: {
    backgroundColor: '#9C27B0',
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: 30,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  errorText: {
    color: '#C62828',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#FF5722',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  noAlertsContainer: {
    alignItems: 'center',
    borderRadius: 16,
    padding: 40,
    marginBottom: 20,
  },
  noAlertsIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noAlertsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  noAlertsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
  },
  alertsContainer: {
    gap: 16,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    borderLeftWidth: 5,
  },
  temperatureCard: {
    borderLeftColor: '#FF5722',
  },
  humidityCard: {
    borderLeftColor: '#2196F3',
  },
  activationCard: {
    borderLeftColor: '#9C27B0',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  alertIcon: {
    fontSize: 24,
  },
  alertInfo: {
    flex: 1,
  },
  alertType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  alertTime: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  alertDate: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  temperatureBadge: {
    backgroundColor: '#FF5722',
  },
  humidityBadge: {
    backgroundColor: '#2196F3',
  },
  activationBadge: {
    backgroundColor: '#9C27B0',
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  mainDescription: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  alertDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
  },
  alertValue: {
    fontWeight: 'bold',
    color: '#FF5722',
    fontSize: 16,
  },
  alertThreshold: {
    fontWeight: 'bold',
    color: '#4CAF50',
    fontSize: 16,
  },
  technicalInfo: {
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  timestampContainer: {
    marginTop: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
  },
  timestampLabel: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '500',
    marginBottom: 4,
  },
  timestampValue: {
    fontSize: 11,
    color: '#1976D2',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
});

export default AlertasScreen;
