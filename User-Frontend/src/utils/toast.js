import Toast from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';

export const showSuccess = (message) => {
  Toast.show({
    type: 'success',
    text1: message,
    position: 'top',
  });
};

export const showError = (message) => {
  Toast.show({
    type: 'error',
    text1: message,
    position: 'top',
  });
};

export const showInfo = (message) => {
  Toast.show({
    type: 'info',
    text1: message,
    position: 'top',
  });
};

export const toastConfig = {
  success: (params) => (
    <View style={[styles.toast, styles.successToast]}>
      <Text style={[styles.text, styles.successText]} numberOfLines={2}>
        {params.text1}
      </Text>
    </View>
  ),
  error: (params) => (
    <View style={[styles.toast, styles.errorToast]}>
      <Text style={[styles.text, styles.errorText]} numberOfLines={2}>
        {params.text1}
      </Text>
    </View>
  ),
  info: (params) => (
    <View style={[styles.toast, styles.infoToast]}>
      <Text style={[styles.text, styles.infoText]} numberOfLines={2}>
        {params.text1}
      </Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  toast: {
    width: '90%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  successToast: {
    backgroundColor: '#1B4D2E',
    borderLeftColor: '#00E676',
  },
  successText: {
    color: '#00E676',
  },
  errorToast: {
    backgroundColor: '#3D0000',
    borderLeftColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
  },
  infoToast: {
    backgroundColor: '#1A1A2C',
    borderLeftColor: '#6B8BFF',
  },
  infoText: {
    color: '#6B8BFF',
  },
});
