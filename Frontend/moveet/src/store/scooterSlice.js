import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  scooters: [],
  isLoading: false,
};

const scooterSlice = createSlice({
  name: 'scooter',
  initialState,
  reducers: {},
});

export default scooterSlice.reducer;
