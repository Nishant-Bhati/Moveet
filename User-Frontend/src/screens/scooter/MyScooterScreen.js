import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';
import { fetchActiveRideThunk, fetchRideHistoryThunk, startRideThunk } from '../../store/rideSlice';
import { fetchNearbyScooters, setSelectedScooter } from '../../store/scooterSlice';
import { fetchPlansThunk, subscribePlanThunk } from '../../store/paymentSlice';
import { fetchNotificationsThunk, markAsReadThunk } from '../../store/notificationSlice';

const { width: screenWidth } = Dimensions.get('window');

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function MyScooterScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux selectors
  const profile = useSelector((state) => state.user.profile);
  const { activeRide, rideHistory } = useSelector((state) => state.ride);
  const { nearbyScooters } = useSelector((state) => state.scooter);
  const { plans, isLoading: isPaymentLoading } = useSelector((state) => state.payment);
  const notifications = useSelector((state) => state.notification.notifications);

  // Profile data mapping
  const profileData = profile?.data || profile;
  const hasActivePlan = !!profileData?.activePlanId;
  const initials = (profileData?.firstName?.[0] || 'S') + (profileData?.lastName?.[0] || '');

  // Local State
  const [activeTab, setActiveTab] = useState('ACTIVE_RIDES'); // 'ACTIVE_RIDES' or 'RIDE_PLANS'
  const [isWeeklyPlanSheetVisible, setIsWeeklyPlanSheetVisible] = useState(false);
  const [selectedDays, setSelectedDays] = useState(DAYS);

  // Mount API Calls
  useEffect(() => {
    dispatch(fetchActiveRideThunk());
    dispatch(fetchRideHistoryThunk());
    dispatch(fetchPlansThunk());
    dispatch(fetchNotificationsThunk());
    // Fetch nearby scooters using default coords
    dispatch(fetchNearbyScooters({ lat: 28.01, lng: 77.24 }));
  }, [dispatch]);

  // Mark notification as read handler
  const handleMarkAsRead = async (notifId) => {
    try {
      await dispatch(markAsReadThunk(notifId)).unwrap();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };


  // Start Engine Action
  const handleStartEngine = async () => {
    if (activeRide) {
      // If ride already active, go directly to screen
      navigation.navigate('ActiveRide');
    } else {
      // If a nearby scooter exists, start ride
      const scooterToStart = nearbyScooters?.[0];
      if (scooterToStart) {
        try {
          const scooterId = scooterToStart._id || scooterToStart.id;
          await dispatch(startRideThunk(scooterId)).unwrap();
          navigation.navigate('ActiveRide');
        } catch (err) {
          Alert.alert('Error', err || 'Failed to start engine');
        }
      } else {
        Alert.alert('Notice', 'No nearby scooters available to start engine. Please locate on map.');
      }
    }
  };

  // Select Scooter row
  const handleSelectNearbyScooter = (scooter) => {
    dispatch(setSelectedScooter(scooter));
    navigation.navigate('MainTabs', {
      screen: 'Home',
      params: { scannedScooterId: scooter._id || scooter.id }
    });
  };

  // Activate Plans Action
  const handleActivatePlan = (planId) => {
    if (planId === 'weekly') {
      setSelectedDays(DAYS);
      setIsWeeklyPlanSheetVisible(true);
    } else {
      Alert.alert(
        'Confirm Subscription',
        `Activate ${planId.toUpperCase()} Plan?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              try {
                await dispatch(subscribePlanThunk(planId)).unwrap();
                Alert.alert('Success', `${planId.toUpperCase()} Plan activated successfully!`);
              } catch (err) {
                Alert.alert('Error', err || 'Subscription failed');
              }
            }
          }
        ]
      );
    }
  };

  // Confirm Weekly Plan Schedule from sheet
  const handleConfirmWeeklySchedule = async () => {
    setIsWeeklyPlanSheetVisible(false);
    try {
      await dispatch(subscribePlanThunk('weekly')).unwrap();
      Alert.alert('Success', 'Weekly Plan activated successfully!');
    } catch (err) {
      Alert.alert('Error', err || 'Subscription failed');
    }
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Calculate CO2 Saved
  const totalTrips = rideHistory ? rideHistory.length : 12;
  const co2Saved = (totalTrips * 0.12).toFixed(1);

  // Retrieve unread notifications (mock if list empty)
  const alertNotifications = notifications?.length > 0
    ? notifications.filter((n) => !n.isRead).slice(0, 2)
    : [
        { id: 'm1', message: '12 scooters are currently available within your active zone.' },
        { id: 'm2', message: 'Your Weekly Plan renews automatically on 2 May at 12:00 AM.' }
      ];

  const recentTripsData = rideHistory?.length > 0
    ? rideHistory.slice(0, 3)
    : [
        { _id: 't1', createdAt: '2026-04-26T12:00:00Z', scooterId: { model: 'Moveet Pro X' }, durationSeconds: 1080, cost: 90 },
        { _id: 't2', createdAt: '2026-04-25T14:30:00Z', scooterId: { model: 'Moveet Sport X' }, durationSeconds: 720, cost: 60 }
      ];

  // Tab switch logic
  const renderTabContent = () => {
    if (activeTab === 'ACTIVE_RIDES') {
      return (
        <View style={styles.tabContentContainer}>
          {activeRide ? (
            /* MY SCOOTER CARD */
            <View style={styles.myScooterCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardModelLabel}>
                    {(activeRide.scooterId?.model || 'MOVEET').toUpperCase()}
                  </Text>
                  <Text style={styles.cardCode}>
                    {activeRide.scooterId?.code || 'MOVEET'}
                  </Text>
                </View>
                <View style={styles.readyBadge}>
                  <Text style={styles.readyBadgeText}>● READY</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="flash-outline" size={14} color="#888888" />
                  <Text style={styles.statItemText}>
                    {activeRide.scooterId?.battery || 85}%
                  </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Ionicons name="navigate-outline" size={14} color="#888888" />
                  <Text style={styles.statItemText}>
                    {activeRide.scooterId?.rangeKm || 42} km
                  </Text>
                </View>
              </View>

              <View style={styles.cardButtonsRow}>
                <TouchableOpacity
                  style={styles.ghostBtn}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
                >
                  <Ionicons name="navigate-outline" size={16} color="#FFFFFF" style={styles.btnIcon} />
                  <Text style={styles.ghostBtnText}>↗ LOCATE</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.greenBtn}
                  activeOpacity={0.8}
                  onPress={handleStartEngine}
                >
                  <Text style={styles.greenBtnText}>
                    {activeRide ? 'END RIDE' : '⚡ START ENGINE'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* NO ACTIVE RIDE STATE */
            <View style={styles.noActiveRideContainer}>
              <View style={styles.illustrationCircle}>
                <Ionicons name="bicycle-outline" size={40} color="#555555" />
              </View>
              <Text style={styles.noActiveTitle}>No active ride</Text>
              <Text style={styles.noActiveSubtext}>Book a scooter to start your urban mission.</Text>
              <TouchableOpacity
                style={styles.findScooterBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
              >
                <Text style={styles.findScooterBtnText}>FIND A SCOOTER</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* RECENT TRIPS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>RECENT TRIPS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RideHistory', { detailed: true })}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={recentTripsData}
            keyExtractor={(item) => item._id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              const dateStr = new Date(item.createdAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });
              const durationMin = Math.ceil((item.durationSeconds || 0) / 60);

              return (
                <View style={styles.tripCard}>
                  <Text style={styles.tripDate}>{dateStr}</Text>
                  <Text style={styles.tripScooterName}>
                    {item.scooterId?.model || 'Moveet Scooter'}
                  </Text>
                  <View style={styles.tripFooter}>
                    <Text style={styles.tripDuration}>
                      <Ionicons name="time-outline" size={12} color="#888888" /> {durationMin} min
                    </Text>
                    <Text style={styles.tripCost}>₹{item.cost || 0}</Text>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={styles.tripsScroll}
          />

          {/* AVAILABLE NEARBY */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AVAILABLE NEARBY</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}>
              <Text style={styles.sectionLink}>See Map</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nearbyList}>
            {nearbyScooters && nearbyScooters.slice(0, 3).map((scooter) => (
              <TouchableOpacity
                key={scooter.id || scooter._id}
                style={styles.nearbyRow}
                activeOpacity={0.8}
                onPress={() => handleSelectNearbyScooter(scooter)}
              >
                <View style={styles.pinCircle}>
                  <Ionicons name="location" size={16} color="#00E676" />
                </View>
                
                <View style={styles.nearbyInfo}>
                  <Text style={styles.nearbyModelLabel}>
                    {(scooter.model || 'MOVEET').toUpperCase()}
                  </Text>
                  <Text style={styles.nearbyName}>
                    {scooter.displayName || scooter.model || 'Moveet Scooter'}
                  </Text>
                  <View style={styles.nearbyStatsRow}>
                    <View style={styles.nearbyBadge}>
                      <Text style={styles.nearbyBadgeText}>● {scooter.status}</Text>
                    </View>
                    <Text style={styles.nearbyMetaText}>⚡ {scooter.battery}%</Text>
                    <Text style={styles.nearbyMetaText}>·</Text>
                    <Text style={styles.nearbyMetaText}>{getDistanceString(scooter)}</Text>
                  </View>
                </View>

                <View style={styles.nearbyPriceCol}>
                  <Text style={styles.nearbyPriceText}>
                    ₹{scooter.pricing?.minutely || 2}/min
                  </Text>
                  <View style={styles.chevronCircle}>
                    <Ionicons name="chevron-forward" size={14} color="#00E676" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } else {
      /* RIDE PLANS TAB */
      const currentActivePlanId = profileData?.activePlanId;

      return (
        <View style={styles.plansContainer}>
          {isPaymentLoading && plans.length === 0 ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            plans.map((plan) => {
              const isActive = currentActivePlanId === plan._id;
              
              return (
                <TouchableOpacity
                  key={plan._id}
                  activeOpacity={isActive ? 1.0 : 0.9}
                  disabled={isActive}
                  onPress={() => handleActivatePlan(plan._id)}
                  style={[styles.planCard, isActive && styles.planCardActive]}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name || 'Moveet Plan'}</Text>
                    <Text style={styles.planPrice}>₹{plan.price}{plan.priceLabel || '/d'}</Text>
                  </View>

                  <Text style={styles.planSubtitle}>
                    {plan.subtitle || `${plan.durationHours} HOURS • UNLIMITED`}
                  </Text>

                  {/* Features list */}
                  <View style={styles.featuresList}>
                    {(plan.features || ['Unlimited rides', 'No unlock fees']).map((feature, idx) => (
                      <View key={idx} style={styles.featureItem}>
                        <Ionicons name="flash" size={12} color="#00E676" style={styles.featureIcon} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Activate button View (nested inside card touchable) */}
                  <View style={[styles.planBtn, isActive && styles.planBtnActive]}>
                    <Text style={[styles.planBtnText, isActive && styles.planBtnActiveText]}>
                      {isActive ? `${plan.name.toUpperCase()} ACTIVE` : `ACTIVATE ${plan.name.toUpperCase()}`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      );
    }
  };

  // Helper distance calculations
  const getDistanceString = (scooter) => {
    const lat1 = 28.01;
    const lon1 = 77.24;
    const lat2 = scooter.latitude || scooter.location?.coordinates[1] || 28.01;
    const lon2 = scooter.longitude || scooter.location?.coordinates[0] || 77.24;

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
      return `${Math.round(d)}m`;
    } else {
      return `${(d / 1000).toFixed(1)}km`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>My Scooter</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Stats Card */}
        <View style={styles.userStatsCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={styles.statsCenter}>
            <Text style={styles.planLabel}>
              {hasActivePlan ? 'WEEKLY PLAN ACTIVE' : 'NO ACTIVE PLAN'}
            </Text>
            
            <View style={styles.statsRowCenter}>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>{totalTrips}</Text>
                <Text style={styles.statLabelSub}>TRIPS</Text>
              </View>
              <View style={styles.statColumn}>
                <Text style={styles.statNumber}>{co2Saved}</Text>
                <Text style={styles.statLabelSub}>KG CO2 SAVED</Text>
              </View>
            </View>
          </View>

          <View style={[styles.proBadge, !hasActivePlan && styles.proBadgeInactive]}>
            <Text style={[styles.proBadgeText, !hasActivePlan && styles.proBadgeInactiveText]}>
              ● PRO MEMBER
            </Text>
          </View>
        </View>

        {/* ALERTS Section */}
        {alertNotifications.length > 0 && (
          <View style={styles.alertsSection}>
            <View style={styles.sectionHeaderAlert}>
              <Text style={styles.sectionTitle}>ALERTS</Text>
              <Text style={styles.sectionLink}>Inbox</Text>
            </View>

            {alertNotifications.map((notif) => (
              <TouchableOpacity
                key={notif.id || notif._id}
                style={styles.notificationCard}
                activeOpacity={0.8}
                onPress={() => handleMarkAsRead(notif.id || notif._id)}
              >
                <View style={styles.infoCircle}>
                  <Ionicons name="information-circle" size={16} color={colors.primary} />
                </View>
                <Text style={styles.notificationText}>{notif.message || notif.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* TAB SWITCHER */}
        <View style={styles.tabSwitcherContainer}>
          <TouchableOpacity
            style={[styles.switcherTab, activeTab === 'ACTIVE_RIDES' && styles.switcherTabActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('ACTIVE_RIDES')}
          >
            <Text style={[styles.switcherTabText, activeTab === 'ACTIVE_RIDES' && styles.switcherTabActiveText]}>
              ACTIVE RIDES
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switcherTab, activeTab === 'RIDE_PLANS' && styles.switcherTabActive]}
            activeOpacity={0.8}
            onPress={() => setActiveTab('RIDE_PLANS')}
          >
            <Text style={[styles.switcherTabText, activeTab === 'RIDE_PLANS' && styles.switcherTabActiveText]}>
              RIDE PLANS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab content renderer */}
        {renderTabContent()}
      </ScrollView>

      {/* Weekly Plan Bottom Sheet: Select Usage */}
      <Modal
        visible={isWeeklyPlanSheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsWeeklyPlanSheetVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetDismissArea}
            activeOpacity={1}
            onPress={() => setIsWeeklyPlanSheetVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>SELECT USAGE</Text>
              <TouchableOpacity onPress={() => setIsWeeklyPlanSheetVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* 7 Days Scheduler */}
            <View style={styles.daysRow}>
              {DAYS.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayPill, isSelected && styles.dayPillSelected]}
                    activeOpacity={0.8}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[styles.dayPillText, isSelected && styles.dayPillSelectedText]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Bottom Actions Row */}
            <View style={styles.sheetFooter}>
              <View>
                <Text style={styles.scheduleLabel}>PLAN ACTIVE FOR:</Text>
                <Text style={styles.scheduleVal}>{selectedDays.length} Days / Week</Text>
              </View>

              <TouchableOpacity
                style={styles.confirmBtn}
                activeOpacity={0.8}
                onPress={handleConfirmWeeklySchedule}
              >
                <Text style={styles.confirmBtnText}>CONFIRM SCHEDULE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  flex: {
    flex: 1,
  },
  topBar: {
    height: 56,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  userStatsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#0F0F0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statsCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  planLabel: {
    color: '#555555',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  statsRowCenter: {
    flexDirection: 'row',
    gap: 16,
  },
  statColumn: {
    flexDirection: 'column',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabelSub: {
    color: '#888888',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
  },
  proBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  proBadgeInactive: {
    backgroundColor: '#222222',
  },
  proBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  proBadgeInactiveText: {
    color: '#888888',
  },
  alertsSection: {
    marginBottom: spacing.xl,
  },
  sectionHeaderAlert: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: '#555555',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  sectionLink: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationCard: {
    backgroundColor: '#161616',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 8,
  },
  infoCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  tabSwitcherContainer: {
    backgroundColor: '#151515',
    borderRadius: 24,
    padding: 4,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xl,
  },
  switcherTab: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switcherTabActive: {
    backgroundColor: colors.primary,
  },
  switcherTabText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  switcherTabActiveText: {
    color: '#000000',
  },
  tabContentContainer: {
    width: '100%',
  },
  myScooterCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardModelLabel: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  cardCode: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  readyBadge: {
    backgroundColor: '#1B4D2E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  readyBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#333333',
    marginHorizontal: 16,
  },
  cardButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ghostBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  btnIcon: {
    marginRight: 6,
  },
  ghostBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  greenBtn: {
    flex: 1.3,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  noActiveRideContainer: {
    backgroundColor: '#161616',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 24,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  illustrationCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noActiveTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noActiveSubtext: {
    color: '#888888',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  findScooterBtn: {
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  findScooterBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  tripsScroll: {
    paddingBottom: spacing.xl,
    gap: 12,
  },
  tripCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 14,
    width: 160,
  },
  tripDate: {
    color: '#888888',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tripScooterName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDuration: {
    color: '#888888',
    fontSize: 11,
  },
  tripCost: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  nearbyList: {
    width: '100%',
    gap: 10,
  },
  nearbyRow: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nearbyInfo: {
    flex: 1,
  },
  nearbyModelLabel: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  nearbyName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 1,
  },
  nearbyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  nearbyBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nearbyBadgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: 'bold',
  },
  nearbyMetaText: {
    color: '#888888',
    fontSize: 11,
  },
  nearbyPriceCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  nearbyPriceText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  chevronCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plansContainer: {
    width: '100%',
    gap: 16,
  },
  planCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 18,
  },
  planCardActive: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planName: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  planPrice: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  planSubtitle: {
    color: '#555555',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  featuresList: {
    gap: 6,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    marginRight: 6,
  },
  featureText: {
    color: colors.primary,
    fontSize: 12,
  },
  planBtn: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planBtnActive: {
    backgroundColor: '#222222',
    borderWidth: 1,
    borderColor: '#333333',
  },
  planBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  planBtnActiveText: {
    color: colors.primary,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheetDismissArea: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 24,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xl,
  },
  dayPill: {
    width: (screenWidth - 48 - 48) / 7, // Fits 7 pills nicely
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayPillText: {
    color: '#888888',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dayPillSelectedText: {
    color: '#000000',
  },
  sheetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleLabel: {
    color: '#555555',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scheduleVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  confirmBtn: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
