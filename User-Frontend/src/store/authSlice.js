import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendOtp, verifyOtp } from '../api/authApi';
import { saveToken, clearToken } from '../utils/storage';
import { showError } from '../utils/toast';

export const sendOtpThunk = createAsyncThunk('auth/sendOtp', async (phone) => {
  await sendOtp(phone);
});

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await verifyOtp(phone, otp);
      const data = response.data?.data || response.data;
      const token = data?.token;
      if (token) {
        await saveToken(token);
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Verification failed');
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await clearToken();
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    setAuthTokenOnly: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
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
        showError(action.payload || action.error.message);
      })
      .addCase(verifyOtpThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
        showError(action.payload || action.error.message);
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { setToken, setAuthTokenOnly, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
