import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import ParkingScreen from '../screens/ParkingScreen';
import SettingsScreen from '../screens/SettingsScreen';

import Colors from '../constants/Colors';

let stackOptions = {
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: Colors.rutgers,
      height: 70
    },
    headerTintColor: Colors.tabIconSelected,
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 22
    }
  },
};

const HomeStack = createStackNavigator({
  Home: HomeScreen
}, stackOptions);

HomeStack.navigationOptions = {
  tabBarLabel: 'RU Bus',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios' ? 'ios-bus' : 'md-bus'
      }
    />
  ),
};

const ParkingStack = createStackNavigator({
  Parking: ParkingScreen,
}, stackOptions);

ParkingStack.navigationOptions = {
  tabBarLabel: 'Parking',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-car' : 'md-car'}
    />
  ),
};

const SettingsStack = createStackNavigator({
  Settings: SettingsScreen,
}, stackOptions);

SettingsStack.navigationOptions = {
  tabBarLabel: 'Settings',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? 'ios-settings' : 'md-settings'}
    />
  ),
};

export default createBottomTabNavigator({
  HomeStack,
  ParkingStack,
  SettingsStack,
}, {
    tabBarOptions: {
      activeTintColor: Colors.tabIconSelected,
      inactiveTintColor: Colors.tabIconDefault,
      style: {
        backgroundColor: Colors.rutgers
      }
    }
});
