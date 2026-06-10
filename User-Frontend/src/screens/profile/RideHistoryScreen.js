import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';
import { fetchRideHistoryThunk } from '../../store/rideSlice';

export default function RideHistoryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  // Route parameters: Profile passes detailed: false, Scooter passes detailed: true
  const initialDetailed = route.params?.detailed ?? false;

  // Local state for toggled tab/view version
  const [isDetailed, setIsDetailed] = useState(initialDetailed);

  // Redux state
  const { rideHistory, isLoading } = useSelector((state) => state.ride);

  // Load history on mount
  useEffect(() => {
    dispatch(fetchRideHistoryThunk());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchRideHistoryThunk());
  };

  // Render Version A (Simple — from Profile)
  const renderSimpleCard = (item) => {
    const isIssueReported = item.status === 'CANCELLED';
    const dateStr = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const durationMin = Math.ceil((item.durationSeconds || 0) / 60);

    return (
      <View style={styles.card}>
        {/* Row 1: Scooter Name + Status badge */}
        <View style={styles.cardHeader}>
          <View style={styles.nameCol}>
            <Text style={styles.scooterName}>
              {item.scooterId?.model || 'Moveet Sport'}
            </Text>
            <Text style={styles.scooterCode}>
              {item.scooterId?.code || 'MOVEET'}
            </Text>
          </View>
          <View style={[styles.badge, isIssueReported ? styles.badgeRed : styles.badgeGreen]}>
            <Text style={[styles.badgeText, isIssueReported ? styles.badgeTextRed : styles.badgeTextGreen]}>
              ● {isIssueReported ? 'ISSUE REPORTED' : 'SUCCESS'}
            </Text>
          </View>
        </View>

        {/* Row 2: ⏱ duration | ⚡ cost | ⊙ date */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color="#888888" style={styles.statIcon} />
            <Text style={styles.statText}>{durationMin} min</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="flash-outline" size={14} color="#888888" style={styles.statIcon} />
            <Text style={styles.statText}>₹{item.cost || 0}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={14} color="#888888" style={styles.statIcon} />
            <Text style={styles.statText}>{dateStr}</Text>
          </View>
        </View>

        {/* Row 3: "VIEW DETAILS >" link */}
        <TouchableOpacity
          style={styles.detailsLink}
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert(
              'Ride Details',
              `Scooter: ${item.scooterId?.model || 'Moveet Sport'}\nCode: ${item.scooterId?.code || 'MOVEET'}\nDuration: ${durationMin} mins\nCost: ₹${item.cost || 0}\nDate: ${dateStr}\nStatus: ${item.status}`
            );
          }}
        >
          <Text style={styles.detailsLinkText}>VIEW DETAILS &gt;</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Version B (Detailed — from Scooter dashboard)
  const renderDetailedCard = (item) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const durationMin = Math.ceil((item.durationSeconds || 0) / 60);
    const distanceVal = item.distanceKm ? item.distanceKm.toFixed(1) : (durationMin * 0.25).toFixed(1);
    const fromLabel = item.fromLabel || 'Connaught Place';
    const toLabel = item.toLabel || 'Rajouri Garden';

    return (
      <View style={styles.card}>
        {/* Top row: Scooter Name + Date + Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.nameCol}>
            <Text style={styles.scooterName}>
              {item.scooterId?.model || 'Moveet Sport'}
            </Text>
            <Text style={styles.scooterDate}>{dateStr}</Text>
          </View>
          <View style={[styles.badge, styles.badgeGreen]}>
            <Text style={[styles.badgeText, styles.badgeTextGreen]}>
              ● MISSION OVER
            </Text>
          </View>
        </View>

        {/* Location row: ⊙ from-label → ↗ to-label */}
        <View style={styles.locationRow}>
          <Text style={styles.locationText}>
            ⊙ {fromLabel}  →  ↗ {toLabel}
          </Text>
        </View>

        {/* Stats row: ⏱ duration | ↗ distance km | ₹ cost */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color="#888888" style={styles.statIcon} />
            <Text style={styles.statText}>{durationMin} min</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="navigate-outline" size={14} color="#888888" style={styles.statIcon} />
            <Text style={styles.statText}>{distanceVal} km</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="cash-outline" size={14} color="#888888" style={styles.statIcon} />
            <Text style={styles.statText}>₹{item.cost || 0}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={[styles.title, !isDetailed && styles.titleCaps]}>
          {isDetailed ? 'Ride History' : 'RIDE HISTORY'}
        </Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* Tabs Switcher Toggle */}
      <View style={styles.tabSwitcherContainer}>
        <TouchableOpacity
          style={[styles.switcherTab, !isDetailed && styles.switcherTabActive]}
          activeOpacity={0.8}
          onPress={() => setIsDetailed(false)}
        >
          <Text style={[styles.switcherTabText, !isDetailed && styles.switcherTabActiveText]}>
            SIMPLE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switcherTab, isDetailed && styles.switcherTabActive]}
          activeOpacity={0.8}
          onPress={() => setIsDetailed(true)}
        >
          <Text style={[styles.switcherTabText, isDetailed && styles.switcherTabActiveText]}>
            DETAILED
          </Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      <FlatList
        data={rideHistory || []}
        keyExtractor={(item) => item.id || item._id}
        renderItem={({ item }) => (isDetailed ? renderDetailedCard(item) : renderSimpleCard(item))}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#555555" />
              <Text style={styles.emptyText}>No rides yet.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPlaceholder: {
    width: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleCaps: {
    letterSpacing: 1.5,
  },
  tabSwitcherContainer: {
    flexDirection: 'row',
    backgroundColor: '#151515',
    borderRadius: 24,
    padding: 4,
    marginHorizontal: spacing.xxl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: '#222222',
  },
  switcherTab: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switcherTabActive: {
    backgroundColor: colors.primary,
  },
  switcherTabText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  switcherTabActiveText: {
    color: '#000000',
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
    gap: 14,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameCol: {
    flex: 1,
    marginRight: 12,
  },
  scooterName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scooterCode: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  scooterDate: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeGreen: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
  },
  badgeRed: {
    backgroundColor: 'rgba(255, 68, 68, 0.12)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  badgeTextGreen: {
    color: colors.primary,
  },
  badgeTextRed: {
    color: colors.danger,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 6,
  },
  statText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#333333',
    marginHorizontal: 12,
  },
  detailsLink: {
    borderTopWidth: 1,
    borderTopColor: '#252525',
    paddingTop: 12,
    marginTop: 6,
  },
  detailsLinkText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  locationRow: {
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  locationText: {
    color: '#888888',
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#888888',
    fontSize: 14,
    marginTop: 12,
  },
});
