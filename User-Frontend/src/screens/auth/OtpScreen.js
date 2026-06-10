import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtpThunk, verifyOtpThunk } from '../../store/authSlice';
import { colors, fontSizes, spacing } from '../../utils/theme';

const COUNTDOWN_SECONDS = 30;

export default function OtpScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const phone = route.params?.phone;
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const inputRef = useRef(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    try {
      const result = await dispatch(verifyOtpThunk({ phone, otp })).unwrap();
      const kycStatus = result.user?.kycStatus;
      if (kycStatus === 'NOT_STARTED') {
        navigation.reset({ index: 0, routes: [{ name: 'KycForm' }] });
      } else if (kycStatus === 'PENDING') {
        navigation.reset({ index: 0, routes: [{ name: 'KycPending' }] });
      }
    } catch {
      // error handled by redux state
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    await dispatch(sendOtpThunk(phone));
    setCountdown(COUNTDOWN_SECONDS);
    setOtp('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>{'←'}</Text>
          </TouchableOpacity>
          <Text style={styles.brand}>MOVEET</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.content}>
          <View style={styles.headingBlock}>
            <Text style={styles.headingWhite}>VERIFY</Text>
            <Text style={styles.headingGreen}>ACCESS.</Text>
            <Text style={styles.subtext}>
              Enter the 6-digit pulse code sent to your device.
            </Text>
          </View>

          <View style={styles.otpSection}>
            <Text style={styles.label}>OTP CODE</Text>
            <View style={styles.otpContainer}>
              <View style={styles.otpRow}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <View key={i} style={styles.otpBox}>
                    <Text style={[styles.otpDigit, otp[i] && styles.otpDigitFilled]}>
                      {otp[i] || '0'}
                    </Text>
                  </View>
                ))}
              </View>
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                autoFocus
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, otp.length !== 6 && styles.buttonDisabled]}
            activeOpacity={0.8}
            disabled={otp.length !== 6 || isLoading}
            onPress={handleVerify}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>{'→  VERIFY & SECURE'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            {countdown > 0 ? (
              <Text style={styles.resendText}>
                {`Didn't receive code? Resend in ${countdown}s`}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: spacing.xxl,
  },
  backArrow: {
    color: colors.textPrimary,
    fontSize: 22,
  },
  brand: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: 40,
  },
  headingBlock: {
    marginBottom: 40,
  },
  headingWhite: {
    color: colors.textPrimary,
    fontSize: fontSizes.headingLarge,
    fontWeight: 'bold',
  },
  headingGreen: {
    color: colors.primary,
    fontSize: fontSizes.headingLarge,
    fontWeight: 'bold',
  },
  subtext: {
    color: colors.textSecondary,
    fontSize: fontSizes.bodySmall,
    marginTop: spacing.sm,
  },
  otpSection: {
    marginBottom: spacing.xxl,
  },
  label: {
    color: colors.textLabel,
    fontSize: fontSizes.label,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  otpContainer: {
    position: 'relative',
    height: 56,
    justifyContent: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 6,
  },
  otpBox: {
    flex: 1,
    height: 56,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpDigit: {
    color: colors.textLabel,
    fontSize: 20,
    fontWeight: 'bold',
  },
  otpDigitFilled: {
    color: colors.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.caption,
    marginTop: spacing.sm,
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'uppercase',
  },
  resendRow: {
    alignItems: 'center',
  },
  resendText: {
    color: colors.textSecondary,
    fontSize: fontSizes.bodySmall,
  },
  resendLink: {
    color: colors.primary,
    fontSize: fontSizes.bodySmall,
    fontWeight: 'bold',
  },
});
