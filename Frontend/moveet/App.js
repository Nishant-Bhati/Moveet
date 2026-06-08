import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store/store.js';
import RootNavigator from './src/navigation/RootNavigator.js';

const App = () => {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
};

export default App;
