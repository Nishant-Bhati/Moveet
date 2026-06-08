import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  isLoading: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {},
});

export default notificationSlice.reducer;
