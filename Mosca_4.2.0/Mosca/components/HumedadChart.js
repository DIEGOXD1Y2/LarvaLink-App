import React, {useEffect,useState,useRef,forwardRef,useImperativeHandle} from 'react';
import {View,Text,ActivityIndicator,Dimensions,ScrollView,StyleSheet} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import ViewShot from 'react-native-view-shot';

const HumedadChart = forwardRef(({ fecha }, ref) => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [intervaloMin, setIntervaloMin] = useState(2);
  const [error, setError] = useState(null);
  const viewShotRef = useRef();

  useImperativeHandle(ref, () => ({
    capturar: async () => {
      if (viewShotRef.current) {
        return await viewShotRef.current.capture();
      }
    }
  }));

  useEffect(() => {
    if (!fecha) return;

    const fechaStr = fecha.toISOString().split('T')[0];
    const API_URL = `http://10.165.146.235:3000/humedadpromedio?fecha=${fechaStr}`;

    setLoading(true);
    setError(null);

    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setDatos(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fecha]);

  if (loading) return <ActivityIndicator size="large" color="#000" />;
  if (error)
    return (
      <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>
        {error}
      </Text>
    );
  if (datos.length === 0) return <Text>No hay datos para esta fecha</Text>;

  const calcularPromedioPorIntervalo = (datos, intervalo) => {
    if (datos.length === 0) return [];

    const inicio = new Date(datos[0].fechaRegistro);
    const grupos = {};

    datos.forEach(d => {
      const fecha = new Date(d.fechaRegistro);
      const minutosRel = Math.floor((fecha - inicio) / 60000);
      const bloque = Math.floor(minutosRel / intervalo);
      if (!grupos[bloque]) {
        grupos[bloque] = { suma: 0, cuenta: 0, bloque };
      }
      grupos[bloque].suma += d.humedadPromedio ?? d.humedad;
      grupos[bloque].cuenta++;
    });

    return Object.values(grupos)
      .sort((a, b) => a.bloque - b.bloque)
      .map(g => ({
        bloque: g.bloque,
        promedio: g.suma / g.cuenta
      }));
  };

  const promedios = calcularPromedioPorIntervalo(datos, intervaloMin);

  const etiquetas = promedios.map(p => {
    const totalMin = p.bloque * intervaloMin;
    const h = Math.floor(totalMin / 60).toString().padStart(2, '0');
    const m = (totalMin % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  });

  const humedades = promedios.map(p => parseFloat(p.promedio.toFixed(1)));
  const chartWidth = Math.max(
    Dimensions.get('window').width,
    etiquetas.length * 50
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Intervalo (min):</Text>
        <Picker
          selectedValue={intervaloMin}
          onValueChange={value => setIntervaloMin(value)}
          style={styles.picker}
        >
          <Picker.Item label="2 minutos" value={2} />
          <Picker.Item label="4 minutos" value={4} />
          <Picker.Item label="6 minutos" value={6} />
          <Picker.Item label="10 minutos" value={10} />
          <Picker.Item label="15 minutos" value={15} />
        </Picker>
      </View>

      <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <LineChart
            data={{
              labels: etiquetas,
              datasets: [
                {
                  data: humedades,
                  color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`
                }
              ],
              legend: ['Humedad (%)']
            }}
            width={chartWidth}
            height={260}
            yAxisSuffix="%"
            fromZero
            yAxisInterval={10}
            segments={6}
            withInnerLines
            withDots
            withLegend={true}
            renderDotContent={({ x, y, index }) => (
              <Text
                key={index}
                style={{
                  position: 'absolute',
                  top: y - 20,
                  left: x - 10,
                  fontSize: 10,
                  color: '#3696eb'
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
                stroke: '#3696eb'
              }
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
    paddingHorizontal: 10
  },
  label: {
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 16
  },
  picker: {
    flex: 1
  }
});

export default HumedadChart;