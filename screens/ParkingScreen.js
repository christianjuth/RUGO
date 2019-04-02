import React from 'react';
import { ScrollView, TouchableOpacity, AsyncStorage, Text, Image, View, StyleSheet } from 'react-native';
import { WebBrowser } from 'expo';
import Ripple from 'react-native-material-ripple';

import GlobalStyles from '../assets/Styles';

let ruLocate = require('../ruLocate.js');
import { showLocation } from 'react-native-map-link';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from 'react-native-responsive-screen';

export default class LinksScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: (
        <View>
          <Text style={GlobalStyles.headerTitle}>Parking Lots</Text>
          <Text style={GlobalStyles.headerSub}>{navigation.getParam('sub')}</Text>
        </View>
      )
    };
  };

  constructor(props) {
    super();

    this.state = {
      zone: 'none',
      lots: []
    };
    this.loadSettings();
  }

  componentDidMount() {
    this.checkLocation();
    this.interval = setInterval(() => { 
      this.checkLocation();
    }, 5000);
    this.props.navigation.addListener('willFocus', () => {
      this.loadSettings();
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  loadSettings() {
    AsyncStorage.getItem('parkingPass')
    .then(value => {
      this.setState({
        zone: value
      });
      this.checkLocation();
    });
  }

  checkLocation() {
    let lots = ruLocate.closestLots(this.state.zone, loc.lat, loc.lng);
    let campus = ruLocate.closestCampus(loc.lat, loc.lng);
    this.props.navigation.setParams({sub: this.state.zone + ' - ' + campus});
    this.setState({
      lots: lots
    });
  }

  buyPass() {
    WebBrowser.openBrowserAsync('https://rudots.nupark.com/portal/Account/Login');
  }

  render() {
    return this.state.lots != null ? (

      <ScrollView style={styles.container}>
        <View style={styles.padding}>


        {
          this.state.lots.map(l => {
            let distance = l.distance;
            if(distance < 1000){
              distance = Math.round(distance/10)*10 + ' feet';
            } else{
              distance = Math.round((distance / 5280)*10)/10 + ' miles';
            }

            let onPress = () => {
              showLocation({ 
                latitude: l.lat, 
                longitude: l.lng
              });
            }

            let time = l.time.split('-');
            time[1] = (time[1]) + (time[1] < 12 ? 'am' : 'pm');
            time = time[1];

            return (
              <Ripple style={styles.lot} key={l.name} onPress={onPress} rippleColor='rgba(0,0,0,0.15)'>
                <Text style={styles.lotTime}>until {time}</Text>
                <Text style={styles.lotTitle}>{l.name}</Text>
                <Text style={styles.lotInfo}>{distance} away</Text>
              </Ripple>
            )
          })
        }
        </View>
      </ScrollView>

      ) : (
        <TouchableOpacity onPress={this.buyPass}>
          <Text style={styles.noPass}>Click to purchase parking pass. If you already have a pass go to settings (bottom right corner).</Text>
          <Image
            style={styles.image}
            source={{uri: 'https://thumbs.gfycat.com/EnergeticFlawlessAztecant-small.gif'}}
          />
        </TouchableOpacity>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E9EF'
  },

  padding: {
    padding: 7
  },

  lot: {
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

  lotTitle: {
    fontSize: wp('2%') + 14,
    paddingBottom: 4,
    width: '100%',
    paddingLeft: 15,
    fontWeight: '500'
  },

  lotTime: {
    position: 'absolute',
    fontSize: wp('2%') + 10,
    top: 12,
    right: 15,
    width: '100%',
    textAlign: 'right',
    color: '#999',
    fontWeight: '100'
  },

  lotInfo: {
    fontSize: wp('2%') + 10,
    width: '100%',
    paddingLeft: 15,
    fontWeight: '100'
  },

  noPass: {
    color: '#fff',
    fontSize: 20,
    marginTop: 150,
    width: '100%',
    textAlign: 'center',
    position: 'absolute',
    zIndex: 100
  },

  image: {
    width: '100%', 
    height: '100%'
  }
});
