import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  payments: [],
  isLoading: false,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
});

export default paymentSlice.reducer;
