import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationApi from '../api/notificationApi';
import { showError } from '../utils/toast';

export const fetchNotificationsThunk = createAsyncThunk(
  'notification/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotifications();
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsReadThunk = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { dispatch, rejectWithValue }) => {
    // If it's a mock notification, just mark it read locally
    if (String(notificationId).startsWith('m')) {
      dispatch(markLocalAsRead(notificationId));
      return { id: notificationId };
    }
    try {
      dispatch(markLocalAsRead(notificationId));
      const response = await notificationApi.markAsRead(notificationId);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsReadThunk = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await notificationApi.markAllAsRead();
      dispatch(fetchNotificationsThunk());
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all as read');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    markLocalAsRead: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.map((n) =>
        (n.id || n._id) === id ? { ...n, isRead: true } : n
      );
      state.unreadCount = state.notifications.filter((n) => !n.isRead).length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.isRead).length;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
        showError(state.error);
      })
      .addCase(markAsReadThunk.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        showError(state.error);
      })
      .addCase(markAllAsReadThunk.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
        showError(state.error);
      });
  },
});

export const { setNotifications, setUnreadCount, addNotification, setLoading, setError, markLocalAsRead } =
  notificationSlice.actions;
export default notificationSlice.reducer;
