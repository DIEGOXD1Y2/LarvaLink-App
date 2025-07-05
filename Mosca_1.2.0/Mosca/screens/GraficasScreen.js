import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import DobleLineaChart from '..//components/DobleLineaChart';

export default function GraficasScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Gráficas</Text>
        <Text style={styles.text}>Aquí puedes mostrar gráficos y datos.</Text>
        {/* Aquí se muestra la gráfica */}
        <DobleLineaChart />

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  innerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
  
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
});
