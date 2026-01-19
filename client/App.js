import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';

import { CartProvider } from './src/context/CartContext';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#87CEEB', // SkyBlue for Buttons/Action
    onPrimary: '#333333', // Dark text on light buttons for readability
    secondary: '#4F4F4F', // Dark Gray for secondary elements
    background: '#FFFFFF', // White background
    surface: '#FFFFFF',
    onBackground: '#333333', // Dark Gray for text
    onSurface: '#333333',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <CartProvider>
          <RootNavigator />
        </CartProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
