import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';
import { fetchActiveRideThunk, endRideThunk } from '../../store/rideSlice';

export default function ActiveRideScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Select state from Redux
  const activeRide = useSelector((state) => state.ride.activeRide);
  const profile = useSelector((state) => state.user.profile);

  const profileData = profile?.data || profile;
  const hasActivePlan = !!profileData?.activePlanId;

  // Local State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isEnding, setIsEnding] = useState(false);

  // Mount logic: Load active ride
  useEffect(() => {
    const checkActiveRide = async () => {
      try {
        const result = await dispatch(fetchActiveRideThunk()).unwrap();
        if (!result) {
          // Redirect back to Home if no active ride
          navigation.navigate('MainTabs', { screen: 'Home' });
        }
      } catch (err) {
        console.error('Failed to fetch active ride:', err);
        navigation.navigate('MainTabs', { screen: 'Home' });
      }
    };

    checkActiveRide();
  }, [dispatch, navigation]);

  // Live timer counting up
  useEffect(() => {
    if (!activeRide) return;

    const startTime = new Date(activeRide.startTime).getTime();

    // Set immediate value
    setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));

    const interval = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRide]);

  // Calculate costs
  const minutelyRate = activeRide?.scooterId?.pricing?.minutely || 5;
  const minsChargeable = Math.ceil(elapsedSeconds / 60);
  const estimatedCost = minsChargeable * minutelyRate;

  // Format timer text
  const getTimerString = () => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndMissionPress = () => {
    const chargeMsg = hasActivePlan
      ? '₹0 — Plan Active.'
      : `You'll be charged ₹${estimatedCost}.`;

    Alert.alert(
      'End this ride?',
      chargeMsg,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: handleConfirmEndRide,
        },
      ]
    );
  };

  const handleConfirmEndRide = async () => {
    setIsEnding(true);
    try {
      const result = await dispatch(endRideThunk()).unwrap();
      // Navigate to summary on success, replace stack
      navigation.replace('RideSummary', { completedRide: result });
    } catch (err) {
      console.error('Failed to end ride:', err);
      Alert.alert('Error', err || 'Failed to end your ride. Please try again.');
    } finally {
      setIsEnding(false);
    }
  };

  const handleBackToHome = () => {
    navigation.navigate('MainTabs', { screen: 'Home' });
  };

  if (!activeRide) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  const batteryPct = activeRide.scooterId?.battery || 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleBackToHome} activeOpacity={0.8}>
          <Ionicons name="close-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ACTIVE MISSION</Text>
        <View style={styles.closeBtnPlaceholder} />
      </View>

      <View style={styles.content}>
        {/* Scooter Info Card */}
        <View style={styles.scooterCard}>
          <View>
            <Text style={styles.scooterModel}>
              {activeRide.scooterId?.model || 'Moveet Scooter'}
            </Text>
            <Text style={styles.scooterCode}>
              {activeRide.scooterId?.code || 'MOVEET'}
            </Text>
          </View>
          <View style={styles.readyBadge}>
            <Text style={styles.readyBadgeText}>READY</Text>
          </View>
        </View>

        {/* Center Timer Card */}
        <View style={styles.timerCard}>
          {/* Timer text */}
          <Text style={styles.timerText}>{getTimerString()}</Text>
          <Text style={styles.timerLabel}>MISSION TIME</Text>

          {/* Pricing indicators */}
          {hasActivePlan ? (
            <Text style={styles.costText}>₹0 — Plan Active</Text>
          ) : (
            <Text style={styles.costText}>~₹{estimatedCost}</Text>
          )}

          {/* Battery Progress Bar */}
          <View style={styles.batteryContainer}>
            <View style={styles.batteryLabelRow}>
              <Text style={styles.batteryLabel}>SCOOTER BATTERY</Text>
              <Text style={styles.batteryVal}>{batteryPct}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${batteryPct}%` }]} />
            </View>
          </View>
        </View>

        {/* Locate map overlay placeholder or indicator */}
        <View style={styles.mapIndicator}>
          <Ionicons name="map-outline" size={16} color="#888888" />
          <Text style={styles.mapIndicatorText}>Riding in active zone</Text>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomButtonsRow}>
          {/* Locate Button */}
          <TouchableOpacity
            style={styles.locateBtn}
            activeOpacity={0.8}
            onPress={handleBackToHome}
          >
            <Ionicons name="navigate-outline" size={18} color="#FFFFFF" style={styles.locateIcon} />
            <Text style={styles.locateText}>LOCATE</Text>
          </TouchableOpacity>

          {/* End Mission Button */}
          <TouchableOpacity
            style={styles.endBtn}
            activeOpacity={0.8}
            disabled={isEnding}
            onPress={handleEndMissionPress}
          >
            {isEnding ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <>
                <Text style={styles.endText}>⚡ END MISSION</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  closeBtnPlaceholder: {
    width: 36,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    justifyContent: 'space-between',
  },
  scooterCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  scooterModel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scooterCode: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  readyBadge: {
    backgroundColor: '#1B4D2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  readyBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timerCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timerLabel: {
    color: '#555555',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  costText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
  },
  batteryContainer: {
    width: '100%',
    marginTop: spacing.sm,
  },
  batteryLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  batteryLabel: {
    color: '#555555',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  batteryVal: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#222222',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  mapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  mapIndicatorText: {
    color: '#888888',
    fontSize: 12,
    marginLeft: 6,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  locateBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#111111',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locateIcon: {
    marginRight: 6,
  },
  locateText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  endBtn: {
    flex: 1.3,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  endText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
