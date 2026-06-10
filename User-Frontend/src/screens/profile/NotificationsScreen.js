import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing } from '../../utils/theme';
import { fetchNotificationsThunk, markAsReadThunk, markAllAsReadThunk } from '../../store/notificationSlice';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Redux state
  const { notifications, isLoading } = useSelector((state) => state.notification);

  useEffect(() => {
    dispatch(fetchNotificationsThunk());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchNotificationsThunk());
  };

  const handleMarkAsRead = async (id) => {
    try {
      await dispatch(markAsReadThunk(id)).unwrap();
    } catch (err) {
      console.log('Failed to mark read:', err);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Mark All as Read',
      'Are you sure you want to mark all notifications as read?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Read',
          onPress: async () => {
            try {
              await dispatch(markAllAsReadThunk()).unwrap();
            } catch (err) {
              console.log('Failed to clear notifications:', err);
            }
          },
        },
      ]
    );
  };

  const renderNotificationItem = ({ item }) => {
    const isUnread = !item.isRead;
    const dateStr = new Date(item.date || item.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={[styles.notifCard, isUnread && styles.notifCardUnread]}
        activeOpacity={0.8}
        onPress={() => handleMarkAsRead(item.id || item._id)}
      >
        <View style={styles.notifIconCircle}>
          <Ionicons
            name={item.type === 'SUCCESS' ? 'checkmark-circle' : item.type === 'WARNING' ? 'warning' : 'information-circle'}
            size={18}
            color={item.type === 'SUCCESS' ? colors.primary : item.type === 'WARNING' ? colors.danger : colors.blueAccent}
          />
        </View>

        <View style={styles.notifDetails}>
          <View style={styles.notifHeaderRow}>
            <Text style={[styles.notifTitle, isUnread && styles.notifTitleUnread]}>
              {item.title || 'Moveet Alert'}
            </Text>
            {isUnread && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifMessage}>{item.message}</Text>
          <Text style={styles.notifDate}>{dateStr}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications && notifications.some((n) => !n.isRead) ? (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn} activeOpacity={0.8}>
            <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>

      {/* List */}
      <FlatList
        data={notifications || []}
        keyExtractor={(item) => item.id || item._id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color="#555555" />
              <Text style={styles.emptyText}>No notifications yet.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backPlaceholder: {
    width: 40,
  },
  clearBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 12,
  },
  notifCardUnread: {
    borderColor: '#333333',
    backgroundColor: '#1E1E1E',
  },
  notifIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notifDetails: {
    flex: 1,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
  },
  notifTitleUnread: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notifMessage: {
    color: '#888888',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  notifDate: {
    color: '#555555',
    fontSize: 10,
    marginTop: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    color: '#888888',
    fontSize: 14,
    marginTop: 12,
  },
});
