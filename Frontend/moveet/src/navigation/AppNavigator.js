/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Screen Imports
import HomeScreen from '../screens/home/HomeScreen.js';
import MyScooterScreen from '../screens/scooter/MyScooterScreen.js';
import PaymentsScreen from '../screens/payments/PaymentsScreen.js';
import ProfileScreen from '../screens/profile/ProfileScreen.js';
import QrScanScreen from '../screens/home/QrScanScreen.js';
import ActiveRideScreen from '../screens/ride/ActiveRideScreen.js';
import RideSummaryScreen from '../screens/ride/RideSummaryScreen.js';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'My Scooter') {
            iconName = focused ? 'bicycle' : 'bicycle-outline';
          } else if (route.name === 'Payments') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00C853',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#0D0D0D',
          borderTopColor: '#1A1A1A',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="My Scooter" component={MyScooterScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="QrScan" component={QrScanScreen} />
      <Stack.Screen 
        name="ActiveRide" 
        component={ActiveRideScreen} 
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="RideSummary" 
        component={RideSummaryScreen} 
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
