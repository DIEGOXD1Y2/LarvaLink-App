import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';

export default function LoginScreen({ navigation, onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (identifier && password) {
      onLogin(identifier);  // en vez de navigation.replace
    } else {
      Alert.alert('Campos vacíos', 'Por favor, completa todos los campos.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesión con tu correo electrónico</Text>

        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          placeholderTextColor="#666"
          autoCapitalize="none"
          keyboardType="email-address"
          value={identifier}
          onChangeText={setIdentifier}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8f5e9', justifyContent: 'center' },
  innerContainer: {
    paddingHorizontal: 30,
    paddingVertical: 40,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1b5e20', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#444', textAlign: 'center', marginBottom: 30 },
  input: {
    borderWidth: 1,
    borderColor: '#c8e6c9',
    backgroundColor: '#f9fff9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    color: '#000',
  },
  button: { backgroundColor: '#66bb6a', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  registerLink: { marginTop: 20, alignItems: 'center' },
  registerText: { color: '#333' },
  registerBold: { fontWeight: 'bold', color: '#1b5e20' },
});
