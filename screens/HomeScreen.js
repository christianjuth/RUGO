import React from 'react';
import { YellowBox, ScrollView, AppState, StyleSheet, Text, View } from 'react-native';
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
      state: 'active'
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


  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);

    session.load(() => {
      this.checkLocation();
      this.intervalOne = setInterval(() => { 
        this.checkLocation();
      }, 5000);
    });

    // count down
    this.intervalTwo = setInterval(() => {
      Object.keys(this.state.arrivals).forEach(r => {
        let arrivals = this.state.arrivals[r];
        arrivals.estimates = arrivals.estimates.map(p => {
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

           

            return (
              <View style={styles.route} key={key}>
                      <Text style={styles.routeTitle}>{r.name}</Text>
                      <Text style={styles.routeTitle}>{text}</Text>
                      <Text style={styles.routeInfo}>{r.destination}</Text>
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
