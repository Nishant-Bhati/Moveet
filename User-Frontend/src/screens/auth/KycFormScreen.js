import { View, Text, StyleSheet } from 'react-native';

export default function KycFormScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>KycFormScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
