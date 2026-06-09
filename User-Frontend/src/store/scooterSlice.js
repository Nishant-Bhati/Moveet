import { createSlice } from '@reduxjs/toolkit';

const scooterSlice = createSlice({
  name: 'scooter',
  initialState: {
    scooters: [],
    selectedScooter: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setScooters: (state, action) => {
      state.scooters = action.payload;
    },
    setSelectedScooter: (state, action) => {
      state.selectedScooter = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setScooters, setSelectedScooter, setLoading, setError } =
  scooterSlice.actions;
export default scooterSlice.reducer;
