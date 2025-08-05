import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import TemperaturaChart from '../components/TemperaturaChart';
import HumedadChart from '../components/HumedadChart';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export default function GraficasScreen() {
  const [grafica, setGrafica] = useState('temperatura');
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(() => {
    const now = new Date();
    now.setMinutes(0, 0, 0); // Inicializar en la hora exacta sin minutos
    return now;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const tempRef = useRef();
  const humRef = useRef();

  const compartirGrafica = async () => {
    try {
      const uri =
        grafica === 'temperatura'
          ? await tempRef.current?.capturar()
          : await humRef.current?.capturar();

      if (!uri) {
        Alert.alert('Error', 'No se pudo capturar la gráfica.');
        return;
      }

      const puedeCompartir = await Sharing.isAvailableAsync();
      if (!puedeCompartir) {
        Alert.alert('Compartir no disponible', 'Esta función no está disponible en tu dispositivo.');
        return;
      }

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error al compartir la gráfica:', error);
      Alert.alert('Error', 'Ocurrió un error al intentar compartir la imagen.');
    }
  };

  const exportarGraficaPDF = async () => {
  try {
    const uri =
      grafica === 'temperatura'
        ? await tempRef.current?.capturar()
        : await humRef.current?.capturar();

    if (!uri) {
      Alert.alert('Error', 'No se pudo capturar la gráfica.');
      return;
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const htmlContent = `
      <html>
        <head>
          <style>
            @page {
              size: landscape;
              margin: 1cm;
            }
            body {
              text-align: center;
              font-family: sans-serif;
            }
            img {
              width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <h2>Gráfica de ${grafica === 'temperatura' ? 'Temperatura' : 'Humedad'}</h2>
          <img src="data:image/png;base64,${base64}" />
        </body>
      </html>
    `;

    const { uri: pdfUri } = await Print.printToFileAsync({
      html: htmlContent,
    });

    await shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartir PDF',
    });
  } catch (error) {
    console.error('Error al exportar PDF:', error);
    Alert.alert('Error', 'Ocurrió un error al generar el PDF.');
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Gráficas Históricas</Text>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.toggleButton, grafica === 'temperatura' && styles.activeButton]}
            onPress={() => setGrafica('temperatura')}
          >
            <Text style={styles.toggleText}>Temperatura</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, grafica === 'humedad' && styles.activeButton]}
            onPress={() => setGrafica('humedad')}
          >
            <Text style={styles.toggleText}>Humedad</Text>
          </TouchableOpacity>
        </View>

        {/* Selector de fecha */}
        <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateText}>Seleccionar Fecha: {fecha.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const soloFecha = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                setFecha(soloFecha);
              }
            }}
          />
        )}

        {/* Selector de hora como Picker */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Seleccionar Hora:</Text>
          <Picker
            selectedValue={hora.getHours()}
            style={styles.picker}
            onValueChange={(horaSeleccionada) => {
              const nuevaHora = new Date(hora);
              nuevaHora.setHours(horaSeleccionada, 0, 0, 0);
              setHora(nuevaHora);
            }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <Picker.Item key={i} label={`${i.toString().padStart(2, '0')}:00`} value={i} />
            ))}
          </Picker>
        </View>

        {/* Mostrar gráfica correspondiente */}
        {grafica === 'temperatura' ? (
          <TemperaturaChart ref={tempRef} fecha={fecha} hora={hora} formato="C" />
        ) : (
          <HumedadChart ref={humRef} fecha={fecha} hora={hora} />
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.pdfButton} onPress={exportarGraficaPDF}>
            <Text style={styles.buttonText}>Exportar a PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton} onPress={compartirGrafica}>
            <Text style={styles.buttonText}>Compartir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#c8e6c9',
    padding: 20,
  },
  innerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  toggleButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#66bb6a',
  },
  toggleText: {
    color: '#000',
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  picker: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    width: '100%',
    gap: 10,
  },
  pdfButton: {
    flex: 1,
    backgroundColor: '#43a047',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#66bb6a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
