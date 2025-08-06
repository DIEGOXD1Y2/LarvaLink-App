import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, ActivityIndicator, Dimensions, ScrollView, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import ViewShot from 'react-native-view-shot';
import IP from './config';

const HumedadChart = forwardRef(({ fecha, hora }, ref) => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intervaloMin, setIntervaloMin] = useState(2);
  const viewShotRef = useRef();

  useImperativeHandle(ref, () => ({
    capturar: async (options = { format: 'png', quality: 1.0 }) => {
      if (viewShotRef.current) {
        return await viewShotRef.current.capture?.(options);
      }
    }
  }));

  useEffect(() => {
    if (!fecha || !hora) return;

    const fechaStr = fecha.toISOString().split('T')[0];
    const horaStr = `${hora.getHours().toString().padStart(2, '0')}:${hora.getMinutes().toString().padStart(2, '0')}`;
    const API_URL = `${IP}/humedadpromedio?fecha=${fechaStr}&hora=${horaStr}`;

    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const filtrados = data.filter(d =>
            d &&
            d.fechaRegistro &&
            typeof d.humedad === 'number' &&
            !isNaN(d.humedad)
          );
          setDatos(filtrados);
        } else {
          setDatos([]);
        }
      })
      .catch(() => {
        setDatos([]);
      })
      .finally(() => setLoading(false));
  }, [fecha, hora]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Cargando datos de humedad...</Text>
      </View>
    );
  }

  if (!datos || datos.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataIcon}>💧</Text>
        <Text style={styles.noDataText}>Sin datos disponibles</Text>
        <Text style={styles.noDataSubtext}>No hay registros para esta fecha y hora</Text>
      </View>
    );
  }

  const inicio = new Date(datos[0].fechaRegistro);
  const minutosRelativos = (fechaHora) => {
    return Math.floor((new Date(fechaHora) - inicio) / 60000);
  };

  const datosFiltrados = datos.filter(d => {
    const diffMinutos = minutosRelativos(d.fechaRegistro);
    return diffMinutos % intervaloMin === 0;
  });

  const etiquetas = datosFiltrados.map(d => {
    const diffMin = minutosRelativos(d.fechaRegistro);
    const h = Math.floor(diffMin / 60).toString().padStart(2, '0');
    const m = (diffMin % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  const humedades = datosFiltrados.map(d => parseFloat(d.humedad.toFixed(1)));
  const chartWidth = Math.max(Dimensions.get('window').width - 80, etiquetas.length * 60);

  return (
    <View style={styles.container}>
      {/* Controls Section */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlCard}>
          <View style={styles.controlHeader}>
            <View style={[styles.controlIcon, { backgroundColor: '#E3F2FD' }]}>
              <Text style={styles.controlIconText}>⏱️</Text>
            </View>
            <Text style={styles.controlTitle}>Intervalo de Tiempo</Text>
          </View>
          <Picker 
            selectedValue={intervaloMin} 
            onValueChange={setIntervaloMin} 
            style={styles.picker}
          >
            <Picker.Item label="2 minutos" value={2} />
            <Picker.Item label="4 minutos" value={4} />
            <Picker.Item label="6 minutos" value={6} />
            <Picker.Item label="10 minutos" value={10} />
            <Picker.Item label="15 minutos" value={15} />
          </Picker>
        </View>
      </View>

      {/* Chart Section */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>💧 Gráfica de Humedad</Text>
          <Text style={styles.chartSubtitle}>
            {datos.length} registros • Intervalo: {intervaloMin} min • Unidad: %
          </Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          style={styles.chartScrollView}
        >
          <ViewShot
            ref={viewShotRef}
            options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
            style={styles.chartContainer}
          >
            <LineChart
              data={{
                labels: etiquetas,
                datasets: [{
                  data: humedades,
                  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                  strokeWidth: 3,
                }],
              }}
              width={chartWidth}
              height={280}
              yAxisSuffix="%"
              fromZero
              yAxisInterval={5}
              segments={6}
              withInnerLines
              withDots
              withLegend={false}
              renderDotContent={({ x, y, index }) => (
                <Text
                  key={index}
                  style={{
                    position: 'absolute',
                    top: y - 25,
                    left: x - 15,
                    fontSize: 10,
                    color: '#2196F3',
                    fontWeight: 'bold',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  {humedades[index]}%
                </Text>
              )}
              chartConfig={{
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '3',
                  stroke: '#2196F3',
                  fill: '#FFFFFF',
                },
                propsForBackgroundLines: {
                  strokeDasharray: '',
                  stroke: '#E0E0E0',
                  strokeWidth: 1,
                },
              }}
              bezier
              style={styles.chart}
            />
          </ViewShot>
        </ScrollView>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  controlCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  controlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  controlIconText: {
    fontSize: 14,
  },
  controlTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 4,
  },
  chartSection: {
    flex: 1,
  },
  chartHeader: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  chartScrollView: {
    flex: 1,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
  },
  chart: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
  },
});

export default HumedadChart;
