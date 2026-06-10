import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/home/HomeScreen';
import MyScooterScreen from '../screens/scooter/MyScooterScreen';
import PaymentsScreen from '../screens/payments/PaymentsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ActiveRideScreen from '../screens/ride/ActiveRideScreen';
import QrScanScreen from '../screens/home/QrScanScreen';
import RideSummaryScreen from '../screens/ride/RideSummaryScreen';
import RideHistoryScreen from '../screens/profile/RideHistoryScreen';
import ProfileEditScreen from '../screens/profile/ProfileEditScreen';
import MySubscriptionsScreen from '../screens/profile/MySubscriptionsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import IdentityVerificationScreen from '../screens/profile/IdentityVerificationScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import useRideStatus from '../hooks/useRideStatus';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Home: 'home',
  'My Scooter': 'flash',
  Payments: 'wallet',
  Profile: 'person',
};

const getScreenOptions = ({ route }) => ({
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
});

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={getScreenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="My Scooter" component={MyScooterScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const activeRide = useSelector((state) => state.ride.activeRide);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  useRideStatus();

  return (
    <View style={styles.container}>
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
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        <Stack.Screen name="MySubscriptions" component={MySubscriptionsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="IdentityVerification" component={IdentityVerificationScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
      </Stack.Navigator>

      {activeRide && (
        <TouchableOpacity
          style={[styles.activeRideBanner, { top: insets.top + 10 }]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ActiveRide')}
        >
          <Text style={styles.bannerText}>⚡ Ride in progress — tap to view</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activeRideBanner: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#00E676',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bannerText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
