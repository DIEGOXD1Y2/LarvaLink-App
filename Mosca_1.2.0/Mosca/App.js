import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import DrawerNavigator from './navigation/DrawerNavigator';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState(null);

  const handleLogin = (identifier) => {
    setUserIdentifier(identifier);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserIdentifier(null);
    setIsLoggedIn(false);
  };

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <DrawerNavigator userIdentifier={userIdentifier} onLogout={handleLogout} />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {props => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
