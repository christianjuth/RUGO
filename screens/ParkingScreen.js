import React from 'react';
import { ScrollView, TouchableOpacity, AsyncStorage, Text, Image, View, StyleSheet } from 'react-native';
import { WebBrowser } from 'expo';

import GlobalStyles from '../assets/Styles';

let ruLocate = require('../ruLocate.js');
import { showLocation } from 'react-native-map-link'

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
    this.props.navigation.setParams({sub: this.state.zone});
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

            return (
              <View style={styles.lot} key={l.name}>
                <TouchableOpacity onPress={onPress}>
                  <Text style={styles.lotTitle}>{l.name}</Text>
                  <Text style={styles.lotInfo}>{distance} away</Text>
                </TouchableOpacity>
              </View>
            )
          })
        }
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
    backgroundColor: '#fff',
  },

  lot: {
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },

  lotTitle: {
    fontSize: 20,
    paddingBottom: 4,
    width: '100%',
    textAlign: 'center'
  },

  lotInfo: {
    fontSize: 14,
    width: '100%',
    textAlign: 'center',
    color: '#666'
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
