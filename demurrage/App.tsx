import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import MoreScreen from './screens/MoreScreen';
import DemurrageChargeScreen from './screens/DemurrageChargeScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="More"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="More" component={MoreScreen} />
        <Stack.Screen name="DemurrageCharge" component={DemurrageChargeScreen} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}