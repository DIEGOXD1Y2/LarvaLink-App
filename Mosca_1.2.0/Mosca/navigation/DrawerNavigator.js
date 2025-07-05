import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import HomeScreen from '../screens/HomeScreen';
import ConfigScreen from '../screens/ConfigScreen';
import AlertasScreen from '../screens/AlertasScreen';
import GraficasScreen from '../screens/GraficasScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator({ userIdentifier, onLogout }) {
  return (
    <Drawer.Navigator initialRouteName="Inicio">
      <Drawer.Screen
        name="Inicio"
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ marginLeft: 15 }}
            >
              <Text style={{ fontSize: 24 }}>☰</Text>
            </TouchableOpacity>
          ),
        })}
      >
        {props => (
          <HomeScreen
            {...props}
            userIdentifier={userIdentifier}
            onLogout={onLogout}
          />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="Graficas" component={GraficasScreen} />
      <Drawer.Screen name="Alertas" component={AlertasScreen} />
      <Drawer.Screen name="Configuración" component={ConfigScreen} />
    </Drawer.Navigator>
  );
}
