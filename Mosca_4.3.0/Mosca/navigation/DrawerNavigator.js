import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import axios from 'axios';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/HomeScreen';
import ConfigScreen from '../screens/ConfigScreen';  // sigue el mismo screen
import AlertasScreen from '../screens/AlertasScreen';
import GraficasScreen from '../screens/GraficasScreen';
import ControlScreen from '../screens/ControlScreen';
import UsuarioScreen from '../screens/UsuarioScreen';
import IP from '../components/config';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator({ userData, onLogout }) {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    let mounted = true;

    const fetchAlertas = async () => {
      try {
        const fechaHoy = new Date().toISOString().split('T')[0];
        const res = await axios.get(`${IP}/alertas/fecha?fecha=${fechaHoy}`);
        const data = res.data;

        if (data && Array.isArray(data.alertas) && mounted) {
          const alertasFiltradas = data.alertas.filter(a => a.idInfoIncubadora === 1);
          setAlertas(alertasFiltradas);
        }
      } catch (error) {
        console.error('❌ Error al obtener alertas:', error);
        if (mounted) setAlertas([]);
      }
    };

    fetchAlertas();
    const interval = setInterval(fetchAlertas, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <Drawer.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => ({
        drawerActiveTintColor: '#66BB6A',    // Verde suave para seleccionado
        drawerInactiveTintColor: '#000000',  // Negro para ítems inactivos
        headerTitleAlign: 'center',
        drawerIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Inicio':
              iconName = 'home';
              break;
            case 'Control':
              iconName = 'settings-input-component';
              break;
            case 'Graficas':
              iconName = 'show-chart';
              break;
            case 'Alertas':
              iconName = 'notifications';
              break;
            case 'Control de rangos':
              iconName = 'tune';   // icono diferente para rango
              break;
            case 'Perfil':
              iconName = 'person';
              break;
            default:
              iconName = 'help-outline';
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
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
        {(props) => (
          <HomeScreen {...props} userData={userData} onLogout={onLogout} />
        )}
      </Drawer.Screen>

      <Drawer.Screen name="Control" component={ControlScreen} />
      <Drawer.Screen name="Graficas" component={GraficasScreen} />
      <Drawer.Screen name="Alertas" component={AlertasScreen} />

      {/* Cambié nombre y icono de Configuración a Control de rangos */}
      <Drawer.Screen
        name="Control de rangos"
        component={ConfigScreen}
        options={{
          drawerLabel: 'Control de rangos',
        }}
      />

      {/* Perfil al último */}
      <Drawer.Screen name="Perfil">
        {(props) => (
          <UsuarioScreen
            {...props}
            route={{
              ...props.route,
              params: {
                userData: userData,
                onLogout: onLogout,
              },
            }}
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}
