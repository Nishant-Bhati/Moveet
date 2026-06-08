import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import userReducer from './userSlice.js';
import scooterReducer from './scooterSlice.js';
import rideReducer from './rideSlice.js';
import paymentReducer from './paymentSlice.js';
import notificationReducer from './notificationSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    scooter: scooterReducer,
    ride: rideReducer,
    payment: paymentReducer,
    notification: notificationReducer,
  },
});

export default store;
