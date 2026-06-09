import { createSlice } from '@reduxjs/toolkit';

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    balance: 0,
    transactions: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setBalance, setTransactions, setLoading, setError } =
  paymentSlice.actions;
export default paymentSlice.reducer;
