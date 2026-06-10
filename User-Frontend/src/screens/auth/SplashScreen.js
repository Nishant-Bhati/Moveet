import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../utils/theme';

export default function SplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.brand}>MOVEET</Text>
        <Text style={styles.subtitle}>THE PULSE OF URBAN MOBILITY</Text>
      </View>
      <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  brand: {
    fontSize: 48,
    color: colors.primary,
    fontWeight: 'bold',
    fontStyle: 'italic',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    letterSpacing: 3,
    marginTop: 8,
    fontWeight: '600',
  },
  loader: {
    position: 'absolute',
    bottom: 50,
  },
});
