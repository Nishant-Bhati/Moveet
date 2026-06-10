import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';
import * as kycApi from '../../api/kycApi';
import { fetchMeThunk } from '../../store/userSlice';
import { setToken } from '../../store/authSlice';

export default function KycPendingScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Select token and profile from store
  const token = useSelector((state) => state.auth.token);
  const profile = useSelector((state) => state.user.profile);
  
  // Safe helper to extract profile data
  const profileData = profile?.data || profile;
  
  const [kycStatus, setKycStatus] = useState(profileData?.kycStatus || 'PENDING');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const checkStatus = useCallback(async () => {
    try {
      const response = await kycApi.getKycStatus();
      const kycData = response.data?.data || response.data;
      if (kycData && kycData.status) {
        setKycStatus(kycData.status);
        if (kycData.rejectionReason) {
          setRejectionReason(kycData.rejectionReason);
        } else {
          setRejectionReason('');
        }
        
        if (kycData.status === 'APPROVED') {
          // Dispatch setToken automatically to transition user to main app
          dispatch(setToken(token));
        }
      }
    } catch (err) {
      console.error('Failed to get KYC status:', err);
    }
  }, [dispatch, token]);

  // Poll status every 15s, clear on unmount
  useEffect(() => {
    // Initial fetch of profile and kyc status
    dispatch(fetchMeThunk());
    checkStatus();

    const interval = setInterval(() => {
      checkStatus();
    }, 15000);

    return () => clearInterval(interval);
  }, [dispatch, checkStatus]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setErrorMessage('');
    try {
      await Promise.all([
        checkStatus(),
        dispatch(fetchMeThunk()).unwrap(),
      ]);
    } catch (err) {
      console.error('Manual refresh failed:', err);
      setErrorMessage('Failed to refresh status. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReSubmit = () => {
    navigation.navigate('KycForm');
  };

  const handleStartRiding = () => {
    dispatch(setToken(token));
  };

  const renderBadge = () => {
    switch (kycStatus) {
      case 'APPROVED':
        return (
          <View style={[styles.badge, styles.badgeApproved]}>
            <Text style={styles.badgeTextApproved}>APPROVED</Text>
          </View>
        );
      case 'REJECTED':
        return (
          <View style={[styles.badge, styles.badgeRejected]}>
            <Text style={styles.badgeTextRejected}>REJECTED</Text>
          </View>
        );
      case 'PENDING':
      default:
        return (
          <View style={[styles.badge, styles.badgePending]}>
            <Text style={styles.badgeTextPending}>PENDING</Text>
          </View>
        );
    }
  };

  const getHeading = () => {
    if (kycStatus === 'REJECTED') return 'KYC REJECTED';
    if (kycStatus === 'APPROVED') return 'KYC APPROVED';
    return 'KYC UNDER REVIEW';
  };

  const getSubtext = () => {
    if (kycStatus === 'REJECTED') {
      return 'Your documents could not be verified. Please review the reason below and re-submit your KYC.';
    }
    if (kycStatus === 'APPROVED') {
      return 'Verification complete! You are ready to start riding with Moveet.';
    }
    return 'Our team is verifying your documents. This usually takes a few minutes.';
  };

  const getIcon = () => {
    if (kycStatus === 'APPROVED') {
      return 'shield-checkmark-outline';
    }
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Text style={styles.brand}>MOVEET</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainLayout}>
          {/* Centered Large Icon in Dark Circle */}
          <View style={styles.iconCircle}>
            <Ionicons name={getIcon()} size={80} color={getIconColor()} />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>{getHeading()}</Text>

          {/* Subtext */}
          <Text style={styles.subtext}>{getSubtext()}</Text>

          {/* Error Message if refresh fails */}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

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

          {/* Primary Action Buttons */}
          {kycStatus === 'REJECTED' && (
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handleReSubmit}
            >
              <Text style={styles.primaryButtonText}>RE-SUBMIT KYC</Text>
            </TouchableOpacity>
          )}

          {kycStatus === 'APPROVED' && (
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handleStartRiding}
            >
              <Text style={styles.primaryButtonText}>START RIDING →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Refresh Status Secondary Button at bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          disabled={isRefreshing}
          onPress={handleRefresh}
        >
          {isRefreshing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.secondaryButtonText}>REFRESH STATUS</Text>
          )}
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
  flex: {
    flex: 1,
  },
  topBar: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  brand: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  mainLayout: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: '#222222',
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: 0.5,
  },
  subtext: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xxxl,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    width: '100%',
    padding: spacing.xl,
    marginBottom: spacing.xl,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgePending: {
    backgroundColor: 'rgba(255, 165, 0, 0.15)',
  },
  badgeApproved: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  badgeRejected: {
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
  },
  badgeTextPending: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextApproved: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextRejected: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  rejectionContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2C',
  },
  rejectionLabel: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  rejectionText: {
    color: '#CCCCCC',
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.md,
  },
  primaryButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bottomBar: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingTop: spacing.sm,
    backgroundColor: '#0D0D0D',
  },
  secondaryButton: {
    height: 56,
    backgroundColor: '#1A1A1A',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#222222',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
