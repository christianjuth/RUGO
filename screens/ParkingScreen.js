import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { WebBrowser } from 'expo';

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: 'Parking',
  };

  constructor(props) {
    super();
    this.zones = {
      'Zone A': 'https://ipo.rutgers.edu/dots/zone-a',
      'Zone B': 'https://ipo.rutgers.edu/dots/zone-b',
      'Zone C': 'https://ipo.rutgers.edu/dots/zone-c',
      'Zone D': 'https://ipo.rutgers.edu/dots/zone-d',
      'Zone L': 'https://ipo.rutgers.edu/dots/zone-l',
      'Zone H': 'https://ipo.rutgers.edu/dots/zone-h',
      'Night Commute': 'https://ipo.rutgers.edu/dots/night-commute',
      'Resident Parking': 'https://ipo.rutgers.edu/dots/resident-parking'
    }
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        {
          Object.keys(this.zones).map(zone => {
            return(
              <View key={zone} style={styles.link}>
                <Text style={styles.linkText} onPress={() => {
                  WebBrowser.openBrowserAsync(this.zones[zone]);
                }}>{zone}</Text>
              </View>
            )
          })
        }
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  link: {
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },

  linkText: {
    fontSize: 20,
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    textAlign: 'center'
  }
});
