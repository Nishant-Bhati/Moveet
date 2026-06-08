import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  rides: [],
  isLoading: false,
};

const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {},
});

export default rideSlice.reducer;
