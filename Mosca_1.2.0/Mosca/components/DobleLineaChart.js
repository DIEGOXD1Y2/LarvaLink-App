import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';

const DobleLineaChart = () => {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://192.168.0.11:3000/lecturas'; // 🟢 Cambia esta IP si es necesario

  // Obtener datos de la API
useEffect(() => {
  axios.get(API_URL)
    .then((res) => {
      console.log("📊 Datos recibidos:", res.data);
      setDatos(res.data);
    })
    .catch((err) => console.error('Error al obtener datos:', err))
    .finally(() => setLoading(false));
}, []);


  // Si aún está cargando
  if (loading) {
    return (
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: 'white' }}>Cargando gráfico...</Text>
      </View>
    );
  }

  // Si no hay datos
  if (datos.length === 0) {
    return <Text style={{ textAlign: 'center', color: 'white' }}>No hay datos disponibles</Text>;
  }

  // Convertir fechas a etiquetas
  const etiquetas = datos.map((d) => {
    const fecha = new Date(d.fecha);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}-${mes}`;
  });

  // Separar valores numéricos
  const temperaturas = datos.map((d) => d.temperatura);
  const humedades = datos.map((d) => d.humedad);

  return (
    <LineChart
      data={{
        labels: etiquetas,
        datasets: [
          {
            data: temperaturas,
            color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
            strokeWidth: 3,
          },
          {
            data: humedades,
            color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
            strokeWidth: 3,
          },
        ],
        legend: ['Temperatura (°C)', 'Humedad (%)'],
      }}
      width={Dimensions.get('window').width - 30}
      height={260}
      yAxisSuffix=""
      chartConfig={{
        backgroundColor: '#1E1E2F',
        backgroundGradientFrom: '#1E1E2F',
        backgroundGradientTo: '#1E1E2F',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        propsForDots: {
          r: '4',
          strokeWidth: '2',
          stroke: '#fff',
        },
      }}
      bezier
      style={{
        marginVertical: 10,
        borderRadius: 16,
      }}
    />
  );
};

export default DobleLineaChart;
