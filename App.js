import React from 'react';
import { Platform, AsyncStorage, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import AppNavigator from './navigation/AppNavigator';

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  updateLocation() {
    navigator.geolocation.getCurrentPosition(
      position => {
        const loc = position.coords;
        global.loc = {
          lat: loc.latitude,
          lng: loc.longitude
        };
      },
      error => {
        console.log(error.message);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 20000 }
    );
  }

  initStorage() {
    let storage = require('./storage');
    Object.keys(storage).forEach(key => {
      AsyncStorage.getItem(key)
      .then(data => {
        if(data == null){
          AsyncStorage.setItem(key, storage[key]);
        }
      });
    });
  }

  componentDidMount() {
    this.initStorage();
    this.updateLocation();
    this.interval = setInterval(() => {
      this.updateLocation();
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    StatusBar.setBarStyle('dark-content', true);

    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="light-content" />}
          <AppNavigator />
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
