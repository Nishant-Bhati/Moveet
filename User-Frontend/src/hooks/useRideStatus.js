import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActiveRideThunk } from '../store/rideSlice';

export default function useRideStatus() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch immediately on mount / login
      dispatch(fetchActiveRideThunk());

      // Poll every 30 seconds
      intervalRef.current = setInterval(() => {
        dispatch(fetchActiveRideThunk());
      }, 30000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch, isAuthenticated]);
}
