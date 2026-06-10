import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';
import { logout } from '../../store/authSlice';
import { fetchMeThunk } from '../../store/userSlice';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux state
  const profile = useSelector((state) => state.user.profile);
  const profileData = profile?.data || profile;

  // On mount refresh user details
  useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);

  // Handle Logout Confirmation
  const handleLogoutPress = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to end your Moveet session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logout());
          },
        },
      ]
    );
  };

  const initials = ((profileData?.firstName?.[0] || 'M') + (profileData?.lastName?.[0] || 'R')).toUpperCase();
  const kycStatus = profileData?.kycStatus || 'NOT_STARTED';

  const getKycBadge = () => {
    switch (kycStatus) {
      case 'APPROVED':
        return { label: 'VERIFIED', color: colors.primary };
      case 'PENDING':
        return { label: 'PENDING', color: '#FFA500' };
      case 'REJECTED':
        return { label: 'REJECTED', color: colors.danger };
      default:
        return { label: 'UNVERIFIED', color: '#888888' };
    }
  };

  const menuItems = [
    {
      label: 'Help',
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate('Support'),
    },
    {
      label: 'Identity Verification',
      icon: 'checkmark-done-circle-outline',
      subtitle: getKycBadge().label,
      subtitleColor: getKycBadge().color,
      onPress: () => navigation.navigate('IdentityVerification'),
    },
    {
      label: 'My Rides',
      icon: 'time-outline',
      onPress: () => navigation.navigate('RideHistory', { detailed: false }),
    },
    {
      label: 'Safety',
      icon: 'shield-checkmark-outline',
      onPress: () => Alert.alert('Safety Info', 'Emergency safety guidelines and local contacts are active.'),
    },
    {
      label: 'My Subscriptions',
      icon: 'wallet-outline',
      subtitle: 'SHOWS SUBSCRIPTION HISTORY',
      subtitleColor: colors.primary,
      onPress: () => navigation.navigate('MySubscriptions'),
    },
    {
      label: 'Notifications',
      icon: 'notifications-outline',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      label: 'Settings',
      icon: 'settings-outline',
      onPress: () => Alert.alert('Settings', 'App configurations and parameters stub.'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* USER CARD */}
        <TouchableOpacity
          style={styles.userCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('ProfileEdit')}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userCenter}>
            <Text style={styles.userName}>
              {profileData?.firstName
                ? `${profileData.firstName} ${profileData.lastName || ''}`
                : 'Moveet Rider'}
            </Text>
            <Text style={styles.userPhone}>{profileData?.phone || 'No phone number'}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#555555" />
        </TouchableOpacity>

        {/* MENU ITEMS LIST */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <View key={item.label}>
              <TouchableOpacity
                style={styles.menuRow}
                activeOpacity={0.8}
                onPress={item.onPress}
              >
                <View style={styles.menuIconCircle}>
                  <Ionicons name={item.icon} size={18} color="#555555" />
                </View>
                
                <View style={styles.menuLabelContainer}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.subtitle && (
                    <Text style={[styles.menuSubtitle, { color: item.subtitleColor }]}>
                      {item.subtitle}
                    </Text>
                  )}
                </View>

                <Ionicons name="chevron-forward" size={18} color="#555555" />
              </TouchableOpacity>
              
              {index < menuItems.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* LOGOUT BUTTON ROW */}
        <TouchableOpacity
          style={styles.logoutRow}
          activeOpacity={0.8}
          onPress={handleLogoutPress}
        >
          <View style={styles.menuIconCircle}>
            <Ionicons name="log-out-outline" size={18} color="#555555" />
          </View>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  topBar: {
    height: 56,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  userCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xl,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: '#151515',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userCenter: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userPhone: {
    color: '#888888',
    fontSize: 13,
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabelContainer: {
    flex: 1,
  },
  menuLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  menuSubtitle: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#222222',
    marginLeft: 60, // Align divider nicely past icon
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
