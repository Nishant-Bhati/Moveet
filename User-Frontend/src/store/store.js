import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import scooterReducer from './scooterSlice';
import rideReducer from './rideSlice';
import paymentReducer from './paymentSlice';
import notificationReducer from './notificationSlice';

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
