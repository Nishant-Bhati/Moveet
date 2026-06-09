import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import rideApi from '../api/rideApi.js';
import { fetchMeThunk } from './userSlice.js';

export const startRideThunk = createAsyncThunk(
  'ride/startRide',
  async (scooterId, { rejectWithValue }) => {
    try {
      const response = await rideApi.startRide(scooterId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to start ride');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to start ride'
      );
    }
  }
);

export const fetchActiveRideThunk = createAsyncThunk(
  'ride/fetchActiveRide',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rideApi.getActiveRide();
      if (response.success) {
        return response.data; // Can be null if no active ride
      }
      return rejectWithValue(response.message || 'Failed to fetch active ride');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch active ride'
      );
    }
  }
);

export const endRideThunk = createAsyncThunk(
  'ride/endRide',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await rideApi.endRide();
      if (response.success) {
        // Sync user profile to refresh wallet balance and current status
        dispatch(fetchMeThunk());
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to end ride');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to end ride'
      );
    }
  }
);

export const fetchRideHistoryThunk = createAsyncThunk(
  'ride/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await rideApi.getRideHistory();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch ride history');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch ride history'
      );
    }
  }
);

const initialState = {
  activeRide: null,
  rideHistory: [],
  isLoading: false,
  error: null,
  rideEnded: null,
};

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    clearRideError: (state) => {
      state.error = null;
    },
    clearRideEnded: (state) => {
      state.rideEnded = null;
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
      })
      .addCase(startRideThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // fetchActiveRideThunk
      .addCase(fetchActiveRideThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveRideThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeRide = action.payload;
      })
      .addCase(fetchActiveRideThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // endRideThunk
      .addCase(endRideThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(endRideThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rideEnded = action.payload;
        state.activeRide = null;
      })
      .addCase(endRideThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // fetchRideHistoryThunk
      .addCase(fetchRideHistoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRideHistoryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rideHistory = action.payload;
      })
      .addCase(fetchRideHistoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearRideError, clearRideEnded } = rideSlice.actions;
export default rideSlice.reducer;
