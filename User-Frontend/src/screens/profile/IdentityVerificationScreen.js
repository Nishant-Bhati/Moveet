import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';
import { fetchMeThunk } from '../../store/userSlice';
import * as kycApi from '../../api/kycApi';

export default function IdentityVerificationScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const [kycStatus, setKycStatus] = useState('NOT_STARTED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Form Inputs (for NOT_STARTED or REJECTED states)
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [dlInput, setDlInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKycDetails = useCallback(async () => {
    try {
      const response = await kycApi.getKycStatus();
      const kycData = response.data?.data || response.data;
      if (kycData) {
        setKycStatus(kycData.status || 'NOT_STARTED');
        setRejectionReason(kycData.rejectionReason || '');
        setAadhaarNumber(kycData.aadhaarNumber || '');
        setDlNumber(kycData.dlNumber || '');
      }
    } catch (err) {
      console.log('Failed to fetch KYC details:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchKycDetails();
  }, [fetchKycDetails]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchKycDetails();
    dispatch(fetchMeThunk());
  };

  const handleSubmitKyc = async () => {
    if (!aadhaarInput.trim() || !dlInput.trim()) {
      Alert.alert('Validation Error', 'Aadhaar Number and Driving License are required.');
      return;
    }
    if (aadhaarInput.trim().length < 12) {
      Alert.alert('Validation Error', 'Aadhaar Number must be 12 digits.');
      return;
    }

    setIsSubmitting(true);
    try {
      await kycApi.submitKyc({
        aadhaarNumber: aadhaarInput.trim(),
        dlNumber: dlInput.trim(),
      });
      Alert.alert('Success', 'KYC Documents submitted successfully!');
      fetchKycDetails();
      dispatch(fetchMeThunk());
    } catch (err) {
      Alert.alert('Submission Error', err.response?.data?.message || err || 'Failed to submit KYC.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChange = () => {
    Alert.alert(
      'Detail Change Request',
      'Please contact Moveet support to update your verified identification details.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Contact Support', onPress: () => navigation.navigate('Support') },
      ]
    );
  };

  const getMaskedAadhaar = (num) => {
    if (!num) return 'XXXX-XXXX-XXXX';
    const clean = num.replace(/\s/g, '');
    if (clean.length >= 4) {
      return `${clean.substring(0, 4)}-XXXX-XXXX`;
    }
    return 'XXXX-XXXX-XXXX';
  };

  const getMaskedDl = (num) => {
    if (!num) return 'DL-XXXXXX';
    return 'DL-XXXXXX';
  };

  // KycPendingScreen helper layouts
  const getHeading = () => {
    if (kycStatus === 'REJECTED') return 'KYC REJECTED';
    return 'KYC UNDER REVIEW';
  };

  const getSubtext = () => {
    if (kycStatus === 'REJECTED') {
      return 'Your documents could not be verified. Please review the reason below and re-submit your KYC.';
    }
    return 'Our team is verifying your documents. This usually takes a few minutes.';
  };

  const getIconName = () => {
    if (kycStatus === 'REJECTED') {
      return 'alert-circle-outline';
    }
    return 'shield-outline';
  };

  const getIconColor = () => {
    if (kycStatus === 'REJECTED') {
      return colors.danger;
    }
    return colors.primary;
  };

  const renderBadge = () => {
    if (kycStatus === 'REJECTED') {
      return (
        <View style={[styles.badge, styles.badgeRejected]}>
          <Text style={styles.badgeTextRejected}>REJECTED</Text>
        </View>
      );
    }
    return (
      <View style={[styles.badge, styles.badgePending]}>
        <Text style={styles.badgeTextPending}>PENDING</Text>
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    // VERIFIED / APPROVED State
    if (kycStatus === 'APPROVED' || kycStatus === 'VERIFIED') {
      return (
        <View style={styles.verifiedContainer}>
          {/* Large dark circle with green shield-checkmark icon inside */}
          <View style={styles.verifiedIconCircle}>
            <Ionicons name="shield-checkmark" size={80} color="#00E676" />
          </View>

          {/* Card (dark, rounded) */}
          <View style={styles.verifiedCard}>
            <View style={styles.verifiedCardHeader}>
              <Text style={styles.verifiedCardTitle}>About Verified</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>VERIFIED</Text>
              </View>
            </View>
            <Text style={styles.verifiedCardBody}>
              Your identity is verified and you are ready to ride.
            </Text>
            <Text style={styles.verifiedCardSub}>
              Your verification documents have been securely processed and approved. You now have full access to the Moveet fleet and premium rental features.
            </Text>
          </View>

          {/* VERIFIED DETAILS section */}
          <Text style={styles.sectionHeader}>VERIFIED DETAILS</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsRowLabel}>🪪 Aadhaar Card</Text>
              <Text style={styles.detailsRowValue}>{getMaskedAadhaar(aadhaarNumber)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailsRow}>
              <Text style={styles.detailsRowLabel}>📄 Driving License</Text>
              <Text style={styles.detailsRowValue}>{getMaskedDl(dlNumber)}</Text>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={styles.requestChangeBtn}
            activeOpacity={0.8}
            onPress={handleRequestChange}
          >
            <Text style={styles.requestChangeBtnText}>REQUEST DETAIL CHANGE</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={styles.footerText}>
            ⓘ Your data is encrypted and used only for identity verification.
          </Text>
        </View>
      );
    }

    // NOT STARTED state (Show submission form)
    if (kycStatus === 'NOT_STARTED') {
      return (
        <View style={styles.formContainer}>
          <Text style={styles.formDesc}>
            Enter your identification details below to complete KYC verification. Verification is mandatory to unlock and ride scooters.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>AADHAAR NUMBER (12 DIGITS)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5092 1083 2938"
              placeholderTextColor="#555555"
              keyboardType="numeric"
              maxLength={12}
              value={aadhaarInput}
              onChangeText={setAadhaarInput}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>DRIVING LICENSE NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. DL1420230009281"
              placeholderTextColor="#555555"
              autoCapitalize="characters"
              value={dlInput}
              onChangeText={setDlInput}
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            activeOpacity={0.8}
            onPress={handleSubmitKyc}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000000" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>SUBMIT FOR VERIFICATION</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    // PENDING or REJECTED status (KycPendingScreen style)
    return (
      <View style={styles.pendingContainer}>
        {/* Centered Large Icon in Dark Circle */}
        <View style={styles.iconCircle}>
          <Ionicons name={getIconName()} size={80} color={getIconColor()} />
        </View>

        {/* Heading */}
        <Text style={styles.heading}>{getHeading()}</Text>

        {/* Subtext */}
        <Text style={styles.subtext}>{getSubtext()}</Text>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>STATUS</Text>
            {renderBadge()}
          </View>

          {kycStatus === 'REJECTED' && rejectionReason ? (
            <View style={styles.rejectionContainer}>
              <Text style={styles.rejectionLabel}>REJECTION REASON</Text>
              <Text style={styles.rejectionText}>{rejectionReason}</Text>
            </View>
          ) : null}
        </View>

        {/* Re-submit Button */}
        {kycStatus === 'REJECTED' && (
          <TouchableOpacity
            style={styles.resubmitBtn}
            activeOpacity={0.8}
            onPress={() => {
              setAadhaarInput(aadhaarNumber);
              setDlInput(dlNumber);
              setKycStatus('NOT_STARTED');
            }}
          >
            <Text style={styles.resubmitBtnText}>RE-SUBMIT KYC</Text>
          </TouchableOpacity>
        )}

        {/* Refresh Status button at bottom */}
        <TouchableOpacity
          style={styles.refreshBtn}
          activeOpacity={0.8}
          onPress={handleRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.refreshBtnText}>REFRESH STATUS</Text>
          )}
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Identity Verification</Text>
        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {renderContent()}
      </ScrollView>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedContainer: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
  },
  verifiedIconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#222222',
  },
  verifiedCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 18,
    width: '100%',
    marginBottom: 28,
  },
  verifiedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verifiedCardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: 'bold',
  },
  verifiedCardBody: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 6,
  },
  verifiedCardSub: {
    color: '#888888',
    fontSize: 12,
    lineHeight: 18,
  },
  sectionHeader: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  detailsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  detailsRowLabel: {
    color: '#CCCCCC',
    fontSize: 13,
  },
  detailsRowValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#222222',
  },
  requestChangeBtn: {
    backgroundColor: '#00E676',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  requestChangeBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  footerText: {
    color: '#555555',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  formContainer: {
    width: '100%',
    paddingTop: 12,
  },
  formDesc: {
    color: '#888888',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    color: '#555555',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1A1A1A',
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    color: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 15,
  },
  submitBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  pendingContainer: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 32,
  },
  iconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#222222',
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtext: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  statusCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    width: '100%',
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#222222',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgePending: {
    backgroundColor: 'rgba(255, 165, 0, 0.12)',
  },
  badgeRejected: {
    backgroundColor: 'rgba(255, 68, 68, 0.12)',
  },
  badgeTextPending: {
    color: '#FFA500',
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeTextRejected: {
    color: '#FF4444',
    fontSize: 11,
    fontWeight: 'bold',
  },
  rejectionContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  rejectionLabel: {
    color: '#FF4444',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  rejectionText: {
    color: '#CCCCCC',
    fontSize: 13,
    lineHeight: 18,
  },
  resubmitBtn: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
    marginBottom: 16,
  },
  resubmitBtnText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  refreshBtn: {
    height: 52,
    backgroundColor: '#1A1A1A',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#222222',
    marginTop: 8,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
