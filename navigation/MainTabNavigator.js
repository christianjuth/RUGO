import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { createStackNavigator, createBottomTabNavigator, Header } from 'react-navigation';
import { LinearGradient } from 'expo';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import ParkingScreen from '../screens/ParkingScreen';
import SettingsScreen from '../screens/SettingsScreen';

import Colors from '../constants/Colors';

const GradientHeader = props => {
  return(
    <View>
      <LinearGradient 
        start={[0, 0]}
        end={[1, 0]}
        colors={[Colors.graidentLeft, Colors.graidentRight]}
      >
        <Header {...props} />
      </LinearGradient>
    </View>
  );
}

let stackOptions = {
  defaultNavigationOptions: {
    header: props => <GradientHeader {...props} />,
    headerStyle: {
      backgroundColor: 'transparent',
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
        backgroundColor: 'transparent'
      }
    }
});
