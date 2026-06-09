import { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setToken } from '../store/authSlice';
import { getToken } from '../utils/storage';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';

const darkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: '#0D0D0D',
    card: '#1A1A1A',
    text: '#FFFFFF',
    border: '#222222',
    primary: '#00E676',
  },
};

export default function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await getToken();
        if (token) {
          dispatch(setToken(token));
        }
      } catch {
        // token not found
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D0D', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00E676" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={darkTheme}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
