import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { StatusBar, StyleSheet, View, Text } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import { store } from './src/store/store';
import RootNavigator from './src/navigation/RootNavigator';
import { toastConfig } from './src/utils/toast';

export default function App() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
        
        {isOffline && (
          <SafeAreaView style={styles.offlineBannerContainer} edges={['top']}>
            <View style={styles.offlineBanner}>
              <Text style={styles.offlineText}>● You're offline</Text>
            </View>
          </SafeAreaView>
        )}

        <RootNavigator />
        <Toast config={toastConfig} />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  offlineBannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: '#FF4444',
  },
  offlineBanner: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
