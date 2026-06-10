import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, fontSizes, spacing } from '../../utils/theme';
import * as userApi from '../../api/userApi';
import * as kycApi from '../../api/kycApi';
import { fetchMeThunk } from '../../store/userSlice';

export default function KycFormScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const profile = useSelector((state) => state.user.profile);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Pre-fill profile fields if available
  useEffect(() => {
    if (profile) {
      if (profile.firstName) setFirstName(profile.firstName);
      if (profile.lastName) setLastName(profile.lastName);
      if (profile.email) setEmail(profile.email);
    }
  }, [profile]);

  const validate = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!aadhaarNumber.trim()) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (aadhaarNumber.trim().length !== 12 || !/^\d+$/.test(aadhaarNumber.trim())) {
      newErrors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits';
    }

    if (!dlNumber.trim()) {
      newErrors.dlNumber = 'Driving license number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // 1. Update user profile information
      await userApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });

      // 2. Submit KYC details
      await kycApi.submitKyc({
        aadhaarNumber: aadhaarNumber.trim(),
        dlNumber: dlNumber.trim(),
      });

      // 3. Update profile details in Redux store
      await dispatch(fetchMeThunk()).unwrap();

      // 4. Navigate to KycPendingScreen
      navigation.navigate('KycPending');
    } catch (err) {
      console.error('KYC submission error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
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

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headingBlock}>
            <View style={styles.headingRow}>
              <Text style={styles.headingWhite}>COMPLETE </Text>
              <Text style={styles.headingGreen}>KYC.</Text>
            </View>
            <Text style={styles.subtext}>Required to start riding.</Text>
          </View>

          {submitError ? <Text style={styles.submitErrorText}>{submitError}</Text> : null}

          <View style={styles.formGroup}>
            <Text style={styles.label}>FIRST NAME</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="Enter first name"
              placeholderTextColor="#555"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) {
                  setErrors((prev) => ({ ...prev, firstName: null }));
                }
              }}
            />
            {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>LAST NAME</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="Enter last name"
              placeholderTextColor="#555"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) {
                  setErrors((prev) => ({ ...prev, lastName: null }));
                }
              }}
            />
            {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter email address"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: null }));
                }
              }}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>AADHAAR NUMBER</Text>
            <TextInput
              style={[styles.input, errors.aadhaarNumber && styles.inputError]}
              placeholder="0000 0000 0000"
              placeholderTextColor="#555"
              keyboardType="numeric"
              maxLength={12}
              value={aadhaarNumber}
              onChangeText={(text) => {
                setAadhaarNumber(text);
                if (errors.aadhaarNumber) {
                  setErrors((prev) => ({ ...prev, aadhaarNumber: null }));
                }
              }}
            />
            {errors.aadhaarNumber ? <Text style={styles.errorText}>{errors.aadhaarNumber}</Text> : null}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>DRIVING LICENSE NUMBER</Text>
            <TextInput
              style={[styles.input, errors.dlNumber && styles.inputError]}
              placeholder="Enter driving license number"
              placeholderTextColor="#555"
              autoCapitalize="characters"
              value={dlNumber}
              onChangeText={(text) => {
                setDlNumber(text);
                if (errors.dlNumber) {
                  setErrors((prev) => ({ ...prev, dlNumber: null }));
                }
              }}
            />
            {errors.dlNumber ? <Text style={styles.errorText}>{errors.dlNumber}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            disabled={isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>SUBMIT & CONTINUE</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.md,
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
    color: '#FFFFFF',
    fontSize: 22,
  },
  brand: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  headingBlock: {
    marginBottom: spacing.xxl,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingWhite: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headingGreen: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#888888',
    fontSize: fontSizes.bodySmall,
    marginTop: spacing.xs,
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.caption,
    marginTop: spacing.xs,
  },
  submitErrorText: {
    color: colors.danger,
    fontSize: fontSizes.bodySmall,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  primaryButton: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 15,
    textTransform: 'uppercase',
  },
});
