import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing } from '../../utils/theme';
import { fetchMeThunk } from '../../store/userSlice';
import { cancelSubscriptionThunk, fetchTransactionsThunk } from '../../store/paymentSlice';
import * as userApi from '../../api/userApi';

export default function MySubscriptionsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux state
  const profile = useSelector((state) => state.user.profile);
  const profileData = profile?.data || profile;
  const activePlanId = profileData?.activePlanId;
  const transactions = useSelector((state) => state.payment.transactions || []);
  const isLoading = useSelector((state) => state.payment.isLoading);

  // Local state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isTogglingAutoRenew, setIsTogglingAutoRenew] = useState(false);

  // Sync data on mount
  useEffect(() => {
    dispatch(fetchMeThunk());
    dispatch(fetchTransactionsThunk());
  }, [dispatch]);

  // Filter Transactions
  const subTransactions = transactions.filter((t) => t.referenceType === 'SUBSCRIPTION');

  // Days left calculation
  const getDaysLeft = () => {
    if (!profileData?.planExpiryDate) return '6 Days Left';
    const expiry = new Date(profileData.planExpiryDate);
    const diff = expiry - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} Days Left` : 'Expired';
  };

  // Expiry date formatter
  const getExpiryDateStr = () => {
    if (!profileData?.planExpiryDate) return '3 May, 12:00 am';
    return new Date(profileData.planExpiryDate).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).replace(' at ', ', ');
  };

  // Auto-renewal switch trigger
  const handleToggleAutoRenew = async () => {
    setIsTogglingAutoRenew(true);
    try {
      await userApi.toggleAutoRenew();
      await dispatch(fetchMeThunk()).unwrap();
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle auto-renewal status.');
    } finally {
      setIsTogglingAutoRenew(false);
    }
  };

  // Cancel subscription action
  const handleCancelSubscription = async () => {
    try {
      await dispatch(cancelSubscriptionThunk()).unwrap();
      await dispatch(fetchMeThunk()).unwrap();
      setShowCancelConfirm(false);
      Alert.alert('Success', 'Subscription plan cancelled successfully.');
    } catch (err) {
      Alert.alert('Cancellation Failed', err || 'Failed to cancel subscription.');
    }
  };

  // Sub name mappings
  const getPlanName = () => {
    if (activePlanId === 'weekly') return 'Weekly Glide';
    if (activePlanId === 'daily') return 'Daily Glide';
    if (activePlanId === 'monthly') return 'Monthly Glide';
    return 'Weekly Glide'; // default fallback for design match
  };

  const autoRenew = profileData?.autoRenew ?? false;

  const renderActivePlanCard = () => {
    // If no plan is active and we want to allow browsing, we can render browsing options.
    // However, to exactly match design, we render a simulated active plan if activePlanId is empty.
    const isPlanActive = !!activePlanId;

    if (!isPlanActive) {
      return (
        <View style={styles.noActiveCard}>
          <Text style={styles.noActiveText}>No active subscription pass</Text>
          <TouchableOpacity
            style={styles.browseBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainTabs', { screen: 'My Scooter' })}
          >
            <Text style={styles.browseBtnText}>BROWSE RIDE PLANS</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.activeCard}>
        {/* Shield checkmark icon top-right */}
        {!showCancelConfirm && (
          <Ionicons
            name="shield-checkmark"
            size={36}
            color="#00E676"
            style={styles.shieldIcon}
          />
        )}

        {showCancelConfirm ? (
          /* Cancel Section inside Card */
          <View style={styles.cancelContainer}>
            <Text style={styles.cancelSub}>CANCEL SUBSCRIPTION</Text>
            <Text style={styles.cancelTitle}>CANCEL PLAN?</Text>
            <Text style={styles.cancelWarning}>
              Cancelling immediately will lock the scooter and revoke your premium benefits. This action cannot be undone.
            </Text>
            
            <TouchableOpacity
              style={styles.keepBenefitsBtn}
              activeOpacity={0.8}
              onPress={() => setShowCancelConfirm(false)}
            >
              <Text style={styles.keepBenefitsBtnText}>KEEP BENEFITS &gt;</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.yesCancelBtn}
              activeOpacity={0.8}
              onPress={handleCancelSubscription}
            >
              <Text style={styles.yesCancelText}>YES, CANCEL PLAN</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Normal Subscription Info */
          <View>
            <Text style={styles.planName}>{getPlanName()}</Text>
            <Text style={styles.daysLeftText}>⏱ {getDaysLeft()}</Text>
            
            <View style={styles.expiresRow}>
              <Text style={styles.expiresLabel}>EXPIRES ON</Text>
              <Text style={styles.expiresVal}>{getExpiryDateStr()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.autoRenewRow}>
              <View style={styles.autoRenewTextCol}>
                <Text style={styles.autoRenewLabel}>↻ Auto-Renewal</Text>
                <Text style={styles.autoRenewSub}>Plan will renew automatically</Text>
              </View>
              {isTogglingAutoRenew ? (
                <ActivityIndicator size="small" color="#00E676" style={styles.switchLoader} />
              ) : (
                <Switch
                  value={autoRenew}
                  onValueChange={handleToggleAutoRenew}
                  trackColor={{ false: '#333333', true: '#00E676' }}
                  thumbColor="#FFFFFF"
                />
              )}
            </View>

            <TouchableOpacity
              style={styles.cancelTrigger}
              activeOpacity={0.8}
              onPress={() => setShowCancelConfirm(true)}
            >
              <Text style={styles.cancelTriggerText}>Cancel Plan</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderTransactionItem = ({ item }) => {
    const dateStr = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return (
      <View style={styles.historyRow}>
        {/* trend icon (dark circle) */}
        <View style={styles.trendIconCircle}>
          <Ionicons name="trending-down-outline" size={16} color="#FF4444" />
        </View>

        {/* description + date */}
        <View style={styles.historyDetails}>
          <Text style={styles.historyDesc}>{item.description || 'Subscription Purchase'}</Text>
          <Text style={styles.historyDate}>{dateStr}</Text>
        </View>

        {/* amount right (red "−₹900") + SUCCESS */}
        <View style={styles.historyMeta}>
          <Text style={styles.historyAmount}>−₹{Math.abs(item.amount)}</Text>
          <Text style={styles.historyStatus}>SUCCESS</Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View>
        {renderActivePlanCard()}
        <Text style={styles.sectionHeading}>SUBSCRIPTION HISTORY</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Subscriptions</Text>
        <View style={styles.backPlaceholder} />
      </View>

      <FlatList
        data={subTransactions}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderTransactionItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={48} color="#555555" />
              <Text style={styles.emptyText}>No subscription history found.</Text>
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
  header: {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPlaceholder: {
    width: 40,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  activeCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#333333',
    padding: 24,
    marginBottom: 28,
    position: 'relative',
  },
  shieldIcon: {
    position: 'absolute',
    top: 24,
    right: 24,
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    paddingRight: 40, // Space for shield icon
  },
  daysLeftText: {
    color: '#00E676',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  expiresRow: {
    marginBottom: 16,
  },
  expiresLabel: {
    color: '#888888',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  expiresVal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 16,
  },
  autoRenewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  autoRenewTextCol: {
    flex: 1,
    marginRight: 16,
  },
  autoRenewLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  autoRenewSub: {
    color: '#888888',
    fontSize: 11,
    marginTop: 2,
  },
  switchLoader: {
    paddingRight: 12,
  },
  cancelTrigger: {
    marginTop: 20,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelTriggerText: {
    color: '#FF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  cancelContainer: {
    width: '100%',
  },
  cancelSub: {
    color: '#FF4444',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cancelTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cancelWarning: {
    color: '#888888',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 24,
  },
  keepBenefitsBtn: {
    backgroundColor: '#3D5AFE',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  keepBenefitsBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  yesCancelBtn: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesCancelText: {
    color: '#FF4444',
    fontWeight: 'bold',
    fontSize: 12,
  },
  noActiveCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#333333',
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
  },
  noActiveText: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 16,
  },
  browseBtn: {
    height: 44,
    backgroundColor: '#00E676',
    borderRadius: 22,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  browseBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  sectionHeading: {
    color: '#555555',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginTop: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 12,
    marginBottom: 12,
  },
  trendIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
    marginRight: 16,
  },
  historyDesc: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  historyDate: {
    color: '#888888',
    fontSize: 11,
    marginTop: 2,
  },
  historyMeta: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyStatus: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#888888',
    fontSize: 14,
    marginTop: 12,
  },
});
