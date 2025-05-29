import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email && password) {
      // Navega a Home y pasa el correo del usuario como parámetro
      navigation.replace('Home', { userEmail: email });
    } else {
      Alert.alert('Campos vacíos', 'Por favor, completa todos los campos.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Button title="Iniciar Sesión" onPress={handleLogin} />

      <View style={{ marginTop: 10 }}>
        <Button
          title="¿No tienes cuenta? Regístrate"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5faff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#003366',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
  },
});
