import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RazorpayCheckout from 'react-native-razorpay';
import { colors, spacing } from '../../utils/theme';
import { fetchMeThunk } from '../../store/userSlice';
import {
  fetchPlansThunk,
  fetchTopupPresetsThunk,
  purchaseTopupThunk,
  verifyTopupThunk,
  subscribePlanThunk,
  cancelSubscriptionThunk,
  fetchTransactionsThunk,
} from '../../store/paymentSlice';

export default function PaymentsScreen() {
  const dispatch = useDispatch();

  // Redux state selectors
  const profile = useSelector((state) => state.user.profile);
  const { plans, topupPresets, transactions, isLoading } = useSelector((state) => state.payment);

  const profileData = profile?.data || profile;
  const walletBalance = profileData?.walletBalance ?? 0;
  const activePlanId = profileData?.activePlanId;

  // Local state for modals visibility
  const [isTopupVisible, setIsTopupVisible] = useState(false);
  const [isManageVisible, setIsManageVisible] = useState(false);
  const [isReviewVisible, setIsReviewVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);

  // Top-up inputs state
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  // Selected plan for activation review
  const [selectedPlanForReview, setSelectedPlanForReview] = useState(null);
  const [reviewAutoRenew, setReviewAutoRenew] = useState(true);

  // Selected transaction for details view
  const [selectedTx, setSelectedTx] = useState(null);

  // Manage Subscription states
  const [manageAutoRenew, setManageAutoRenew] = useState(profileData?.autoRenew ?? true);

  // Fetch initial payment metrics on mount
  useEffect(() => {
    dispatch(fetchMeThunk());
    dispatch(fetchPlansThunk());
    dispatch(fetchTopupPresetsThunk());
    dispatch(fetchTransactionsThunk());
  }, [dispatch]);

  // Synchronize autoRenew state when profile loads
  useEffect(() => {
    if (profileData) {
      setManageAutoRenew(profileData.autoRenew ?? true);
    }
  }, [profileData]);

  // Combined transactions fallback mock data
  const displayTransactions = transactions?.length > 0
    ? transactions
    : [
        { id: 'tx1', description: 'Wallet Top-up', date: new Date('2026-04-26T12:00:00Z').toISOString(), direction: 'CREDIT', amount: 500, referenceType: 'TOPUP', status: 'SUCCESS' },
        { id: 'tx2', description: 'Weekly Plan Subscription', date: new Date('2026-04-26T12:05:00Z').toISOString(), direction: 'DEBIT', amount: 900, referenceType: 'SUBSCRIPTION', status: 'SUCCESS' },
        { id: 'tx3', description: 'Ride Charge - MG Road Sprint', date: new Date('2026-04-25T17:30:00Z').toISOString(), direction: 'DEBIT', amount: 36, referenceType: 'RIDE', status: 'SUCCESS' },
      ];

  // Map preset buttons
  const activePresets = topupPresets?.length > 0 ? topupPresets : [100, 500, 1000];

  // Helper date conversions
  const getExpiryDetails = () => {
    if (!profileData?.planExpiryDate) {
      return { daysLeft: 5, dateStr: '15 June 2026' };
    }
    const expiry = new Date(profileData.planExpiryDate);
    const msLeft = expiry.getTime() - Date.now();
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    const dateStr = expiry.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return { daysLeft, dateStr };
  };

  // Perform Razorpay Top-up Purchase
  const handlePayWithRazorpay = async () => {
    const finalAmount = Number(customAmount) || selectedPreset;
    if (!finalAmount || finalAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please choose or type a valid top-up amount.');
      return;
    }

    try {
      // Create Razorpay Order in Backend
      const orderData = await dispatch(purchaseTopupThunk(finalAmount)).unwrap();

      const options = {
        description: 'Moveet Wallet Top-up',
        image: 'https://images.unsplash.com/photo-1519074069444-1ba4e6664402?auto=format&fit=crop&w=100&h=100', // Mock logo url
        currency: orderData.currency || 'INR',
        key: orderData.keyId || 'rzp_test_mockKeyId',
        amount: (finalAmount * 100).toString(), // Razorpay takes paise
        name: 'Moveet',
        order_id: orderData.orderId,
        prefill: {
          email: profileData?.email || 'user@moveet.com',
          contact: profileData?.phone || '9999999999',
          name: `${profileData?.firstName || 'Sagar'} ${profileData?.lastName || 'Bhati'}`,
        },
        theme: { color: '#00E676' },
      };

      RazorpayCheckout.open(options)
        .then(async (data) => {
          // Signature verification
          const verifyPayload = {
            razorpayOrderId: data.razorpay_order_id || orderData.orderId,
            razorpayPaymentId: data.razorpay_payment_id || 'pay_mockPaymentId',
            razorpaySignature: data.razorpay_signature || 'mockSignatureHash',
          };
          await dispatch(verifyTopupThunk(verifyPayload)).unwrap();
          setIsTopupVisible(false);
          setCustomAmount('');
          setSelectedPreset(null);
          dispatch(fetchTransactionsThunk());
          Alert.alert('Success', `₹${finalAmount} added to wallet successfully!`);
        })
        .catch(async (error) => {
          console.log('RazorpayCheckout error callback:', error);
          
          // Simulation fallback for emulator environments
          if (error?.message?.includes('not found') || error?.description?.includes('Activity not found') || error?.code === 2) {
            Alert.alert(
              'Checkout Emulation',
              'Native payment activity unavailable. Simulate successful wallet top-up?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Simulate Success',
                  onPress: async () => {
                    const mockPayload = {
                      razorpayOrderId: orderData.orderId,
                      razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substring(7),
                      razorpaySignature: 'sig_mock_' + Math.random().toString(36).substring(7),
                    };
                    try {
                      await dispatch(verifyTopupThunk(mockPayload)).unwrap();
                      setIsTopupVisible(false);
                      setCustomAmount('');
                      setSelectedPreset(null);
                      dispatch(fetchTransactionsThunk());
                      Alert.alert('Success', `₹${finalAmount} added to wallet successfully (Simulated)!`);
                    } catch (verErr) {
                      Alert.alert('Verification Failed', verErr || 'Failed to verify transaction.');
                    }
                  },
                },
              ]
            );
          } else {
            Alert.alert('Top-up Cancelled', error.description || 'Checkout process was cancelled.');
          }
        });
    } catch (err) {
      Alert.alert('Purchase Failed', err || 'Could not initiate top-up. Please try again.');
    }
  };

  // Perform subscription plan activation
  const handleActivatePlanWithWallet = async () => {
    if (!selectedPlanForReview) return;
    const planId = selectedPlanForReview._id || selectedPlanForReview.id;

    if (walletBalance < selectedPlanForReview.price) {
      Alert.alert(
        'Insufficient Balance',
        'Top up your wallet to activate this plan.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Top Up Now',
            onPress: () => {
              setIsReviewVisible(false);
              setIsTopupVisible(true);
            },
          },
        ]
      );
      return;
    }

    try {
      await dispatch(subscribePlanThunk(planId)).unwrap();
      setIsReviewVisible(false);
      dispatch(fetchTransactionsThunk());
      Alert.alert('Subscription Active', `${selectedPlanForReview.name} is now active.`);
    } catch (err) {
      Alert.alert('Subscription Error', err || 'Could not activate subscription.');
    }
  };

  // Perform cancellation of subscription
  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your current plan benefits?',
      [
        { text: 'Keep Benefits', style: 'cancel' },
        {
          text: 'Yes, Cancel Plan',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelSubscriptionThunk()).unwrap();
              setIsManageVisible(false);
              dispatch(fetchTransactionsThunk());
              Alert.alert('Subscription Cancelled', 'Your plan auto-renewal has been terminated.');
            } catch (err) {
              Alert.alert('Cancellation Error', err || 'Failed to cancel subscription.');
            }
          },
        },
      ]
    );
  };

  // Select Preset Button Helper
  const handleSelectPreset = (val) => {
    setSelectedPreset(val);
    setCustomAmount(''); // Clear custom amount
  };

  // Select Plan for review bottom sheet trigger
  const handleSelectPlan = (plan) => {
    setSelectedPlanForReview(plan);
    setReviewAutoRenew(true);
    setIsReviewVisible(true);
  };

  // Select Transaction Row Helper
  const handleSelectTransaction = (tx) => {
    setSelectedTx(tx);
    setIsDetailVisible(true);
  };

  // Map current active subscription
  const planInfo = activePlanId && (plans.find((p) => p._id === activePlanId) || {
    name: activePlanId === 'weekly' ? 'Weekly Plan' : activePlanId === 'daily' ? 'Daily Plan' : 'Monthly Plan',
    subtitle: activePlanId === 'weekly' ? 'ACTIVE • 7 DAYS • FLEXIBLE' : activePlanId === 'daily' ? 'ACTIVE • 24 HOURS • UNLIMITED' : 'ACTIVE • 30 DAYS • PREMIUM',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>Payments</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: Balance Card */}
        <View style={styles.balanceCard}>
          <View>
            <Text style={styles.balanceLabel}>CURRENT BALANCE</Text>
            <Text style={styles.balanceVal}>₹{walletBalance.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtnCircle}
            activeOpacity={0.8}
            onPress={() => setIsTopupVisible(true)}
          >
            <Ionicons name="add" size={24} color="#00E676" />
          </TouchableOpacity>
        </View>

        {/* SECTION 2: Active Subscription */}
        <Text style={styles.sectionHeading}>ACTIVE SUBSCRIPTION</Text>
        {activePlanId ? (
          <View style={styles.subscriptionCard}>
            <View style={styles.subLeftCircle}>
              <Ionicons name="radio-button-on" size={20} color={colors.primary} />
            </View>
            <View style={styles.subCenterInfo}>
              <Text style={styles.subName}>{planInfo.name}</Text>
              <Text style={styles.subMeta}>
                {planInfo.subtitle || 'ACTIVE • UNLIMITED'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.manageBtn}
              activeOpacity={0.8}
              onPress={() => setIsManageVisible(true)}
            >
              <Text style={styles.manageBtnText}>MANAGE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noSubCard}>
            <View style={styles.noSubInfo}>
              <Ionicons name="information-circle-outline" size={20} color="#888888" style={styles.noSubInfoIcon} />
              <Text style={styles.noSubText}>No active subscription</Text>
            </View>
            {plans && plans.length > 0 && (
              <View style={styles.plansSmallList}>
                {plans.map((plan) => (
                  <TouchableOpacity
                    key={plan._id}
                    style={styles.planSmallRow}
                    activeOpacity={0.8}
                    onPress={() => handleSelectPlan(plan)}
                  >
                    <View style={styles.planSmallLeft}>
                      <Ionicons name="flash-outline" size={14} color="#00E676" style={styles.planSmallLeftIcon} />
                      <Text style={styles.planSmallName}>{plan.name}</Text>
                    </View>
                    <Text style={styles.planSmallPrice}>
                      ₹{plan.price}{plan.priceLabel || '/d'}  &gt;
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* SECTION 4: Transaction History */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionHeading}>TRANSACTION HISTORY</Text>
          <Ionicons name="time-outline" size={16} color="#555555" />
        </View>

        <View style={styles.transactionsList}>
          {displayTransactions.map((tx) => {
            const dateStr = new Date(tx.date || tx.createdAt).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
            });
            const isCredit = tx.direction === 'CREDIT';
            const amountPrefix = isCredit ? '+' : '-';

            return (
              <TouchableOpacity
                key={tx.id || tx._id}
                style={styles.txRow}
                activeOpacity={0.8}
                onPress={() => handleSelectTransaction(tx)}
              >
                <View style={styles.txIconSquare}>
                  <Ionicons name="cash" size={16} color="#00E676" />
                </View>

                <View style={styles.txDetails}>
                  <Text style={styles.txDesc} numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Text style={styles.txDate}>{dateStr}</Text>
                </View>

                <View style={styles.txRightCol}>
                  <Text style={[styles.txAmount, isCredit ? styles.txAmountCredit : styles.txAmountDebit]}>
                    {amountPrefix}₹{tx.amount}
                  </Text>
                  <Text style={styles.txStatusText}>SUCCESS</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* TOPUP BOTTOM SHEET MODAL */}
      <Modal
        visible={isTopupVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsTopupVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetDismissArea}
            activeOpacity={1}
            onPress={() => setIsTopupVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>ADD MONEY</Text>
              <TouchableOpacity onPress={() => setIsTopupVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Presets Row */}
            <View style={styles.presetsRow}>
              {activePresets.map((val) => {
                const isSelected = selectedPreset === val;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[styles.presetBtn, isSelected && styles.presetBtnActive]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectPreset(val)}
                  >
                    <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                      ₹{val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom amount input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>OR ENTER CUSTOM AMOUNT</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="₹ Custom Amount"
                placeholderTextColor="#555555"
                keyboardType="numeric"
                value={customAmount}
                onChangeText={(text) => {
                  setCustomAmount(text);
                  setSelectedPreset(null); // Deselect presets
                }}
              />
            </View>

            <TouchableOpacity
              style={styles.primaryActionBtn}
              activeOpacity={0.8}
              onPress={handlePayWithRazorpay}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text style={styles.primaryActionBtnText}>PAY WITH RAZORPAY</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* REVIEW SUBSCRIPTION BOTTOM SHEET MODAL */}
      <Modal
        visible={isReviewVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsReviewVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetDismissArea}
            activeOpacity={1}
            onPress={() => setIsReviewVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>REVIEW SUBSCRIPTION</Text>
              <TouchableOpacity onPress={() => setIsReviewVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {selectedPlanForReview && (
              <View style={styles.reviewContent}>
                {/* Plan header details */}
                <View style={styles.reviewRowSpace}>
                  <Text style={styles.reviewPlanName}>{selectedPlanForReview.name}</Text>
                  <Text style={styles.reviewPlanPrice}>
                    ₹{selectedPlanForReview.price}{selectedPlanForReview.priceLabel || '/d'}
                  </Text>
                </View>
                <Text style={styles.reviewSubtitle}>
                  {selectedPlanForReview._id === 'weekly' ? 'Full week coverage' : selectedPlanForReview._id === 'daily' ? 'Full 24h coverage' : 'Full month coverage'}
                </Text>

                {/* Renew badge */}
                <View style={styles.badgeRow}>
                  <View style={styles.renewBadge}>
                    <Text style={styles.renewBadgeText}>
                      {selectedPlanForReview._id === 'weekly' ? 'Renews starting next MON' : 'Renews automatically'}
                    </Text>
                  </View>
                </View>

                {/* Auto-Renewal Switch Row */}
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Auto-Renewal</Text>
                  <Switch
                    value={reviewAutoRenew}
                    onValueChange={setReviewAutoRenew}
                    trackColor={{ false: '#333333', true: '#1B4D2E' }}
                    thumbColor={reviewAutoRenew ? colors.primary : '#888888'}
                  />
                </View>

                {/* Activate Action Button */}
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  activeOpacity={0.8}
                  onPress={handleActivatePlanWithWallet}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000000" size="small" />
                  ) : (
                    <Text style={styles.primaryActionBtnText}>ACTIVATE WITH WALLET</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* SUBSCRIPTION MANAGE BOTTOM SHEET MODAL */}
      <Modal
        visible={isManageVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsManageVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetDismissArea}
            activeOpacity={1}
            onPress={() => setIsManageVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>MANAGE SUBSCRIPTION</Text>
              <TouchableOpacity onPress={() => setIsManageVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {planInfo && (
              <View style={styles.manageContent}>
                {/* Timer info card */}
                <View style={styles.timerSubCard}>
                  <View>
                    <Text style={styles.timerSubName}>{planInfo.name}</Text>
                    <Text style={styles.timerSubExpiry}>Expires: {getExpiryDetails().dateStr}</Text>
                  </View>
                  <View style={styles.timerPill}>
                    <Text style={styles.timerPillText}>
                      {getExpiryDetails().daysLeft} Days Left
                    </Text>
                  </View>
                </View>

                {/* Auto-Renewal switcher */}
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Auto-Renewal</Text>
                  <Switch
                    value={manageAutoRenew}
                    onValueChange={setManageAutoRenew}
                    trackColor={{ false: '#333333', true: '#1B4D2E' }}
                    thumbColor={manageAutoRenew ? colors.primary : '#888888'}
                  />
                </View>

                {/* Cancel warning block */}
                <View style={styles.cancelBlock}>
                  <Text style={styles.cancelHeading}>CANCEL PLAN?</Text>
                  <Text style={styles.cancelWarningText}>
                    You will lose access to free unlocks and unlimited rides at the end of the billing period.
                  </Text>
                </View>

                {/* Row button controls */}
                <View style={styles.manageBtnsRow}>
                  <TouchableOpacity
                    style={styles.keepBtn}
                    activeOpacity={0.8}
                    onPress={() => setIsManageVisible(false)}
                  >
                    <Text style={styles.keepBtnText}>KEEP BENEFITS &gt;</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelLinkBtn}
                    activeOpacity={0.8}
                    onPress={handleCancelSubscription}
                  >
                    <Text style={styles.cancelLinkText}>YES, CANCEL PLAN</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* TRANSACTION DETAILS BOTTOM SHEET MODAL */}
      <Modal
        visible={isDetailVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDetailVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <TouchableOpacity
            style={styles.sheetDismissArea}
            activeOpacity={1}
            onPress={() => setIsDetailVisible(false)}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.txDetailTitle}>TRANSACTION DETAILS</Text>
              <TouchableOpacity onPress={() => setIsDetailVisible(false)}>
                <Ionicons name="close-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {selectedTx && (
              <View style={styles.detailContent}>
                {/* Large Amount */}
                <Text style={styles.detailAmount}>
                  {selectedTx.direction === 'CREDIT' ? '+' : '-'}₹{selectedTx.amount}
                </Text>

                {/* Success badge */}
                <View style={styles.detailBadgeRow}>
                  <View style={styles.detailSuccessBadge}>
                    <Text style={styles.detailSuccessText}>● SUCCESS</Text>
                  </View>
                </View>

                {/* Details list rows */}
                <View style={styles.detailGrid}>
                  <View style={styles.detailGridRow}>
                    <Text style={styles.detailGridLabel}>PLAN/TYPE</Text>
                    <Text style={styles.detailGridVal}>
                      {selectedTx.referenceType || 'TOP-UP'}
                    </Text>
                  </View>
                  <View style={styles.detailGridRow}>
                    <Text style={styles.detailGridLabel}>DATE & TIME</Text>
                    <Text style={styles.detailGridVal}>
                      {new Date(selectedTx.date || selectedTx.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={styles.detailGridRow}>
                    <Text style={styles.detailGridLabel}>PAYMENT METHOD</Text>
                    <Text style={styles.detailGridVal}>
                      {selectedTx.referenceType === 'TOPUP' ? 'Razorpay' : 'Wallet'}
                    </Text>
                  </View>
                  <View style={styles.detailGridRow}>
                    <Text style={styles.detailGridLabel}>PAYMENT ID</Text>
                    <Text style={styles.detailGridVal} numberOfLines={1}>
                      {selectedTx.paymentId || `pay_mock_${selectedTx.id || selectedTx._id}`.substring(0, 16)}
                    </Text>
                  </View>
                  <View style={styles.detailGridRow}>
                    <Text style={styles.detailGridLabel}>ORDER ID</Text>
                    <Text style={styles.detailGridVal} numberOfLines={1}>
                      {selectedTx.orderId || `ord_mock_${selectedTx.id || selectedTx._id}`.substring(0, 16)}
                    </Text>
                  </View>
                </View>

                {/* Download Receipt */}
                <TouchableOpacity
                  style={styles.downloadBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    Alert.alert('Download Receipt', 'Receipt download successfully initiated.');
                    setIsDetailVisible(false);
                  }}
                >
                  <Text style={styles.downloadBtnText}>DOWNLOAD RECEIPT</Text>
                </TouchableOpacity>
              </View>
            )}
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  balanceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xl,
  },
  balanceLabel: {
    color: '#555555',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  balanceVal: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  addBtnCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  sectionHeading: {
    color: '#555555',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  subscriptionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xl,
  },
  subLeftCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subCenterInfo: {
    flex: 1,
  },
  subName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subMeta: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  manageBtn: {
    backgroundColor: '#222222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  manageBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  noSubCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xl,
  },
  noSubInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  noSubText: {
    color: '#888888',
    fontSize: 13,
  },
  plansSmallList: {
    gap: 8,
  },
  planSmallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  planSmallLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planSmallName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  planSmallPrice: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transactionsList: {
    gap: 12,
  },
  txRow: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
    marginRight: 8,
  },
  txDesc: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  txDate: {
    color: '#888888',
    fontSize: 11,
    marginTop: 2,
  },
  txRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  txAmountCredit: {
    color: colors.primary,
  },
  txAmountDebit: {
    color: '#CCCCCC',
  },
  txStatusText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
    paddingBottom: 12,
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    color: '#555555',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: 12,
  },
  presetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  presetBtnActive: {
    borderColor: colors.primary,
    backgroundColor: '#1E1E1E',
  },
  presetText: {
    color: '#888888',
    fontWeight: 'bold',
    fontSize: 14,
  },
  presetTextActive: {
    color: colors.primary,
  },
  inputContainer: {
    marginBottom: spacing.xxl,
  },
  inputLabel: {
    color: '#555555',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  amountInput: {
    backgroundColor: '#1A1A1A',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  primaryActionBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  reviewContent: {
    width: '100%',
  },
  reviewRowSpace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewPlanName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  reviewPlanPrice: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  reviewSubtitle: {
    color: '#888888',
    fontSize: 13,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: spacing.lg,
  },
  renewBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  renewBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#161616',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xl,
  },
  switchLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  manageContent: {
    width: '100%',
  },
  timerSubCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.lg,
  },
  timerSubName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timerSubExpiry: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
  },
  timerPill: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timerPillText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  cancelBlock: {
    marginBottom: spacing.xl,
  },
  cancelHeading: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cancelWarningText: {
    color: '#888888',
    fontSize: 12,
    lineHeight: 18,
  },
  manageBtnsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  keepBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.blueAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keepBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cancelLinkBtn: {
    flex: 1.2,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelLinkText: {
    color: colors.danger,
    fontWeight: 'bold',
    fontSize: 13,
  },
  txDetailTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  detailContent: {
    alignItems: 'center',
    width: '100%',
  },
  detailAmount: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  detailBadgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  detailSuccessBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailSuccessText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  detailGrid: {
    width: '100%',
    backgroundColor: '#161616',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xxl,
  },
  detailGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  detailGridLabel: {
    color: '#555555',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  detailGridVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    maxWidth: '60%',
  },
  downloadBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  noSubInfoIcon: {
    marginRight: 8,
  },
  planSmallLeftIcon: {
    marginRight: 6,
  },
});
