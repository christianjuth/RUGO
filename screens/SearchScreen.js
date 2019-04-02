import React from 'react';
import { YellowBox, ScrollView, AppState, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { showLocation } from 'react-native-map-link';
import Ripple from 'react-native-material-ripple';


import GlobalStyles from '../assets/Styles';

let data = require('../data');

export default class App extends React.Component {
  static navigationOptions = {
    title: 'Search',
  };

  constructor(props) {
    super(props);
    this.state = {
      search: '',
      results: []
    };
  }


  componentDidMount() {
    
  }

  componentWillUnmount() {
    
  }


  updateSearch(query) {

    let search = (obj, searchQuery, str = '') => {
      return [].concat.apply([], Object.keys(obj).map((key) => {
        if(obj[key].name && obj[key].name.indexOf(searchQuery) > -1){
          let out = {};
          out[obj[key].name+' '+str] = obj[key];
          return out;
        }

        else if(key.indexOf(searchQuery) > -1 && obj[key].lat){
          let out = {};
          if(/^[0-9]/.test(key))
            out[str+' '+key] = obj[key];
          else
            out[key+' '+str] = obj[key];
          return out;
        }

        else if(typeof obj[key] == 'object'){
          return search(obj[key], searchQuery, str+key).filter(s => s && s.length != 0);
        }
      }));
    }

    this.setState({
      search: query,
      results: search(data, query)
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <SearchBar
          placeholder="Type Here..."
          lightTheme={true}
          onChangeText={(search) => this.updateSearch(search)}
          value={this.state.search}
          inputStyle={{color: '#000'}}
          round={true}
        />
        <ScrollView>
          <View style={styles.scrollPadding}>
          {
            this.state.search.length > 0 ? (
              this.state.results.map((r,i) => {
                let key = Object.keys(r)[0];

                let onPress = () => {
                  showLocation({ 
                    latitude: r[key].lat, 
                    longitude: r[key].lng
                  });
                }

                return(
                  <Ripple style={styles.result} onPress={onPress} rippleColor='rgba(0,0,0,0.15)' key={i}>
                    <Text style={styles.resultTitle}>{key}</Text>
                  </Ripple>
                )
              })
              ) : (
                <Text></Text>
              )
          }
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E4E9EF',
  },

  scrollPadding: {
    paddingTop: 7
  },

  result: {
    paddingTop: 10,
    paddingBottom: 10,
    width: '96%',
    marginLeft: '2%',
    marginBottom: 3,
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

  resultTitle: {
    fontSize: 18,
    width: '100%',
    paddingLeft: 15
  },

});
