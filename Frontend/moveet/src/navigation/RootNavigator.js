import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AuthNavigator from './AuthNavigator.js';
import AppNavigator from './AppNavigator.js';
import storage from '../utils/storage.js';
import { setToken } from '../store/authSlice.js';

const RootNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const profile = useSelector((state) => state.user.profile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await storage.getToken();
        if (token) {
          dispatch(setToken(token));
        }
      } catch (error) {
        console.error('Error reading token on app init:', error);
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, [dispatch]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C853" />
      </View>
    );
  }

  const isKycApproved = profile?.kycStatus === 'APPROVED';
  const showApp = isAuthenticated && isKycApproved;

  return (
    <NavigationContainer>
      {showApp ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
  },
});

export default RootNavigator;
