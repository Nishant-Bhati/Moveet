import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Platform,
  Dimensions,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  fetchNearbyScooters,
  setSelectedScooter,
  clearSelectedScooter,
} from '../../store/scooterSlice.js';
import { startRideThunk } from '../../store/rideSlice.js';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: 28.019, // Fleet area coords (e.g. IoT Simulator default)
  longitude: 77.240,
  latitudeDelta: 0.015,
  longitudeDelta: 0.012,
};

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1c1c1e" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8e8e93" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1c1c1e" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#3a3a3c" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#0d0d0d" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2e" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8e8e93" }] },
  { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#3a3a3c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Redux Selectors
  const profile = useSelector((state) => state.user.profile);
  const { nearbyScooters, selectedScooter } = useSelector((state) => state.scooter);
  const { isLoading: rideStarting } = useSelector((state) => state.ride);

  // Local States
  const [location, setLocation] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Animation Refs
  const sheetTranslation = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const mapRef = useRef(null);

  // Request location permissions
  const requestLocationPermission = async () => {
    const permission = Platform.select({
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    });

    if (!permission) return false;

    try {
      const result = await request(permission);
      const isGranted = result === RESULTS.GRANTED;
      setPermissionGranted(isGranted);
      return isGranted;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const locationRef = useRef(null);

  // Keep locationRef in sync with location state
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Get current position and fetch scooters
  const handleGetLocation = useCallback((shouldCenter = true) => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.012,
        };
        setLocation(region);
        if (shouldCenter && mapRef.current) {
          mapRef.current.animateToRegion(region, 1000);
        }
        dispatch(fetchNearbyScooters({ lat: latitude, lng: longitude }));
      },
      (error) => {
        console.error('Error getting location:', error);
        // Fallback to default region and fetch scooters
        dispatch(fetchNearbyScooters({ lat: DEFAULT_REGION.latitude, lng: DEFAULT_REGION.longitude }));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  }, [dispatch]);

  // Load and setup tracking
  useEffect(() => {
    let interval;
    const initialize = async () => {
      const granted = await requestLocationPermission();
      if (granted) {
        handleGetLocation(true);
      } else {
        setLocation(DEFAULT_REGION);
        dispatch(fetchNearbyScooters({ lat: DEFAULT_REGION.latitude, lng: DEFAULT_REGION.longitude }));
      }
    };

    initialize();

    // Auto-refresh every 30 seconds
    interval = setInterval(() => {
      const currentLoc = locationRef.current;
      const lat = currentLoc?.latitude || DEFAULT_REGION.latitude;
      const lng = currentLoc?.longitude || DEFAULT_REGION.longitude;
      dispatch(fetchNearbyScooters({ lat, lng }));
    }, 30000);

    return () => {
      clearInterval(interval);
      dispatch(clearSelectedScooter());
    };
  }, [dispatch, handleGetLocation]);

  // Handle slide up/down animation on bottom sheet when selectedScooter state changes
  useEffect(() => {
    if (selectedScooter) {
      Animated.spring(sheetTranslation, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sheetTranslation, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedScooter, sheetTranslation]);

  // Pull to refresh action
  const onRefresh = async () => {
    setRefreshing(true);
    const lat = location?.latitude || DEFAULT_REGION.latitude;
    const lng = location?.longitude || DEFAULT_REGION.longitude;
    await dispatch(fetchNearbyScooters({ lat, lng }));
    setRefreshing(false);
  };

  const handleMarkerPress = (scooter) => {
    dispatch(setSelectedScooter(scooter));
  };

  const handleCloseSheet = () => {
    dispatch(clearSelectedScooter());
  };

  const handleStartRide = async () => {
    if (!selectedScooter) return;

    const scooterId = selectedScooter._id || selectedScooter.id;
    const result = await dispatch(startRideThunk(scooterId));

    if (startRideThunk.fulfilled.match(result)) {
      handleCloseSheet();
      navigation.navigate('ActiveRide');
    } else {
      Alert.alert('Ride Failed', result.payload || 'Could not start ride');
    }
  };

  const getBatteryColor = (level) => {
    if (level >= 50) return '#00C853';
    if (level >= 20) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Floating Bar */}
      <View style={styles.topBar}>
        <View style={styles.greetingBox}>
          <Text style={styles.greetingText}>
            Hi, {profile?.firstName || 'Rider'} 👋
          </Text>
        </View>
        <TouchableOpacity
          style={styles.walletChip}
          onPress={() => navigation.navigate('Payments')}
          activeOpacity={0.8}
        >
          <Icon name="wallet" size={16} color="#FFFFFF" style={styles.walletIcon} />
          <Text style={styles.walletText}>₹{profile?.walletBalance || 0}</Text>
        </TouchableOpacity>
      </View>

      {/* Main Map Container */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00C853"
            colors={['#00C853']}
          />
        }
      >
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={location || DEFAULT_REGION}
          showsUserLocation={permissionGranted}
          showsMyLocationButton={false}
          customMapStyle={darkMapStyle}
        >
          {/* Render Scooter Markers */}
          {nearbyScooters.map((scooter) => {
            const isAvailable = scooter.status === 'AVAILABLE';
            const lat = scooter.location?.coordinates?.[1];
            const lng = scooter.location?.coordinates?.[0];

            if (lat === undefined || lng === undefined) return null;

            return (
              <Marker
                key={scooter._id || scooter.id}
                coordinate={{ latitude: lat, longitude: lng }}
                onPress={() => handleMarkerPress(scooter)}
              >
                <View
                  style={[
                    styles.marker,
                    isAvailable ? styles.markerAvailable : styles.markerUnavailable,
                  ]}
                >
                  <Icon name="bicycle" size={18} color="#FFFFFF" />
                </View>
              </Marker>
            );
          })}
        </MapView>
      </ScrollView>

      {/* Floating QR Code Scanner Action */}
      <TouchableOpacity
        style={styles.qrFab}
        onPress={() => navigation.navigate('QrScan')}
        activeOpacity={0.8}
      >
        <Icon name="qr-code" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Animated Bottom Sheet */}
      {selectedScooter && (
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: sheetTranslation }] },
          ]}
        >
          {/* Header row with X */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.scooterCode}>{selectedScooter.scooterCode}</Text>
              <Text style={styles.scooterModel}>{selectedScooter.modelName || 'Moveet Scooter'}</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseSheet}
              activeOpacity={0.7}
            >
              <Icon name="close" size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Battery Status */}
          <View style={styles.batteryContainer}>
            <Icon
              name={selectedScooter.batteryLevel >= 50 ? 'battery-charging' : 'battery-dead'}
              size={22}
              color={getBatteryColor(selectedScooter.batteryLevel)}
            />
            <View style={styles.batteryBarOuter}>
              <View
                style={[
                  styles.batteryBarInner,
                  {
                    width: `${selectedScooter.batteryLevel}%`,
                    backgroundColor: getBatteryColor(selectedScooter.batteryLevel),
                  },
                ]}
              />
            </View>
            <Text style={styles.batteryPercentage}>{selectedScooter.batteryLevel}%</Text>
          </View>

          {/* Pricing Info & Specs */}
          <View style={styles.infoCard}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.statusBadge,
                  selectedScooter.status === 'AVAILABLE'
                    ? styles.badgeAvailable
                    : styles.badgeUnavailable,
                ]}
              >
                <Text style={styles.statusText}>{selectedScooter.status}</Text>
              </View>
              <Text style={styles.pricingText}>
                ₹{selectedScooter.pricing?.minutely || 2}/min or ₹{selectedScooter.pricing?.daily || 199}/day
              </Text>
            </View>

            {/* Spec grid */}
            <View style={styles.specGrid}>
              <View style={styles.specItem}>
                <Icon name="wifi" size={16} color="#8E8E93" />
                <Text style={styles.specLabel}>Signal: </Text>
                <Text style={styles.specValue}>
                  {selectedScooter.signalStrength || 'Good'}
                </Text>
              </View>
              <View style={styles.specItem}>
                <Icon name="speedometer" size={16} color="#8E8E93" />
                <Text style={styles.specLabel}>Odo: </Text>
                <Text style={styles.specValue}>
                  {selectedScooter.odometer ? `${selectedScooter.odometer} km` : '0 km'}
                </Text>
              </View>
            </View>
          </View>

          {/* Start Ride Button */}
          <TouchableOpacity
            style={[
              styles.startRideButton,
              (selectedScooter.status !== 'AVAILABLE' || rideStarting) &&
                styles.buttonDisabled,
            ]}
            onPress={handleStartRide}
            disabled={selectedScooter.status !== 'AVAILABLE' || rideStarting}
            activeOpacity={0.8}
          >
            {rideStarting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.startRideText}>Start Ride</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  scrollContainer: {
    flex: 1,
  },
  map: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  greetingBox: {
    backgroundColor: 'rgba(28, 28, 30, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  walletChip: {
    backgroundColor: '#00C853',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  walletText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  marker: {
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  markerAvailable: {
    backgroundColor: '#00C853',
  },
  markerUnavailable: {
    backgroundColor: '#8E8E93',
  },
  qrFab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#00C853',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 9,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 30,
    borderWidth: 1.5,
    borderColor: '#2C2C2E',
    zIndex: 100,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  scooterCode: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  scooterModel: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: '#2C2C2E',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#2C2C2E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  batteryBarOuter: {
    flex: 1,
    height: 8,
    backgroundColor: '#1C1C1E',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  batteryBarInner: {
    height: '100%',
    borderRadius: 4,
  },
  batteryPercentage: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
    paddingBottom: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeAvailable: {
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
  },
  badgeUnavailable: {
    backgroundColor: 'rgba(142, 142, 147, 0.15)',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pricingText: {
    color: '#00C853',
    fontSize: 15,
    fontWeight: 'bold',
  },
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specLabel: {
    color: '#8E8E93',
    fontSize: 13,
    marginLeft: 6,
  },
  specValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  startRideButton: {
    backgroundColor: '#00C853',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#3A3A3C',
    shadowOpacity: 0,
    elevation: 0,
  },
  startRideText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  walletIcon: {
    marginRight: 6,
  },
});

export default HomeScreen;
