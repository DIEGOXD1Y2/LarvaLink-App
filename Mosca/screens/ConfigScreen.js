import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Asegúrate de tener esto instalado

export default function ConfigScreen() {
  const [limits, setLimits] = useState([]);
  const [tipo, setTipo] = useState('Temperatura'); // Valor por defecto
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  const agregarLimite = () => {
    if (!min || !max) return; // Ya no lanza alerta

    const nuevoLimite = { tipo, min, max };
    const sinDuplicados = limits.filter(item => item.tipo !== tipo);
    setLimits([...sinDuplicados, nuevoLimite]);

    setMin('');
    setMax('');
  };

  const handleGuardar = () => {
    console.log('Límites actualizados:', limits);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurar Límites</Text>

      <Text style={styles.label}>Tipo de Dato</Text>
      <Picker
        selectedValue={tipo}
        style={styles.input}
        onValueChange={(itemValue) => setTipo(itemValue)}
      >
        <Picker.Item label="Temperatura" value="Temperatura" />
        <Picker.Item label="Humedad" value="Humedad" />
        <Picker.Item label="Humedad del Sustrato" value="Humedad del Sustrato" />
      </Picker>

      <TextInput
        placeholder="Mínimo"
        keyboardType="numeric"
        style={styles.input}
        value={min}
        onChangeText={setMin}
      />
      <TextInput
        placeholder="Máximo"
        keyboardType="numeric"
        style={styles.input}
        value={max}
        onChangeText={setMax}
      />

      <Button title="Agregar" onPress={agregarLimite} />

      <Text style={styles.title}>Límites Configurados</Text>
      <FlatList
        data={limits}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.limitBox}>
            <Text style={styles.label}>{item.tipo}</Text>
            <Text style={styles.item}>Mín: {item.min}</Text>
            <Text style={styles.item}>Máx: {item.max}</Text>
          </View>
        )}
      />

      <Button title="Guardar Configuración" onPress={handleGuardar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  limitBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  item: { fontSize: 14 },
});
