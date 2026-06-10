import { View, Text, StyleSheet } from 'react-native';

const STATUS_THEMES = {
  AVAILABLE: { bg: '#1B4D2E', text: '#00E676' },
  READY: { bg: '#1B4D2E', text: '#00E676' },
  LOCKED: { bg: '#2C1A1A', text: '#FF6B6B' },
  IN_USE: { bg: '#2C2C00', text: '#FFD700' },
  MAINTENANCE: { bg: '#1A1A2C', text: '#6B8BFF' },
};

export default function StatusBadge({ status }) {
  const normStatus = (status || 'AVAILABLE').toUpperCase();
  const theme = STATUS_THEMES[normStatus] || STATUS_THEMES.AVAILABLE;

  return (
    <View style={[styles.badge, { backgroundColor: theme.bg }]}>
      <Text style={[styles.badgeText, { color: theme.text }]}>● {normStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
