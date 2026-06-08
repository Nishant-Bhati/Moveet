import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen.js';
import LoginScreen from '../screens/auth/LoginScreen.js';
import OtpScreen from '../screens/auth/OtpScreen.js';
import KycFormScreen from '../screens/auth/KycFormScreen.js';
import KycPendingScreen from '../screens/auth/KycPendingScreen.js';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="KycForm" component={KycFormScreen} />
      <Stack.Screen name="KycPending" component={KycPendingScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
