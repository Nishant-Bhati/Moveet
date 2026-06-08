import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import userApi from '../../api/userApi.js';
import kycApi from '../../api/kycApi.js';
import { fetchMeThunk } from '../../store/userSlice.js';

const KycFormScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const profile = useSelector((state) => state.user.profile);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');

  // UI States
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-populate fields from Redux profile on mount or when profile updates
  useEffect(() => {
    if (profile) {
      if (profile.firstName) setFirstName(profile.firstName);
      if (profile.lastName) setLastName(profile.lastName);
      if (profile.email) setEmail(profile.email);
    }
  }, [profile]);

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
    if (!cleanAadhaar) {
      newErrors.aadhaarNumber = 'Aadhaar number is required';
    } else if (cleanAadhaar.length !== 12) {
      newErrors.aadhaarNumber = 'Aadhaar must be exactly 12 digits';
    }

    const cleanDl = dlNumber.trim();
    if (!cleanDl) {
      newErrors.dlNumber = 'Driving license number is required';
    } else if (cleanDl.length < 5) {
      newErrors.dlNumber = 'Driving license must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // 1. Update basic profile info
      await userApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      });

      // 2. Submit Aadhaar and DL numbers for KYC
      const cleanAadhaar = aadhaarNumber.replace(/\s/g, '');
      await kycApi.submitKyc({
        aadhaarNumber: cleanAadhaar,
        dlNumber: dlNumber.trim().toUpperCase(),
      });

      // 3. Re-fetch profile to sync Redux store (this updates profile in redux)
      await dispatch(fetchMeThunk());

      // 4. Navigate to KycPending screen
      navigation.navigate('KycPending');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit KYC data. Please try again.';
      Alert.alert('KYC Submission Failed', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAadhaarChange = (text) => {
    // Restrict to digits only
    const cleaned = text.replace(/[^0-9]/g, '');
    setAadhaarNumber(cleaned);
    if (errors.aadhaarNumber) {
      setErrors((prev) => ({ ...prev, aadhaarNumber: null }));
    }
  };

  const handleFieldChange = (setter, fieldName) => (text) => {
    setter(text);
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: null }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header section */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Complete KYC</Text>
            <Text style={styles.headerSubtitle}>Required to start riding</Text>
          </View>

          {/* Form fields */}
          <View style={styles.form}>
            {/* First Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'firstName' && styles.inputFocused,
                  errors.firstName && styles.inputError,
                ]}
                placeholder="Enter first name"
                placeholderTextColor="#555555"
                value={firstName}
                onChangeText={handleFieldChange(setFirstName, 'firstName')}
                onFocus={() => setFocusedField('firstName')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            {/* Last Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'lastName' && styles.inputFocused,
                  errors.lastName && styles.inputError,
                ]}
                placeholder="Enter last name"
                placeholderTextColor="#555555"
                value={lastName}
                onChangeText={handleFieldChange(setLastName, 'lastName')}
                onFocus={() => setFocusedField('lastName')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'email' && styles.inputFocused,
                  errors.email && styles.inputError,
                ]}
                placeholder="example@mail.com"
                placeholderTextColor="#555555"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={handleFieldChange(setEmail, 'email')}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Aadhaar Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Aadhaar Number (12 Digits)</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'aadhaar' && styles.inputFocused,
                  errors.aadhaarNumber && styles.inputError,
                ]}
                placeholder="0000 0000 0000"
                placeholderTextColor="#555555"
                keyboardType="number-pad"
                maxLength={12}
                value={aadhaarNumber}
                onChangeText={handleAadhaarChange}
                onFocus={() => setFocusedField('aadhaar')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.aadhaarNumber && (
                <Text style={styles.errorText}>{errors.aadhaarNumber}</Text>
              )}
            </View>

            {/* Driving License Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Driving License Number</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'dl' && styles.inputFocused,
                  errors.dlNumber && styles.inputError,
                ]}
                placeholder="DL-00000000000"
                placeholderTextColor="#555555"
                autoCapitalize="characters"
                value={dlNumber}
                onChangeText={handleFieldChange(setDlNumber, 'dlNumber')}
                onFocus={() => setFocusedField('dl')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.dlNumber && (
                <Text style={styles.errorText}>{errors.dlNumber}</Text>
              )}
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                submitting && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Submit & Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: '#8E8E93',
    fontSize: 15,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1C1C1E',
    borderColor: '#2C2C2E',
    borderWidth: 1.5,
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  inputFocused: {
    borderColor: '#00C853',
    backgroundColor: '#152A1A',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 6,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#00C853',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00C853',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#1C1C1E',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default KycFormScreen;
