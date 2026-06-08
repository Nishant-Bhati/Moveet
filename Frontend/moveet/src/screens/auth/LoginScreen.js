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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { sendOtpThunk, setError } from '../../store/authSlice.js';

const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const { isLoading, error: reduxError } = useSelector((state) => state.auth);

  // Clear errors when screen mounts or unmounts
  useEffect(() => {
    dispatch(setError(null));
    return () => {
      dispatch(setError(null));
    };
  }, [dispatch]);

  const handlePhoneChange = (text) => {
    // Keep only numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhone(cleaned);
    
    // Clear errors when user types
    if (localError) setLocalError(null);
    if (reduxError) dispatch(setError(null));
  };

  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setLocalError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLocalError(null);
    const result = await dispatch(sendOtpThunk(phone));
    if (sendOtpThunk.fulfilled.match(result)) {
      navigation.navigate('Otp', { phone });
    }
  };

  const hasError = !!(localError || reduxError);

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
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Moveet</Text>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
            <Text style={styles.heading}>Enter your mobile number</Text>
            <Text style={styles.subtext}>We'll send you a verification code</Text>

            {/* Phone Input Box */}
            <View
              style={[
                styles.inputContainer,
                isFocused && styles.inputContainerFocused,
                hasError && styles.inputContainerError,
              ]}
            >
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="00000 00000"
                placeholderTextColor="#555555"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={handlePhoneChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>

            {/* Error Message */}
            {hasError && (
              <Text style={styles.errorText}>
                {localError || reduxError}
              </Text>
            )}
          </View>

          {/* Action Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                (phone.length !== 10 || isLoading) && styles.buttonDisabled,
              ]}
              onPress={handleSendOtp}
              disabled={phone.length !== 10 || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logoText: {
    color: '#00C853',
    fontSize: 44,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 40,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtext: {
    color: '#8E8E93',
    fontSize: 15,
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: '#2C2C2E',
    paddingVertical: 10,
  },
  inputContainerFocused: {
    borderBottomColor: '#00C853',
  },
  inputContainerError: {
    borderBottomColor: '#FF3B30',
  },
  countryCode: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    padding: 0, // Reset default Android padding
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
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

export default LoginScreen;
