import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Dimensions,
  FlatList,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MapView, { Marker, Callout } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';
import {
  fetchNearbyScooters,
  setSelectedScooter,
  clearSelectedScooter,
} from '../../store/scooterSlice';
import { startRideThunk, fetchActiveRideThunk } from '../../store/rideSlice';

const { width: screenWidth } = Dimensions.get('window');

const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#121212" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#767676" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#000000" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#262626" }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [{ "color": "#161616" }]
  },
  {
    "featureType": "poi",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#161616" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#303030" }]
  },
  {
    "featureType": "transit",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#0d0d0d" }]
  }
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  // Redux Selectors
  const profile = useSelector((state) => state.user.profile);
  const { nearbyScooters, selectedScooter } = useSelector((state) => state.scooter);
  const isStartingRide = useSelector((state) => state.ride.isLoading);

  // Dynamic user data
  const profileData = profile?.data || profile;
  const userName = profileData?.firstName || 'Sagar';
  const walletBalance = profileData?.walletBalance !== undefined ? profileData.walletBalance : 2840;
  const initials = (profileData?.firstName?.[0] || 'S') + (profileData?.lastName?.[0] || '');

  // Local State
  const [bottomSheetState, setBottomSheetState] = useState('COLLAPSED'); // 'COLLAPSED', 'EXPANDED', 'SELECTED'
  const [userLocation, setUserLocation] = useState({
    latitude: 28.01,
    longitude: 77.24,
  });

  // Refs
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  // Fetch Nearby Scooters
  const loadNearbyScooters = useCallback((lat, lng) => {
    dispatch(fetchNearbyScooters({ lat, lng }));
  }, [dispatch]);

  // Recenter Map
  const recenterToUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const recenterToSelected = () => {
    if (selectedScooter && mapRef.current) {
      const lat = selectedScooter.latitude || selectedScooter.location?.coordinates[1];
      const lng = selectedScooter.longitude || selectedScooter.location?.coordinates[0];
      if (lat && lng) {
        mapRef.current.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }, 1000);
      }
    }
  };

  // Select Scooter Helper
  const handleScooterSelect = useCallback((scooter) => {
    dispatch(setSelectedScooter(scooter));
    setBottomSheetState('SELECTED');

    // Show callout on map
    setTimeout(() => {
      const marker = markerRefs.current[scooter.id || scooter._id];
      if (marker) {
        marker.showCallout();
      }
    }, 150);
  }, [dispatch]);

  // Handle scanned scooter parameter
  useEffect(() => {
    const scannedScooterId = route.params?.scannedScooterId;
    if (scannedScooterId) {
      const scooter = nearbyScooters.find(
        (s) => (s.id || s._id) === scannedScooterId
      ) || (selectedScooter && (selectedScooter.id || selectedScooter._id) === scannedScooterId ? selectedScooter : null);

      if (scooter) {
        handleScooterSelect(scooter);
        navigation.setParams({ scannedScooterId: undefined });
      }
    }
  }, [route.params?.scannedScooterId, nearbyScooters, selectedScooter, navigation, handleScooterSelect]);

  // Close Selection View
  const handleCloseSelection = () => {
    const activeId = selectedScooter?.id || selectedScooter?._id;
    if (activeId) {
      const marker = markerRefs.current[activeId];
      if (marker) {
        marker.hideCallout();
      }
    }
    dispatch(clearSelectedScooter());
    setBottomSheetState('COLLAPSED');
  };

  // Start Mission
  const handleStartMission = async () => {
    if (!selectedScooter) return;
    try {
      const scooterId = selectedScooter._id || selectedScooter.id;
      await dispatch(startRideThunk(scooterId)).unwrap();
      navigation.navigate('ActiveRide');
    } catch (err) {
      console.error('Failed to start ride:', err);
    }
  };

  // Get current location and request permissions
  const getCurrentLocation = useCallback(() => {
    if (global.navigator && global.navigator.geolocation) {
      global.navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          loadNearbyScooters(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          loadNearbyScooters(28.01, 77.24);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      loadNearbyScooters(28.01, 77.24);
    }
  }, [loadNearbyScooters]);

  const requestLocationPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Moveet needs access to your location to find nearby scooters.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          loadNearbyScooters(28.01, 77.24);
        }
      } else {
        getCurrentLocation();
      }
    } catch (err) {
      console.warn(err);
      loadNearbyScooters(28.01, 77.24);
    }
  }, [getCurrentLocation, loadNearbyScooters]);

  useEffect(() => {
    requestLocationPermission();

    const interval = setInterval(() => {
      if (userLocation) {
        loadNearbyScooters(userLocation.latitude, userLocation.longitude);
      }
    }, 30000); // 30s refresh

    return () => clearInterval(interval);
  }, [requestLocationPermission, loadNearbyScooters, userLocation]);

  // Check for active ride on mount to auto-redirect
  useEffect(() => {
    const checkActiveRide = async () => {
      try {
        const ride = await dispatch(fetchActiveRideThunk()).unwrap();
        if (ride) {
          navigation.navigate('ActiveRide');
        }
      } catch (err) {
        // No active ride or check failed, continue normally
      }
    };
    checkActiveRide();
  }, [dispatch, navigation]);

  // Distance calculator
  const getDistanceString = (scooter) => {
    const lat1 = userLocation.latitude;
    const lon1 = userLocation.longitude;
    const lat2 = scooter.latitude || scooter.location?.coordinates[1] || 0;
    const lon2 = scooter.longitude || scooter.location?.coordinates[0] || 0;

    const R = 6371e3; // meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in meters
    if (d < 1000) {
      return `${Math.round(d)}m away`;
    } else {
      return `${(d / 1000).toFixed(1)}km away`;
    }
  };

  // Badge configuration based on status
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return styles.badgeAvailable;
      case 'LOCKED':
        return styles.badgeLocked;
      case 'IN_USE':
        return styles.badgeInUse;
      case 'MAINTENANCE':
        return styles.badgeMaintenance;
      default:
        return styles.badgeOther;
    }
  };

  const getBadgeTextStyle = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return styles.badgeTextAvailable;
      case 'LOCKED':
        return styles.badgeTextLocked;
      case 'IN_USE':
        return styles.badgeTextInUse;
      case 'MAINTENANCE':
        return styles.badgeTextMaintenance;
      default:
        return styles.badgeTextOther;
    }
  };

  // Render scooter item card in grid/list
  const renderScooterCard = ({ item }) => {
    const cardWidth = screenWidth / 2 - 24;
    return (
      <TouchableOpacity
        style={[styles.scooterCard, { width: cardWidth }]}
        activeOpacity={0.8}
        onPress={() => handleScooterSelect(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardModel} numberOfLines={1}>
            {item.model || 'Moveet Sport'}
          </Text>
          <Text style={styles.cardBattery}>
            ⚡ {item.battery}%
          </Text>
        </View>

        <Text style={styles.cardCode} numberOfLines={1}>
          {item.code || 'MOVEET SPORT'}
        </Text>

        {/* Empty space/image placeholder area */}
        <View style={styles.cardPlaceholderSpace} />

        <View style={styles.cardFooter}>
          <View style={[styles.badge, getBadgeStyle(item.status)]}>
            <Text style={[styles.badgeText, getBadgeTextStyle(item.status)]}>
              ● {item.status}
            </Text>
          </View>
          <Text style={styles.cardDistance}>{getDistanceString(item)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Half: Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          customMapStyle={darkMapStyle}
          showsUserLocation={true}
          userLocationAnnotationTitle=""
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
        >
          {nearbyScooters && nearbyScooters.map((scooter) => {
            const lat = scooter.latitude || scooter.location?.coordinates[1];
            const lng = scooter.longitude || scooter.location?.coordinates[0];
            if (!lat || !lng) return null;

            return (
              <Marker
                key={scooter.id || scooter._id}
                ref={(ref) => {
                  if (ref) {
                    markerRefs.current[scooter.id || scooter._id] = ref;
                  }
                }}
                coordinate={{ latitude: lat, longitude: lng }}
                onPress={() => handleScooterSelect(scooter)}
                tracksViewChanges={false}
              >
                <View style={styles.markerContainer}>
                  <View style={[
                    styles.markerDot,
                    scooter.status === 'AVAILABLE' ? styles.markerDotAvailable : styles.markerDotOther
                  ]} />
                </View>

                <Callout tooltip onPress={() => handleScooterSelect(scooter)}>
                  <View style={styles.tooltipContainer}>
                    <View style={styles.tooltipCard}>
                      <Text style={styles.tooltipName}>{scooter.model || scooter.displayName || 'Moveet Sport'}</Text>
                      <View style={styles.tooltipStatsRow}>
                        <Text style={styles.tooltipStat}>⚡ {scooter.battery}%</Text>
                        <Text style={styles.tooltipStat}>➔ {scooter.rangeKm || 45} km</Text>
                      </View>
                    </View>
                    <View style={styles.tooltipArrow} />
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>

        {/* Absolute Top Bar over Map */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingLabel}>GOOD MORNING</Text>
              <Text style={styles.greetingName}>{userName}</Text>
            </View>
          </View>

          <View style={styles.walletChip}>
            <Ionicons name="wallet-outline" size={16} color={colors.primary} />
            <Text style={styles.walletText}>₹{walletBalance}</Text>
          </View>
        </View>

        {/* Map controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlBtn} onPress={recenterToUser} activeOpacity={0.8}>
            <Ionicons name="locate-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControlBtn} onPress={recenterToSelected} activeOpacity={0.8}>
            <Ionicons name="navigate-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Half: Slideable Bottom Sheet */}
      <View style={[
        styles.bottomSheet,
        bottomSheetState === 'EXPANDED' && styles.bottomSheetExpanded,
        bottomSheetState === 'SELECTED' && styles.bottomSheetSelected,
      ]}>
        
        {bottomSheetState !== 'SELECTED' ? (
          <>
            {/* Header Collapsed / Expanded */}
            <TouchableOpacity
              style={styles.sheetHeader}
              activeOpacity={0.8}
              onPress={() => {
                setBottomSheetState((prev) => (prev === 'COLLAPSED' ? 'EXPANDED' : 'COLLAPSED'));
              }}
            >
              <Text style={styles.sheetTitle}>MOVEET NEARBY</Text>
              <Ionicons
                name={bottomSheetState === 'COLLAPSED' ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* List / Grid of nearby scooters */}
            {bottomSheetState === 'COLLAPSED' ? (
              <FlatList
                data={nearbyScooters || []}
                keyExtractor={(item) => item.id || item._id}
                renderItem={renderScooterCard}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
              />
            ) : (
              <FlatList
                data={nearbyScooters || []}
                keyExtractor={(item) => item.id || item._id}
                renderItem={renderScooterCard}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.verticalScrollContent}
              />
            )}

            {/* Scanning action button when expanded */}
            {bottomSheetState === 'EXPANDED' && (
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('QrScan')}
              >
                <Text style={styles.primaryButtonText}>⊙   SCAN TO UNLOCK</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          /* Selected Scooter View */
          selectedScooter && (
            <View style={styles.selectedView}>
              <View style={styles.selectedHeader}>
                <View>
                  <Text style={styles.selectedModelLabel}>
                    {(selectedScooter.model || 'MOVEET').toUpperCase()}
                  </Text>
                  <Text style={styles.selectedName}>
                    {selectedScooter.displayName || selectedScooter.model || 'Moveet Sport'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleCloseSelection}
                >
                  <Ionicons name="close-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>⚡ BATTERY</Text>
                  <Text style={styles.statVal}>{selectedScooter.battery}%</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>➔ RANGE</Text>
                  <Text style={styles.statVal}>~{selectedScooter.rangeKm || 45} km</Text>
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
                disabled={isStartingRide}
                onPress={handleStartMission}
              >
                {isStartingRide ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>START MISSION</Text>
                )}
              </TouchableOpacity>
            </View>
          )
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 12,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greetingLabel: {
    color: '#555555',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  greetingName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#222222',
  },
  walletText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: 100,
    gap: 12,
  },
  mapControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#0D0D0D',
  },
  markerDotAvailable: {
    backgroundColor: '#00E676',
  },
  markerDotOther: {
    backgroundColor: '#888888',
  },
  tooltipContainer: {
    alignItems: 'center',
    width: 160,
  },
  tooltipCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00E676',
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '100%',
  },
  tooltipName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  tooltipStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tooltipStat: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '600',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#00E676',
    alignSelf: 'center',
  },
  bottomSheet: {
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#222222',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    maxHeight: 320,
  },
  bottomSheetExpanded: {
    maxHeight: 620,
    height: 620,
  },
  bottomSheetSelected: {
    maxHeight: 280,
    height: 280,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  horizontalScrollContent: {
    paddingBottom: spacing.lg,
    gap: 12,
  },
  verticalScrollContent: {
    paddingBottom: 80, // space for scan button
  },
  scooterCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#222222',
    marginRight: 12,
    marginBottom: 12,
    height: 170,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  cardModel: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
    marginRight: 4,
  },
  cardBattery: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
  },
  cardCode: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  cardPlaceholderSpace: {
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeAvailable: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  badgeLocked: {
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
  },
  badgeInUse: {
    backgroundColor: 'rgba(255, 235, 59, 0.15)',
  },
  badgeMaintenance: {
    backgroundColor: 'rgba(61, 90, 254, 0.15)',
  },
  badgeOther: {
    backgroundColor: '#222222',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeTextAvailable: {
    color: '#00E676',
  },
  badgeTextLocked: {
    color: '#FF4444',
  },
  badgeTextInUse: {
    color: '#FFEB3B',
  },
  badgeTextMaintenance: {
    color: '#3D5AFE',
  },
  badgeTextOther: {
    color: '#888888',
  },
  cardDistance: {
    color: '#888888',
    fontSize: 11,
    fontStyle: 'italic',
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.md,
  },
  primaryButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  selectedView: {
    width: '100%',
    paddingBottom: spacing.sm,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  selectedModelLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  selectedName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  statLabel: {
    color: '#888888',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
