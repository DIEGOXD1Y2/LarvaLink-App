import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, ActivityIndicator, Dimensions, ScrollView, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
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

  if (loading) return <ActivityIndicator size="large" color="#000" />;
  if (!datos || datos.length === 0) return <Text>No hay datos para esta fecha y hora</Text>;

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
  const chartWidth = Math.max(Dimensions.get('window').width, etiquetas.length * 60);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
          style={{ width: chartWidth }}
        >
          <LineChart
            data={{
              labels: etiquetas,
              datasets: [{
                data: humedades,
                color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
              }],
            }}
            width={chartWidth}
            height={260}
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
                  top: y - 20,
                  left: x - 10,
                  fontSize: 10,
                  color: '#36a2eb',
                }}
              >
                {humedades[index]}%
              </Text>
            )}
            chartConfig={{
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: () => '#000',
              labelColor: () => '#333',
              propsForDots: {
                r: '5',
                strokeWidth: '2',
                stroke: '#36a2eb',
              },
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        </ViewShot>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  // Si deseas agregar estilos como en TemperaturaChart
});

export default HumedadChart;
