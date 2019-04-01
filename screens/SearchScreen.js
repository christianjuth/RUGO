import React from 'react';
import { YellowBox, ScrollView, AppState, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SearchBar } from 'react-native-elements';


import GlobalStyles from '../assets/Styles';

let transloc = require('../transloc.js');
let session = new transloc(require('../transloc-config').apiKey);

export default class App extends React.Component {
  static navigationOptions = {
    title: 'Search',
  };

  constructor(props) {
    super(props);
    this.state = {};
  }


  componentDidMount() {
    
  }

  componentWillUnmount() {
    
  }


  updateSearch(search) {
    this.setState({
      search: search
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
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },

  


});
