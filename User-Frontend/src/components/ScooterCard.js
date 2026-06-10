import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StatusBadge from './StatusBadge';

export default function ScooterCard({ scooter, onPress, style }) {
  if (!scooter) return null;

  const getDistanceString = () => {
    const lat1 = 28.01;
    const lon1 = 77.24;
    const lat2 = scooter.latitude || scooter.location?.coordinates[1] || 28.01;
    const lon2 = scooter.longitude || scooter.location?.coordinates[0] || 77.24;

    const R = 6371e3; // meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in meters
    if (d < 1000) {
      return `${Math.round(d)}m`;
    } else {
      return `${(d / 1000).toFixed(1)}km`;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.nearbyRow, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.pinCircle}>
        <Ionicons name="location" size={16} color="#00E676" />
      </View>
      
      <View style={styles.nearbyInfo}>
        <Text style={styles.nearbyModelLabel}>
          {(scooter.model || 'MOVEET').toUpperCase()}
        </Text>
        <Text style={styles.nearbyName}>
          {scooter.displayName || scooter.model || 'Moveet Scooter'}
        </Text>
        <View style={styles.nearbyStatsRow}>
          <StatusBadge status={scooter.status} />
          <Text style={styles.nearbyMetaText}>⚡ {scooter.battery || 0}%</Text>
          <Text style={styles.nearbyMetaText}>·</Text>
          <Text style={styles.nearbyMetaText}>{getDistanceString()}</Text>
        </View>
      </View>

      <View style={styles.nearbyPriceCol}>
        <Text style={styles.nearbyPriceText}>
          ₹{scooter.pricing?.minutely || 2}/min
        </Text>
        <View style={styles.chevronCircle}>
          <Ionicons name="chevron-forward" size={14} color="#00E676" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  nearbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: 12,
  },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  nearbyInfo: {
    flex: 1,
  },
  nearbyModelLabel: {
    color: '#555555',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  nearbyName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  nearbyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nearbyMetaText: {
    color: '#888888',
    fontSize: 11,
  },
  nearbyPriceCol: {
    alignItems: 'flex-end',
  },
  nearbyPriceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  chevronCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
