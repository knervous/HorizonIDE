/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View, TextInput, Button, Alert, Image
} from 'react-native';

import axios from 'axios'
import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin'; 
import GDrive from "react-native-google-drive-api-wrapper";
const client = require('socket.io-client') 

export default class JCompiler extends React.Component {
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

  componentDidMount() {
    this._setupGoogleSignin();
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

  async _signIn(){
    const user = await GoogleSignIn.signInPromise();
    GDrive.setAccessToken(user.accessToken);
    console.log(user);
    console.dir(GDrive)
  }

  async _signOut(){
    const val = await GoogleSignIn.signOut();
    console.log('signing out')
    console.dir(val)
  }

  async doSomething(){
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
      GDrive.setAccessToken(this.state.user.accessToken);
      GDrive.init()
    }
    
  }

  render() {
    console.log('i\'m rendering');
    console.dir(this.state)
    console.dir(this.props)
    console.log('gdrive')
    console.dir(GDrive)
    if (this.state.user === null) {
      console.log('user is null?')
      return (
        
        <View style={styles.container}>
          <Text>Sign in</Text>
          <GoogleSigninButton style={{width: 120, height: 44}} color={GoogleSigninButton.Color.Light} 
          size={GoogleSigninButton.Size.Icon} onPress={() => { this._signIn(); }}/>
        </View>
      );
    }else{
      return (
        <Image 
          style={styles.container}
          resizeMethod='resize'
          source={require('./lib/img/bg.jpg')}
          >
          <Text>Testing Class Compile</Text>
          <Button
            title="Sign Out"
            style={{borderColor: 'black', borderWidth: 2, }}
            onPress={this.doSomething.bind(this)}
          />

          <GoogleSigninButton
            style={{width: 200, height: 48}}
            size={GoogleSigninButton.Size.Icon}
            color={GoogleSigninButton.Color.Dark}
            onPress={this._signOut.bind(this)}
            />
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
          
        </Image>
      );

    }
  }

  async _setupGoogleSignin() {
    console.log('setting up')
    try {
      await GoogleSignin.hasPlayServices({ autoResolve: true });
      await GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/drive'],
        shouldFetchBasicProfile: true,
        webClientId: '892021746460-04urnpeloisslns1p7gt82sj43n2a7hp.apps.googleusercontent.com',
        offlineAccess: true
      });

      const user = await GoogleSignin.currentUserAsync();
      console.dir(GoogleSignin)
      console.log(user);
      this.setState({user});
    }
    catch(err) {
      console.log("Play services error", err.code, err.message);
    }
  }

  _signIn() {
    console.log('trying sign in ')
    GoogleSignin.signIn()
    .then((user) => {
      console.log(user);
      this.setState({user: user});
    })
    .catch((err) => {
      console.log('WRONG SIGNIN', err);
    })
    .done();
  }

  _signOut() {
    GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
      this.setState({user: null});
    })
    .done();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    height: null,
    width: null
  },
});


AppRegistry.registerComponent('JCompiler', () => JCompiler);
