import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ route, navigation }) {
  const { userEmail } = route.params;

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bienvenido,</Text>
      <Text style={styles.email}>{userEmail}</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Ir a Configuración"
          onPress={() => navigation.navigate('Config')}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Cerrar sesión" onPress={handleLogout} color="red" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  welcome: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  email: { fontSize: 18, color: '#333', marginBottom: 30 },
  buttonContainer: { marginTop: 10, width: '80%' },
});
