import React from 'react';
import { YellowBox, ScrollView, AppState, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Constants, Notifications, Permissions } from 'expo';
import Ripple from 'react-native-material-ripple';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';

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
      let stopName = stop.name.split('-')[0];
      this.props.navigation.setParams({sub: stopName});
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
      <ScrollView style={styles.container}>
        <View style={styles.scroll}>
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

            let text = s + ' minutes';

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

            let name = r.name.replace(/\s+shuttle$/i,'');

            let selected = key == this.state.watch;

            return (
              <Ripple style={selected ? styles.selectedRoute : styles.route} onPress={watch} key={key} rippleColor='rgba(0,0,0,0.15)'>
                <Text style={selected ? styles.selectedRouteTitle : styles.routeTitle}>{name}</Text>
                <Text style={selected ? styles.selectedRouteEstimates : styles.routeEstimates}>{text}</Text>
                <Text style={selected ? styles.selectedRouteInfo : styles.routeInfo}>{r.name.length < 6 ? r.destination : ''}</Text>
              </Ripple>
            );
          })
        }
        </View>
      </ScrollView>
      
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E9EF',
  },

  scroll: {
    padding: 7
  },

  route: {
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: "#666",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
  },

  routeTitle: {
    fontSize: wp('2%') + 16,
    paddingBottom: 4,
    width: '100%',
    paddingLeft: 15,
    fontWeight: '500'
  },

  routeInfo: {
    position: 'absolute',
    fontSize: wp('2%') + 10,
    top: 12,
    right: 15,
    width: '100%',
    textAlign: 'right',
    color: '#999',
    fontWeight: '100'
  },

  routeEstimates: {
    fontSize: wp('2%') + 10,
    width: '100%',
    paddingLeft: 15,
    fontWeight: '100'
  },


  selectedRoute: {
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: "#666",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2,
    backgroundColor: '#48dbfb'
  },

  selectedRouteTitle: {
    fontSize: wp('2%') + 16,
    paddingBottom: 4,
    width: '100%',
    paddingLeft: 15,
    fontWeight: '500',
    color: '#fff'
  },

  selectedRouteInfo: {
    position: 'absolute',
    fontSize: wp('2%') + 10,
    top: 12,
    right: 15,
    width: '100%',
    textAlign: 'right',
    fontWeight: '100',
    color: '#fff'
  },

  selectedRouteEstimates: {
    fontSize: wp('2%') + 10,
    width: '100%',
    paddingLeft: 15,
    fontWeight: '100',
    color: '#fff'
  },

  


});
