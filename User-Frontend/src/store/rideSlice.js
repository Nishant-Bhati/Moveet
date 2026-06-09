import { createSlice } from '@reduxjs/toolkit';

const rideSlice = createSlice({
  name: 'ride',
  initialState: {
    currentRide: null,
    rideHistory: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setCurrentRide: (state, action) => {
      state.currentRide = action.payload;
    },
    setRideHistory: (state, action) => {
      state.rideHistory = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearCurrentRide: (state) => {
      state.currentRide = null;
    },
  },
});

export const { setCurrentRide, setRideHistory, setLoading, setError, clearCurrentRide } =
  rideSlice.actions;
export default rideSlice.reducer;
