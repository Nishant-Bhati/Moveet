import { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtpThunk } from '../../store/authSlice';
import { colors, fontSizes, spacing, borderRadius as br } from '../../utils/theme';

export default function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [phone, setPhone] = useState('');

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    const result = await dispatch(sendOtpThunk(phone));
    if (result.meta.requestStatus === 'fulfilled') {
      navigation.navigate('Otp', { phone });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>MOVEET</Text>
          <View style={styles.helpCircle}>
            <Text style={styles.helpIcon}>?</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.headingBlock}>
            <Text style={styles.headingWhite}>ENTER THE</Text>
            <Text style={styles.headingGreen}>PULSE.</Text>
            <Text style={styles.subtext}>
              Access your high-performance urban fleet.
            </Text>
          </View>

          <View style={styles.phoneSection}>
            <Text style={styles.label}>PHONE NUMBER</Text>
            <View style={styles.phoneRow}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="00000 00000"
                placeholderTextColor="#555"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, phone.length !== 10 && styles.buttonDisabled]}
            activeOpacity={0.8}
            disabled={phone.length !== 10 || isLoading}
            onPress={handleSendOtp}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>{'→  SEND OTP'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONNECT WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>G</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>A</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.footer}>
          By continuing, you agree to MOVEET's Terms of Service and Privacy Policy.
        </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  brand: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  helpCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpIcon: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: 32,
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
  phoneSection: {
    marginBottom: spacing.xxl,
  },
  label: {
    color: colors.textLabel,
    fontSize: fontSizes.label,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCode: {
    width: 80,
    height: 56,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    height: 56,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    color: colors.textPrimary,
    fontSize: 16,
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
    marginBottom: 32,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: colors.textLabel,
    fontSize: fontSizes.label,
    letterSpacing: 1.5,
    marginHorizontal: spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIcon: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    color: colors.textLabel,
    fontSize: fontSizes.caption,
    textAlign: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: 20,
    lineHeight: 16,
  },
});
