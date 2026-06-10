import { View, ActivityIndicator, Modal, StyleSheet } from 'react-native';

export default function LoadingOverlay({ visible }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00E676" />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(13, 13, 13, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
