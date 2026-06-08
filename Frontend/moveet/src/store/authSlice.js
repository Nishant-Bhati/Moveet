import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authApi from '../api/authApi.js';
import storage from '../utils/storage.js';

export const sendOtpThunk = createAsyncThunk(
  'auth/sendOtp',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await authApi.sendOtp(phone);
      if (response.success) {
        return response;
      }
      return rejectWithValue(response.message || 'Failed to send OTP');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp(phone, otp);
      if (response.success) {
        // response.data contains { token, user }
        await storage.saveToken(response.data.token);
        return response.data;
      }
      return rejectWithValue(response.message || 'Verification failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Verification failed');
    }
  }
);

const initialState = {
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
      storage.clearToken();
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // sendOtpThunk
      .addCase(sendOtpThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtpThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendOtpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      // verifyOtpThunk
      .addCase(verifyOtpThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setToken, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
