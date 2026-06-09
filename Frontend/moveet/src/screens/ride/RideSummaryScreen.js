import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const RideSummaryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>RideSummaryScreen Stub</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
  },
  text: {
    color: '#00C853',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default RideSummaryScreen;
