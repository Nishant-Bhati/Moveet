import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import kycApi from '../../api/kycApi.js';
import { fetchMeThunk } from '../../store/userSlice.js';

const KycPendingScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const profile = useSelector((state) => state.user.profile);
  const kycStatus = profile?.kycStatus || 'PENDING';

  const [refreshing, setRefreshing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation loop for the icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Polling KYC status every 15 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(fetchMeThunk());
    }, 15000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Call direct getKycStatus and dispatch fetchMeThunk to refresh redux state
      await kycApi.getKycStatus();
      await dispatch(fetchMeThunk());
    } catch (error) {
      console.error('Error refreshing KYC status:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Badge helper details
  const getBadgeDetails = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          backgroundColor: 'rgba(255, 149, 0, 0.15)',
          borderColor: '#FF9500',
          textColor: '#FF9500',
          labelText: 'Under Review',
          iconName: 'time-outline',
        };
      case 'REJECTED':
        return {
          backgroundColor: 'rgba(255, 59, 48, 0.15)',
          borderColor: '#FF3B30',
          textColor: '#FF3B30',
          labelText: 'Rejected',
          iconName: 'alert-circle-outline',
        };
      case 'APPROVED':
        return {
          backgroundColor: 'rgba(0, 200, 83, 0.15)',
          borderColor: '#00C853',
          textColor: '#00C853',
          labelText: 'Approved',
          iconName: 'checkmark-circle-outline',
        };
      default:
        return {
          backgroundColor: '#1C1C1E',
          borderColor: '#3A3A3C',
          textColor: '#8E8E93',
          labelText: status || 'Unknown',
          iconName: 'help-circle-outline',
        };
    }
  };

  const badge = getBadgeDetails(kycStatus);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconWrapper,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Icon name={badge.iconName} size={96} color={badge.textColor} />
        </Animated.View>

        {/* Heading */}
        <Text style={styles.heading}>
          {kycStatus === 'REJECTED'
            ? 'KYC Verification Failed'
            : kycStatus === 'APPROVED'
            ? 'KYC Verification Successful'
            : 'KYC Under Review'}
        </Text>

        {/* Subtext */}
        <Text style={styles.subtext}>
          {kycStatus === 'REJECTED'
            ? 'We were unable to verify your identity. Please verify your details and submit again.'
            : kycStatus === 'APPROVED'
            ? 'Your documents have been approved successfully! You are ready to start your ride.'
            : 'Our team is verifying your documents. This usually takes a few minutes.'}
        </Text>

        {/* Status Badge */}
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badge.backgroundColor,
              borderColor: badge.borderColor,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: badge.textColor }]}>
            {badge.labelText.toUpperCase()}
          </Text>
        </View>

        {/* Conditional Action Buttons */}
        {kycStatus === 'REJECTED' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('KycForm')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Re-submit KYC</Text>
          </TouchableOpacity>
        )}

        {kycStatus === 'APPROVED' && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              // RootNavigator triggers automatic switch if kycStatus is APPROVED and authenticated
              dispatch(fetchMeThunk());
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Start Riding →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Manual Refresh Button at bottom */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
          activeOpacity={0.7}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#00C853" />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh Status</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconWrapper: {
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtext: {
    color: '#8E8E93',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 32,
  },
  badge: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginBottom: 48,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  actionButton: {
    backgroundColor: '#00C853',
    borderRadius: 28,
    height: 56,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  refreshButton: {
    borderColor: '#2C2C2E',
    borderWidth: 1.5,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
  },
  refreshButtonText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default KycPendingScreen;
