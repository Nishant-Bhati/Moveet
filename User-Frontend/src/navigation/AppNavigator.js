import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/home/HomeScreen';
import MyScooterScreen from '../screens/ride/MyScooterScreen';
import PaymentsScreen from '../screens/payments/PaymentsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: 'home',
  'My Scooter': 'flash',
  Payments: 'wallet',
  Profile: 'person',
};

export default function AppNavigator() {
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
