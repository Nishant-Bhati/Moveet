import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'moveet_auth_token';

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error saving token to storage:', error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token from storage:', error);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error clearing token from storage:', error);
  }
};

export default {
  saveToken,
  getToken,
  clearToken,
};
