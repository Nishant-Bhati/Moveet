import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';

const { width: screenWidth } = Dimensions.get('window');

export default function RideSummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const completedRide = route.params?.completedRide;

  // Wallet details from Redux
  const profile = useSelector((state) => state.user.profile);
  const profileData = profile?.data || profile;
  const walletBalance = profileData?.walletBalance !== undefined ? profileData.walletBalance : 0;

  // Spring animation ref
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(checkmarkScale, {
      toValue: 1,
      tension: 40,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [checkmarkScale]);

  const handleDone = () => {
    // Reset navigation stack to Home
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
    });
  };

  const handleViewHistory = () => {
    navigation.navigate('RideHistory');
  };

  // Format date/time
  const getFormattedDate = () => {
    if (!completedRide) return '';
    const date = new Date(completedRide.endTime || completedRide.updatedAt || Date.now());
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const durationMin = completedRide?.durationSeconds
    ? Math.ceil(completedRide.durationSeconds / 60)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Checkmark in Green Circle */}
        <Animated.View style={[
          styles.checkmarkCircle,
          { transform: [{ scale: checkmarkScale }] }
        ]}>
          <Ionicons name="checkmark" size={60} color="#000000" />
        </Animated.View>

        {/* MISSION OVER Badge */}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MISSION OVER</Text>
        </View>

        {/* Heading */}
        <Text style={styles.heading}>Ride Complete!</Text>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.grid}>
            {/* Box 1: Duration */}
            <View style={styles.statBox}>
              <View style={styles.statLabelRow}>
                <Ionicons name="time-outline" size={14} color="#888888" style={styles.statIcon} />
                <Text style={styles.statLabel}>DURATION</Text>
              </View>
              <Text style={styles.statVal}>{durationMin}m</Text>
            </View>

            {/* Box 2: Cost */}
            <View style={styles.statBox}>
              <View style={styles.statLabelRow}>
                <Text style={styles.statIconText}>₹</Text>
                <Text style={styles.statLabel}>COST</Text>
              </View>
              <Text style={styles.statVal}>
                {completedRide?.cost !== undefined ? `₹${completedRide.cost}` : '₹0'}
              </Text>
            </View>

            {/* Box 3: Distance */}
            <View style={styles.statBox}>
              <View style={styles.statLabelRow}>
                <Ionicons name="navigate-outline" size={14} color="#888888" style={styles.statIcon} />
                <Text style={styles.statLabel}>DISTANCE</Text>
              </View>
              <Text style={styles.statVal}>
                {completedRide?.distanceKm ? `${completedRide.distanceKm} km` : '—'}
              </Text>
            </View>

            {/* Box 4: Scooter */}
            <View style={styles.statBox}>
              <View style={styles.statLabelRow}>
                <Ionicons name="flash-outline" size={14} color="#888888" style={styles.statIcon} />
                <Text style={styles.statLabel}>SCOOTER</Text>
              </View>
              <Text style={styles.statVal} numberOfLines={1}>
                {completedRide?.scooterId?.code || '—'}
              </Text>
            </View>
          </View>

          {/* Date Time info */}
          <Text style={styles.dateTimeText}>{getFormattedDate()}</Text>
        </View>

        {/* Wallet Balance row */}
        <View style={styles.walletRow}>
          <Text style={styles.walletLabel}>Wallet: ₹{walletBalance}</Text>
          <View style={styles.updateIndicator}>
            <View style={styles.greenDot} />
            <Text style={styles.updateText}>Updated</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={handleDone}
        >
          <Text style={styles.primaryButtonText}>DONE</Text>
        </TouchableOpacity>

        {/* Secondary link */}
        <TouchableOpacity
          style={styles.linkButton}
          activeOpacity={0.7}
          onPress={handleViewHistory}
        >
          <Text style={styles.linkButtonText}>View History</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  badge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: spacing.sm,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: spacing.xxl,
  },
  summaryCard: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 16,
    width: '100%',
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
    marginBottom: spacing.md,
  },
  statBox: {
    width: (screenWidth - 48 - 32 - 12) / 2, // Calculate custom width to fit 2 boxes in width
    backgroundColor: '#0F0F0F',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#222222',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statIcon: {
    marginRight: 4,
  },
  statIconText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  statLabel: {
    color: '#888888',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateTimeText: {
    color: '#888888',
    fontSize: 12,
    marginTop: spacing.sm,
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xxl,
  },
  walletLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  updateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  updateText: {
    color: '#888888',
    fontSize: 12,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  linkButton: {
    paddingVertical: spacing.sm,
  },
  linkButtonText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
