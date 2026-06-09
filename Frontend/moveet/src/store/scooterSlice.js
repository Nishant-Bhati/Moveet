import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import scooterApi from '../api/scooterApi.js';

export const fetchNearbyScooters = createAsyncThunk(
  'scooter/fetchNearby',
  async ({ lat, lng }, { rejectWithValue }) => {
    try {
      const response = await scooterApi.getNearbyScooters(lat, lng);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch nearby scooters');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch nearby scooters'
      );
    }
  }
);

export const fetchScooterById = createAsyncThunk(
  'scooter/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await scooterApi.getScooterById(id);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message || 'Failed to fetch scooter details');
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch scooter details'
      );
    }
  }
);

const initialState = {
  nearbyScooters: [],
  selectedScooter: null,
  isLoading: false,
  error: null,
};

const scooterSlice = createSlice({
  name: 'scooter',
  initialState,
  reducers: {
    setSelectedScooter: (state, action) => {
      state.selectedScooter = action.payload;
    },
    clearSelectedScooter: (state) => {
      state.selectedScooter = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchNearbyScooters
      .addCase(fetchNearbyScooters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNearbyScooters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.nearbyScooters = action.payload;
      })
      .addCase(fetchNearbyScooters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // fetchScooterById
      .addCase(fetchScooterById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchScooterById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedScooter = action.payload;
      })
      .addCase(fetchScooterById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setSelectedScooter, clearSelectedScooter } = scooterSlice.actions;
export default scooterSlice.reducer;
