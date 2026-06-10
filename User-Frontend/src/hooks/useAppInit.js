import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getToken } from '../utils/storage';
import { setToken, setAuthTokenOnly, logout } from '../store/authSlice';
import { fetchMeThunk } from '../store/userSlice';
import { fetchNotificationsThunk } from '../store/notificationSlice';

export default function useAppInit() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        const token = await getToken();
        if (token) {
          try {
            const profile = await dispatch(fetchMeThunk()).unwrap();
            const profileData = profile?.data || profile;
            const kycStatus = profileData?.kycStatus;
            
            if (kycStatus === 'APPROVED' || kycStatus === 'VERIFIED') {
              dispatch(setToken(token));
            } else {
              dispatch(setAuthTokenOnly(token));
            }
            // Fetch notifications after auth
            dispatch(fetchNotificationsThunk());
          } catch (err) {
            // Check if error status indicates unauthorized token
            dispatch(logout());
          }
        }
      } catch (err) {
        console.log('App initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
  }, [dispatch]);

  return { isInitializing };
}
