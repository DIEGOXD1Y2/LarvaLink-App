import React, { useState } from 'react';
import {View,TextInput,TouchableOpacity,Text,StyleSheet,Alert,KeyboardAvoidingView,Platform,Image} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import IP from '../components/config';

export default function LoginScreen({ onLogin }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Campos vacíos', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${IP}/login`, {
        correo: identifier,
        contrasena: password,
      });

      // Envía el objeto completo que viene del backend
      onLogin(res.data);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          Alert.alert('Error de autenticación', 'Correo o contraseña incorrectos.');
        } else if (err.response.status === 403) {
          Alert.alert('Usuario inactivo', 'Tu cuenta está desactivada.');
        } else {
          Alert.alert('Error', 'No se pudo iniciar sesión. Intenta más tarde.');
        }
      } else {
        Alert.alert('Error', 'No se pudo conectar al servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Image
        source={require('../assets/mosca.png')}
        style={styles.imagen}
        resizeMode="contain"
      />

      <View style={styles.innerContainer}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Ingresa tus datos para continuar</Text>

        {/* Campo Correo */}
        <View style={styles.inputContainer}>
          <Icon name="email-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="email-address"
            value={identifier}
            onChangeText={setIdentifier}
            editable={!loading}
          />
        </View>

        {/* Campo Contraseña */}
        <View style={styles.inputContainer}>
          <Icon name="lock-outline" size={20} color="#666" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#666"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Icon
              name={secure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#666"
              style={styles.iconRight}
            />
          </TouchableOpacity>
        </View>

        {/* Botón login */}
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Icon name="login" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
  },
  imagen: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: -20,
  },
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1b5e20',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c8e6c9',
    backgroundColor: '#f9fff9',
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    color: '#000',
  },
  icon: {
    marginRight: 8,
  },
  iconRight: {
    padding: 5,
  },
  button: {
    backgroundColor: '#66bb6a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
