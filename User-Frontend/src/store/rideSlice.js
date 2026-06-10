import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as rideApi from '../api/rideApi';
import { fetchMeThunk } from './userSlice';
import { showError, showSuccess } from '../utils/toast';

export const startRideThunk = createAsyncThunk(
  'ride/startRide',
  async (scooterId, { rejectWithValue }) => {
    try {
      const response = await rideApi.startRide(scooterId);
      return response.data && Object.prototype.hasOwnProperty.call(response.data, 'data')
        ? response.data.data
        : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to start ride');
    }
  }
);

export const fetchActiveRideThunk = createAsyncThunk(
  'ride/fetchActiveRide',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rideApi.getActiveRide();
      return response.data && Object.prototype.hasOwnProperty.call(response.data, 'data')
        ? response.data.data
        : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active ride');
    }
  }
);

export const endRideThunk = createAsyncThunk(
  'ride/endRide',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await rideApi.endRide();
      const data = response.data && Object.prototype.hasOwnProperty.call(response.data, 'data')
        ? response.data.data
        : response.data;
      // Refresh user profile/wallet details
      await dispatch(fetchMeThunk());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to end ride');
    }
  }
);

export const fetchRideHistoryThunk = createAsyncThunk(
  'ride/fetchRideHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rideApi.getRideHistory();
      return response.data && Object.prototype.hasOwnProperty.call(response.data, 'data')
        ? response.data.data
        : response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ride history');
    }
  }
);

const rideSlice = createSlice({
  name: 'ride',
  initialState: {
    activeRide: null,
    rideHistory: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearActiveRide: (state) => {
      state.activeRide = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // startRideThunk
      .addCase(startRideThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startRideThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeRide = action.payload;
        state.error = null;
      })
      .addCase(startRideThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
        showError(state.error);
      })
      // fetchActiveRideThunk
      .addCase(fetchActiveRideThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveRideThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeRide = action.payload;
        state.error = null;
      })
      .addCase(fetchActiveRideThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
        showError(state.error);
      })
      // endRideThunk
      .addCase(endRideThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(endRideThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.activeRide = null; // Clear active ride on success
        state.error = null;
        showSuccess('Ride ended successfully!');
      })
      .addCase(endRideThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
        showError(state.error);
      })
      // fetchRideHistoryThunk
      .addCase(fetchRideHistoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRideHistoryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rideHistory = action.payload;
        state.error = null;
      })
      .addCase(fetchRideHistoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
        showError(state.error);
      });
  },
});

export const { clearActiveRide } = rideSlice.actions;
export default rideSlice.reducer;
