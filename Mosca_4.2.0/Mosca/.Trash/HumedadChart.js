// components/TemperaturaChart.js
import React from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const TemperaturaChart = () => {
  const datos = [
    { id: 1, humedad: 28, fecha: '2025-07-01T00:00:00.000Z' },
    { id: 2, humedad: 30, fecha: '2025-07-02T00:00:00.000Z' },
    { id: 3, humedad: 29, fecha: '2025-07-03T00:00:00.000Z' },
    { id: 4, humedad: 27, fecha: '2025-07-04T00:00:00.000Z' },
    { id: 5, humedad: 31, fecha: '2025-07-05T00:00:00.000Z' },
  ];

  // Convertimos la fecha a formato 'dd-mm'
  const etiquetas = datos.map(d => {
    const fecha = new Date(d.fecha);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}-${mes}`;
  });

  const humedad = datos.map(d => d.humedad);

  return (
    <LineChart
      data={{
        labels: etiquetas,
        datasets: [{ data: humedad }],
      }}
      width={Dimensions.get('window').width - 40}
      height={220}
      yAxisSuffix="°C"
      chartConfig={{
        backgroundColor: '#fff',
        backgroundGradientFrom: '#a5d6a7',
        backgroundGradientTo: '#81c784',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: { borderRadius: 16 },
      }}
      style={{ borderRadius: 16 }}
    />
  );
};

export default TemperaturaChart;
