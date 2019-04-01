import React from 'react';
import { YellowBox, ScrollView, AppState, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Constants, Notifications, Permissions } from 'expo';

async function getiOSNotificationPermission() {
  const { status } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  if (status !== 'granted') {
    await Permissions.askAsync(Permissions.NOTIFICATIONS);
  }
}
// YellowBox.ignoreWarnings(['Require cycle:']);

import GlobalStyles from '../assets/Styles';

let transloc = require('../transloc.js');
let session = new transloc(require('../transloc-config').apiKey);

export default class App extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <View>
          <Text style={GlobalStyles.headerTitle}>Bus Arrivals</Text>
          <Text style={GlobalStyles.headerSub}>{navigation.getParam('sub')}</Text>
        </View>
      )
    };
  };

  constructor(props) {
    super(props);

    this.state = {
      stopId: '',
      stopTitle: '',
      arrivals: {},
      state: 'active',
      watch: ''
    };
  }

  checkLocation() {
    let stop = session.closestStop(loc.lat, loc.lng);
    if(stop.stop_id != this.state.stopId){
      this.setState({
        stopId: stop.stop_id,
        stopTitle: stop.name
      });
      this.props.navigation.setParams({sub: stop.name});
    }
    
    this.refresh();
  }

  notify(title, body, time) {
    (async () => {
      this.notificationId = await Notifications.scheduleLocalNotificationAsync({
        title: title,
        body: body,
        android: {
          sound: true,
        },
        ios: {
          sound: true,
        },
      },
      { time: Date.now() + time});
    })();
  }

  listenForNotifications = () => {
    Notifications.addListener(notification => {
      this.notificationId = null;
      this.setState({
        watch: ''
      });
    });
  };


  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    getiOSNotificationPermission();
    this.listenForNotifications();

    session.load(() => {
      this.checkLocation();
      this.intervalOne = setInterval(() => { 
        this.checkLocation();
      }, 5000);
    });

    // count down
    this.intervalTwo = setInterval(() => {
      Object.keys(this.state.arrivals).forEach(r => {
        let route = this.state.arrivals[r];
        route.estimates = route.estimates.map(p => {
          return p - 1000;
        }).filter(r => r > 0);
      });

      if(Object.keys(this.state.arrivals).length > 0){
        this.setState(this.state);
      }
      
    }, 1000);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
    clearInterval(this.intervalOne);
    clearInterval(this.intervalTwo);
  }

  _handleAppStateChange = (nextAppState) => {
    if(nextAppState == 'active' && this.state.state != 'active') this.refresh();
    this.setState({
      state: nextAppState
    });
  };


  refresh() {
    session.arrivalEstimates(this.state.stopId, (data) => {
      this.setState({
        arrivals: data
      });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.scroll}>
        {
          Object.keys(this.state.arrivals).map((key) => {
            let r = this.state.arrivals[key];

            let s = r.estimates.map(ms => {
              let seconds = Math.round(ms/1000);
              if(seconds > 60)
                return Math.round(seconds/60);
              else
                return '<1';
            }).slice(0, 3).join(', ');

            let text = 'In ' + s + ' minutes';

            let watch = () => {
              if(this.notificationId){
                Notifications.cancelScheduledNotificationAsync(this.notificationId);
              }
              
              if(this.state.watch == key){
                this.notificationId = null;
                this.setState({watch: ''});
              }
              else{
                this.setState({watch: key});
                let estimate = r.estimates[0];
                if(estimate != null && estimate > 60000){
                  // delay is time estimate - 10%
                  // or time r.estimates[0] - 1 min 
                  // (whichever is greater)
                  let delay = estimate - Math.max(estimate/5, 60000);
                  this.notify(r.name, 'Next bus is close!', delay);
                }
              }
            }

            return (
              <View style={key == this.state.watch ? styles.routeSelected : styles.route} key={key}>
                  <TouchableOpacity onPress={watch}>
                      <Text style={styles.routeTitle}>{r.name}</Text>
                      <Text style={styles.routeTitle}>{text}</Text>
                      <Text style={styles.routeInfo}>{r.destination}</Text>
                  </TouchableOpacity>  
              </View>
            );
          })
        }
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  scroll: {
    width: '100%'
  },

  route: {
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },

  routeSelected: {
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: '#eee'
  },

  routeTitle: {
    fontSize: 20,
    paddingBottom: 4,
    width: '100%',
    textAlign: 'center'
  },

  routeInfo: {
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
    color: '#666'
  }


});
