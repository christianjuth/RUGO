import React from 'react';
import { Picker, View, AsyncStorage, Text, StyleSheet } from 'react-native';

let data = require('../data');

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
  };

  constructor() {
  	super();
  	this.state = {
      isLoading: true,
  		parkingPass: 'none'
  	}
  	this.loadSettings();
  }

  loadSettings() {
  	AsyncStorage.getItem('parkingPass')
	  .then(value => {
	    this.setState({
        isLoading: false,
	    	parkingPass: value
	    })
  	});
  }

  render() {
    if (this.state.isLoading) {
      return(<View></View>);
    }

    return (
    	<View style={styles.container}>
    		<Text style={styles.title}>Parking Pass</Text>
    		<Picker
				  selectedValue={this.state.parkingPass}
				  style={styles.picker}
				  onValueChange={(value, i) => {
				    this.setState({parkingPass: value});
				    AsyncStorage.setItem('parkingPass', value);
				  }}>

				  <Picker.Item label='none' value='none'/>
				  {
				  	Object.keys(data.parkingPasses).map(p => {
				  		return <Picker.Item label={p} value={p} key={p}/>
				  	})
				  }
				</Picker>
    	</View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  
  title: {
    fontSize: 20,
    width: '100%',
    textAlign: 'center',
  },

  picker: {
  	width: '100%'
  }
});