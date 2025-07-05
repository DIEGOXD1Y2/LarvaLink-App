import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AlertasScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Alertas</Text>
        <Text style={styles.text}>Aquí puedes mostrar alertas o notificaciones.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  innerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
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
  },
});
