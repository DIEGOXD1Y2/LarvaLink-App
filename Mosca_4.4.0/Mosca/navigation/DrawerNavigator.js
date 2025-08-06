import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import axios from 'axios';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import ConfigScreen from '../screens/ConfigScreen';
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

  const getIconColor = (routeName, focused) => {
    const colors = {
      'Inicio': focused ? '#4CAF50' : '#2E7D32',
      'Control': focused ? '#2196F3' : '#1565C0',
      'Graficas': focused ? '#FF9800' : '#F57C00',
      'Alertas': focused ? '#F44336' : '#D32F2F',
      'Control de rangos': focused ? '#9C27B0' : '#7B1FA2',
      'Perfil': focused ? '#607D8B' : '#455A64',
    };
    return colors[routeName] || '#666';
  };

  return (
    <Drawer.Navigator
      initialRouteName="Inicio"
      screenOptions={({ route }) => ({
        drawerActiveTintColor: '#2E7D32',
        drawerInactiveTintColor: '#666666',
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#2E7D32',
          elevation: 8,
          shadowOpacity: 0.3,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        drawerStyle: {
          backgroundColor: '#F8F9FA',
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          marginLeft: -10,
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginVertical: 2,
          marginHorizontal: 10,
          paddingVertical: 5,
        },
        drawerActiveBackgroundColor: '#E8F5E9',
        drawerIcon: ({ focused, size }) => {
          let iconName;
          const color = getIconColor(route.name, focused);

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
              iconName = 'tune';
              break;
            case 'Perfil':
              iconName = 'person';
              break;
            default:
              iconName = 'help-outline';
          }

          return (
            <View style={{
              backgroundColor: focused ? '#FFFFFF' : 'transparent',
              borderRadius: 8,
              padding: 6,
              shadowColor: focused ? color : 'transparent',
              shadowOpacity: 0.3,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: focused ? 3 : 0,
            }}>
              <MaterialIcons name={iconName} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Drawer.Screen
        name="Inicio"
        options={({ navigation }) => ({
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.toggleDrawer()}
              style={{ 
                marginLeft: 15,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: 8,
              }}
            >
              <Text style={{ fontSize: 20, color: '#FFFFFF' }}>☰</Text>
            </TouchableOpacity>
          ),
          drawerLabel: ({ focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ 
                color: focused ? '#2E7D32' : '#666666',
                fontSize: 16,
                fontWeight: focused ? 'bold' : '600'
              }}>
              Inicio
              </Text>
            </View>
          ),
        })}
      >
        {(props) => (
          <HomeScreen {...props} userData={userData} onLogout={onLogout} />
        )}
      </Drawer.Screen>

      <Drawer.Screen 
        name="Control" 
        component={ControlScreen}
        options={{
          drawerLabel: ({ focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ 
                color: focused ? '#2E7D32' : '#666666',
                fontSize: 16,
                fontWeight: focused ? 'bold' : '600'
              }}>
              Control
              </Text>
            </View>
          ),
        }}
      />

      <Drawer.Screen 
        name="Graficas" 
        component={GraficasScreen}
        options={{
          drawerLabel: ({ focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ 
                color: focused ? '#2E7D32' : '#666666',
                fontSize: 16,
                fontWeight: focused ? 'bold' : '600'
              }}>
               Gráficas
              </Text>
            </View>
          ),
        }}
      />

      <Drawer.Screen 
        name="Alertas" 
        component={AlertasScreen}
        options={{
          drawerLabel: ({ focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <Text style={{ 
                color: focused ? '#2E7D32' : '#666666',
                fontSize: 16,
                fontWeight: focused ? 'bold' : '600'
              }}>
              Alertas
              </Text>
              {alertas.length > 0 && (
                <View style={{
                  backgroundColor: '#F44336',
                  borderRadius: 10,
                  minWidth: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 10,
                }}>
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 'bold',
                  }}>
                    {alertas.length > 99 ? '99+' : alertas.length}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Drawer.Screen
        name="Control de rangos"
        component={ConfigScreen}
        options={{
          drawerLabel: ({ focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ 
                color: focused ? '#2E7D32' : '#666666',
                fontSize: 16,
                fontWeight: focused ? 'bold' : '600'
              }}>
               Control de rangos
              </Text>
            </View>
          ),
        }}
      />

      <Drawer.Screen 
        name="Perfil"
        options={{
          drawerLabel: ({ focused }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ 
                color: focused ? '#2E7D32' : '#666666',
                fontSize: 16,
                fontWeight: focused ? 'bold' : '600'
              }}>
              Perfil
              </Text>
            </View>
          ),
        }}
      >
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
