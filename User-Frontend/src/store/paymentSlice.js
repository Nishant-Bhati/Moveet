import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as paymentApi from '../api/paymentApi';
import { fetchMeThunk } from './userSlice';

export const fetchPlansThunk = createAsyncThunk(
  'payment/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getPlans();
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

export const fetchTopupPresetsThunk = createAsyncThunk(
  'payment/fetchTopupPresets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getTopupPresets();
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch presets');
    }
  }
);

export const purchaseTopupThunk = createAsyncThunk(
  'payment/purchaseTopup',
  async (amount, { rejectWithValue }) => {
    try {
      const response = await paymentApi.purchaseTopup(amount);
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate top-up');
    }
  }
);

export const verifyTopupThunk = createAsyncThunk(
  'payment/verifyTopup',
  async (paymentData, { dispatch, rejectWithValue }) => {
    try {
      const response = await paymentApi.verifyTopup(paymentData);
      const data = response.data?.data || response.data;
      await dispatch(fetchMeThunk());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Verification failed');
    }
  }
);

export const subscribePlanThunk = createAsyncThunk(
  'payment/subscribePlan',
  async (planId, { dispatch, rejectWithValue }) => {
    try {
      const response = await paymentApi.subscribePlan(planId);
      const data = response.data?.data || response.data;
      await dispatch(fetchMeThunk());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Subscription failed');
    }
  }
);

export const cancelSubscriptionThunk = createAsyncThunk(
  'payment/cancelSubscription',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await paymentApi.cancelSubscription();
      const data = response.data?.data || response.data;
      await dispatch(fetchMeThunk());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

export const fetchTransactionsThunk = createAsyncThunk(
  'payment/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getTransactions();
      return response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    plans: [],
    topupPresets: [],
    transactions: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchPlansThunk
      .addCase(fetchPlansThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlansThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload;
        state.error = null;
      })
      .addCase(fetchPlansThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // fetchTopupPresetsThunk
      .addCase(fetchTopupPresetsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTopupPresetsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topupPresets = action.payload;
        state.error = null;
      })
      .addCase(fetchTopupPresetsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // purchaseTopupThunk
      .addCase(purchaseTopupThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(purchaseTopupThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(purchaseTopupThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // verifyTopupThunk
      .addCase(verifyTopupThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyTopupThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(verifyTopupThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // subscribePlanThunk
      .addCase(subscribePlanThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(subscribePlanThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(subscribePlanThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // cancelSubscriptionThunk
      .addCase(cancelSubscriptionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelSubscriptionThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(cancelSubscriptionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // fetchTransactionsThunk
      .addCase(fetchTransactionsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactionsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
