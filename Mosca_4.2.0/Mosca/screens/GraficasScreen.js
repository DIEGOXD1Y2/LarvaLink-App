import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';//192.168.0.11
import TemperaturaChart from '../components/TemperaturaChart';
import HumedadChart from '../components/HumedadChart';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export default function GraficasScreen() {
  const [grafica, setGrafica] = useState('temperatura');
  const [fecha, setFecha] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Referencias a los componentes
  const tempRef = useRef();
  const humRef = useRef();

  // Función para capturar imagen y compartir
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

    // HTML básico con la imagen embebida en base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const htmlContent = `
      <html>
        <body style="text-align:center;">
          <h2>Gráfica de ${grafica === 'temperatura' ? 'Temperatura' : 'Humedad'}</h2>
          <img src="data:image/png;base64,${base64}" style="width:100%; max-width:600px;" />
        </body>
      </html>
    `;

    const { uri: pdfUri } = await Print.printToFileAsync({ html: htmlContent });

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
            onPress={() => setGrafica('temperatura')}>
            <Text style={styles.toggleText}>Temperatura</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, grafica === 'humedad' && styles.activeButton]}
            onPress={() => setGrafica('humedad')}>
            <Text style={styles.toggleText}>Humedad</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateText}>Seleccionar Fecha: {fecha.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                const soloFecha = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                setFecha(soloFecha);
              }
            }}
          />
        )}

        {grafica === 'temperatura'
          ? <TemperaturaChart ref={tempRef} fecha={fecha} formato="C" />
          : <HumedadChart ref={humRef} fecha={fecha} />}

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