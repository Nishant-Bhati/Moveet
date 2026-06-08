import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import storage from '../../utils/storage.js';
import { fetchMeThunk } from '../../store/userSlice.js';
import { logout, setToken } from '../../store/authSlice.js';

const SplashScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await storage.getToken();
        if (token) {
          // If token found: dispatch fetchMeThunk()
          const result = await dispatch(fetchMeThunk());
          
          if (fetchMeThunk.fulfilled.match(result)) {
            // Success: sync token state to Redux (RootNavigator switches to AppNavigator)
            dispatch(setToken(token));
          } else {
            // Failure (token expired/invalid): dispatch logout() then navigate to LoginScreen
            dispatch(logout());
            navigation.navigate('Login');
          }
        } else {
          // If no token: navigate to LoginScreen after a 1.5s delay
          setTimeout(() => {
            navigation.navigate('Login');
          }, 1500);
        }
      } catch (error) {
        console.error('Error during splash screen check:', error);
        dispatch(logout());
        navigation.navigate('Login');
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Moveet</Text>
        <Text style={styles.tagline}>Smart Rental Ride</Text>
      </View>
      {checking && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#00C853" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    color: '#00C853',
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tagline: {
    color: '#8E8E93',
    fontSize: 14,
    marginTop: 8,
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 50,
  },
});

export default SplashScreen;
