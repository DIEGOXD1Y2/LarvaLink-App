import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, ActivityIndicator, Dimensions, ScrollView, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import ViewShot from 'react-native-view-shot';

const TemperaturaChart = forwardRef(({ fecha, formato = 'C' }, ref) => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intervaloMin, setIntervaloMin] = useState(2);
  const [unidadTemp, setUnidadTemp] = useState(formato);
  const viewShotRef = useRef();

  // Permitir captura desde el padre, con opción de formato
  useImperativeHandle(ref, () => ({
    capturar: async (options = { format: 'png', quality: 1.0 }) => {
      if (viewShotRef.current) {
        return await viewShotRef.current.capture?.(options);
      }
    }
  }));

  useEffect(() => {
    if (!fecha) return;

    const fechaStr = fecha.toISOString().split('T')[0];
    const API_URL = `http://10.165.146.235:3000/lecturaspromedio?fecha=${fechaStr}`;

    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setDatos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fecha]);

  if (loading) return <ActivityIndicator size="large" color="#000" />;
  if (datos.length === 0) return <Text>No hay datos para esta fecha</Text>;

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

  const convertir = (tempC) => {
    if (unidadTemp === 'F') return tempC * 9 / 5 + 32;
    if (unidadTemp === 'K') return tempC + 273.15;
    return tempC;
  };

  const temperaturas = datosFiltrados.map(d => parseFloat(convertir(d.temperaturaPromedio).toFixed(1)));

  const chartWidth = Math.max(Dimensions.get('window').width, etiquetas.length * 50);
  const sufijo = unidadTemp === 'F' ? '°F' : unidadTemp === 'K' ? 'K' : '°C';

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Intervalo (min):</Text>
        <Picker selectedValue={intervaloMin} onValueChange={setIntervaloMin} style={styles.picker}>
          <Picker.Item label="2 minutos" value={2} />
          <Picker.Item label="4 minutos" value={4} />
          <Picker.Item label="6 minutos" value={6} />
          <Picker.Item label="10 minutos" value={10} />
          <Picker.Item label="15 minutos" value={15} />
        </Picker>

        <Text style={styles.label}>Temperatura:</Text>
        <Picker selectedValue={unidadTemp} onValueChange={setUnidadTemp} style={styles.picker}>
          <Picker.Item label="Celsius (°C)" value="C" />
          <Picker.Item label="Fahrenheit (°F)" value="F" />
          <Picker.Item label="Kelvin (K)" value="K" />
        </Picker>
      </View>

      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={{
              labels: etiquetas,
              datasets: [{
                data: temperaturas,
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
              }],
            }}
            width={chartWidth}
            height={260}
            yAxisSuffix={sufijo}
            fromZero
            yAxisInterval={4}
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
                  color: '#ff6384',
                }}
              >
                {temperaturas[index]}°
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
                stroke: '#ff6384',
              },
            }}
            bezier
            style={{ borderRadius: 12 }}
          />
        </ScrollView>
      </ViewShot>
    </View>
  );
});

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 16,
  },
  picker: {
    flex: 1,
  },
});

export default TemperaturaChart;