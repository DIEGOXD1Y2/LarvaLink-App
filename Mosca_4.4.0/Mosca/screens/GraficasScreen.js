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
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            <Text style={styles.welcomeText}>Análisis de Datos</Text>
            <Text style={styles.userName}>Gráficas Históricas</Text>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: '#66BB6A' }]} />
              <Text style={styles.statusText}>Sistema de Monitoreo Activo</Text>
            </View>
          </View>
        </View>

        {/* Chart Type Selection */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.iconText}>📊</Text>
            </View>
            <Text style={styles.sectionTitle}>TIPO DE GRÁFICA</Text>
          </View>

          <View style={styles.chartTypeContainer}>
            <TouchableOpacity
              style={[
                styles.chartTypeButton,
                grafica === 'temperatura' && styles.activeChartButton,
                { borderColor: '#F44336' }
              ]}
              onPress={() => setGrafica('temperatura')}
            >
              <View style={[styles.chartTypeIcon, { backgroundColor: '#FFEBEE' }]}>
                <Text style={styles.chartTypeIconText}>🌡️</Text>
              </View>
              <Text style={[
                styles.chartTypeText,
                grafica === 'temperatura' && { color: '#F44336' }
              ]}>
                Temperatura
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.chartTypeButton,
                grafica === 'humedad' && styles.activeChartButton,
                { borderColor: '#2196F3' }
              ]}
              onPress={() => setGrafica('humedad')}
            >
              <View style={[styles.chartTypeIcon, { backgroundColor: '#E3F2FD' }]}>
                <Text style={styles.chartTypeIconText}>💧</Text>
              </View>
              <Text style={[
                styles.chartTypeText,
                grafica === 'humedad' && { color: '#2196F3' }
              ]}>
                Humedad
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date and Time Selection */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Text style={styles.iconText}>📅</Text>
            </View>
            <Text style={styles.sectionTitle}>SELECCIÓN DE FECHA Y HORA</Text>
          </View>

          <View style={styles.dateTimeContainer}>
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dateButtonContent}>
                <Text style={styles.dateButtonIcon}>📅</Text>
                <View style={styles.dateButtonText}>
                  <Text style={styles.dateLabel}>Fecha seleccionada</Text>
                  <Text style={styles.dateValue}>{fecha.toLocaleDateString()}</Text>
                </View>
              </View>
            </TouchableOpacity>

            <View style={styles.timePickerCard}>
              <Text style={styles.timePickerLabel}>⏰ Seleccionar Hora</Text>
              <Picker
                selectedValue={hora.getHours()}
                style={styles.timePicker}
                onValueChange={(horaSeleccionada) => {
                  const nuevaHora = new Date(hora);
                  nuevaHora.setHours(horaSeleccionada, 0, 0, 0);
                  setHora(nuevaHora);
                }}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <Picker.Item 
                    key={i} 
                    label={`${i.toString().padStart(2, '0')}:00`} 
                    value={i} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Chart Display */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { 
              backgroundColor: grafica === 'temperatura' ? '#FFEBEE' : '#E3F2FD' 
            }]}>
              <Text style={styles.iconText}>
                {grafica === 'temperatura' ? '🌡️' : '💧'}
              </Text>
            </View>
            <Text style={styles.sectionTitle}>
              GRÁFICA DE {grafica.toUpperCase()}
            </Text>
          </View>

          <View style={styles.chartContainer}>
            {grafica === 'temperatura' ? (
              <TemperaturaChart ref={tempRef} fecha={fecha} hora={hora} formato="C" />
            ) : (
              <HumedadChart ref={humRef} fecha={fecha} hora={hora} />
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: '#F3E5F5' }]}>
              <Text style={styles.iconText}>⚙️</Text>
            </View>
            <Text style={styles.sectionTitle}>ACCIONES</Text>
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FF9800' }]} 
              onPress={exportarGraficaPDF}
            >
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonIcon}>📄</Text>
                <Text style={styles.actionButtonText}>EXPORTAR PDF</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} 
              onPress={compartirGrafica}
            >
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonIcon}>📤</Text>
                <Text style={styles.actionButtonText}>COMPARTIR</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              const soloFecha = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate()
              );
              setFecha(soloFecha);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerContainer: {
    marginBottom: 25,
  },
  headerGradient: {
    backgroundColor: '#2E7D32',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#A5D6A7',
    fontWeight: '500',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#E8F5E9',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    flex: 1,
  },
  chartTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  chartTypeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  activeChartButton: {
    backgroundColor: '#F8F9FA',
    transform: [{ scale: 1.02 }],
  },
  chartTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTypeIconText: {
    fontSize: 24,
  },
  chartTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dateTimeContainer: {
    gap: 12,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  dateButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  dateButtonText: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  timePickerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  timePicker: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
