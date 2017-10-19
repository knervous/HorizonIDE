/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import {
  StyleSheet,
  Text,
  View, TextInput, Button, Alert, Image
} from 'react-native';
import {GoogleSignin} from 'react-native-google-signin'; 
import axios from 'axios'
import GDrive from "react-native-google-drive-api-wrapper";
const client = require('socket.io-client') 

export default class Editor extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      classText: 'package Java; \r\n \r\n'
      +' public class TestApp {  \r\n\r\n'
      +' public static void main(String[] args){ \r\n '
      +'  for(int i = 0; i < 20; i++) { \r\n'
      +'     System.out.println(\"Testing\: " + i);' 
      +'    \r\n }'
      +'\r\n }'
      +' \r\n\r\n }',
      user: null
    }

  }

  sendToServer(a,b,c){
    console.log('hit here 123')
    var self = this;
    this.socket = client.connect('ws://73.187.131.221:15000', {reconnect: true})
    
    this.socket.on('connect', () => {
        console.log('Connected!');
        this.socket.emit('send_class_to_compile', {data: self.state.classText})
    });
    
    this.socket.on('receive_error', (data)=>{
      Alert.alert(
        'Java Error! Nice one idiot',
        data,
        [
          //{text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: true }
      )
    })

    this.socket.on('receive_output',(data)=>{
      Alert.alert(
        'Java Output From Successful Compile',
        data,
        [
          //{text: 'Ask me later', onPress: () => console.log('Ask me later pressed')},
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        { cancelable: true }
      )

    })
    
  }

  async _signOut(){
    const val = await GoogleSignin.signOut();
    Actions.launch({val})
    console.log('signing out')
    console.dir(val)
  }

  async doSomething(){
    console.log('my props')

    console.dir(this.props)
    console.dir(GDrive.files)
    if(GDrive.files){
      console.dir('trying to fetch')
      fetch(GDrive._urlFiles, {
        headers: GDrive._createHeaders()
     }).then((data, err) => 
     { 
       console.dir(data)
       console.dir(err)
      return data.json() })
     .then((data) => {
       console.dir(data)
     })

    GDrive.files.list({}).then((data,err) => {
      console.dir(data)
      console.dir(err)
    })
    }else{
      GDrive.setAccessToken(this.props.user.accessToken);
      GDrive.init()
    }
    
  }

  render() {
      return (
        <View 
          style={styles.container}
          >
          <Text>Testing Class Compile</Text>
          <View
          style={styles.other}>
          <Button
            title="Do Something"
            style={{borderColor: 'black', borderWidth: 2, }}
            onPress={this.doSomething.bind(this)}
          />
          <Button
            title="Sign Out"
            style={{borderColor: 'black', borderWidth: 2, }}
            onPress={this._signOut.bind(this)}
          />
          </View>
          <TextInput
          multiline={true}
          blurOnSubmit={false}
          style={{height: '70%', width: '100%', borderColor: 'gray', borderWidth: 1}}
          onChangeText={(text) => {
            this.setState({classText: text})}
            }
          value={this.state.classText}
        />
  
        <Button
            onPress={this.sendToServer.bind(this)}
            title="Send To Server"
            color="#841584"
            accessibilityLabel="Send To Server to Compile and get Response"
          />
          
        </View>
      );
  }

  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  other : {
    flex: 0
  }
});
