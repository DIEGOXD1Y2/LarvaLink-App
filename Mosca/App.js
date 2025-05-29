import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ConfigScreen from './screens/ConfigScreen';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrarse' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Panel de Control' }} />
        <Stack.Screen name="Config" component={ConfigScreen} options={{ title: 'Configuración' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
