import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/home/HomeScreen';
import MyScooterScreen from '../screens/scooter/MyScooterScreen';
import PaymentsScreen from '../screens/payments/PaymentsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ActiveRideScreen from '../screens/ride/ActiveRideScreen';
import QrScanScreen from '../screens/home/QrScanScreen';
import RideSummaryScreen from '../screens/ride/RideSummaryScreen';
import RideHistoryScreen from '../screens/profile/RideHistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: 'home',
  'My Scooter': 'flash',
  Payments: 'wallet',
  Profile: 'person',
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
        tabBarActiveTintColor: '#00E676',
        tabBarInactiveTintColor: '#555555',
        tabBarLabelStyle: {
          textTransform: 'uppercase',
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: '#111111',
          borderTopColor: '#222222',
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="My Scooter" component={MyScooterScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="ActiveRide"
        component={ActiveRideScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="QrScan" component={QrScanScreen} />
      <Stack.Screen
        name="RideSummary"
        component={RideSummaryScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
    </Stack.Navigator>
  );
}
