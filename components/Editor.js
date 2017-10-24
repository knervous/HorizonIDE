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
  View, TextInput, Alert, Image, ScrollView, Picker
} from 'react-native';
import Button from 'react-native-button';
import {GoogleSignin} from 'react-native-google-signin'; 
import axios from 'axios'
import GDrive from "react-native-google-drive-api-wrapper";
import NativeSyntaxHighlighter from './util/NativeSyntaxHighlighter';
import { agate, ascetic, atelierForestDark, atelierPlateauLight, tomorrowNightBlue } from 'react-syntax-highlighter/dist/styles';
const client = require('socket.io-client') 

//import Drive from 'googleapis/apis/drive/v3.js'



export default class Editor extends React.Component {
  constructor(props){
    super(props)
    Drive.
    this.state = {
      classText: 'package Java; \r\n \r\n'
      +' public class TestApp {  \r\n\r\n'
      +' public static void main(String[] args){ \r\n '
      +'  for(int i = 0; i < 20; i++) { \r\n'
      +'     System.out.println(\"Testing\: " + i);' 
      +'    \r\n }'
      +'\r\n }'
      +' \r\n\r\n }',
      
      themes: [
        { name: 'Agate', style: agate },
        { name: 'Ascetic', style: ascetic },
        { name: 'Atelier Forest Dark', style: atelierForestDark },
        { name: 'Atelier Plateau Light', style: atelierPlateauLight },
        { name: 'Tomorrow Night Blue', style: tomorrowNightBlue },
      ],
      selectedTheme: { name: 'Tomorrow Night Blue', style: tomorrowNightBlue },

      javaFiles: []
    }

  }
  
  async _searchTree(id){
    await GDrive.files.list({q: `'${id}' in parents`}).then((data,err) => {
      console.dir(data)
      return data.json()
    }).then(async (result) => {
      console.dir(result)
      for(let file of result.files){
        if(file.mimeType === 'application/vnd.google-apps.folder'){
          console.log('found folder')
          console.dir(file) 
          await this._searchTree(file.id)
        }
        if(file.name.includes('.java')){
          this.setState({javaFiles: [...this.state.javaFiles, file]})
        }
      }
    })
  }

  async componentWillMount(){
    console.log('mounting now')
    console.dir(this.props)
    GDrive.setAccessToken(this.props.user.accessToken);
    GDrive.init()
    await this._searchTree(this.props.id.id, [])
    if(this.state.javaFiles.length > 0){
      this.setState({selectedValue: this.state.javaFiles[0]})
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

  _saveCurrentClass(){
    console.log('ok in')
    console.dir(this.state)
    console.dir(GDrive)

    updateExistingFile(this.state.classText, 'text/plain', '', this.state.selectedValue.id).then((res) => {
      return res.json()
    })
    .then((result) => {
      console.dir(result)
    })
  }

  _selectClass(itemValue,itemIndex){
    this._saveCurrentClass.bind(this)();
    GDrive.files.get(itemValue.id, {alt: 'media'})
      .then((data,err) => data.arrayBuffer())
      .then((result) => {
        var enc = new TextDecoder();
        this.setState({classText: enc.decode(result), selectedValue: itemValue})
        console.log(enc.decode(result));
      })
  }

  async _signOut(){
    const val = await GoogleSignin.signOut();
    Actions.launch({val})
    console.log('signing out')
    console.dir(val)
  }

  render() {
      return (
        <View >
          <View style={styles.flexContainer}>
          <Picker
              selectedValue={this.state.selectedValue}
              style={styles.picker}
              onValueChange={this._selectClass.bind(this)}
              >
              {
              this.state.javaFiles.map((p, ind) => 
                <Picker.Item key={ind} label={p.name} value={p} />
                )
              }
            </Picker>
          <Picker
              selectedValue={this.state.selectedTheme === null ? 'Loading...' : this.state.selectedTheme}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) => this.setState({selectedTheme: itemValue})}
              >
              {
              this.state.themes.map((p, ind) => 
                <Picker.Item key={ind} label={p.name} value={p} />
                )
              }
            </Picker>
            </View>
          <View style={{height: 600, width: '100%', borderWidth: 5, 
            borderColor: 'gray', 
            }}>
          <NativeSyntaxHighlighter 
            //showLineNumbers={true}
            language="java" 
            style={this.state.selectedTheme.style}
            CodeTag={TextInput}
            onChangeText={(text)=>{
              this.setState({classText: text.trim()})
            }}>
            {this.state.classText}
            </NativeSyntaxHighlighter>
          </View>
          <View style={styles.flexContainer}>
          <Button
            onPress={this.sendToServer.bind(this)} 
            color="#841584"
            style={styles.button}
            accessibilityLabel="Send To Server to Compile and get Response"
          >Send to Server</Button>

          <Button
            style={styles.smallButton}
            onPress={this._saveCurrentClass.bind(this)}
          >Save</Button>

          <Button
            style={styles.smallButton}
            onPress={this._signOut.bind(this)}
          >Sign Out</Button>
          </View>
          
        </View>
      );
  }

  
}


updateExistingFile = (media, mediaType, metadata, id) =>{
  const ddb = `--${GDrive.files.params.boundary}`;
  const ending = `\n${ddb}--`;

  let body = `\n${ddb}\n` +
     `Content-Type: ${GDrive._contentTypeJson}\n\n` +
     `${JSON.stringify(metadata)}\n\n${ddb}\n` +
     `Content-Type: ${mediaType}\n\n`;
  
  if (media.constructor == String) {
     body += `${media}${ending}`;
  } else {
     body = new Uint8Array(
        StaticUtils.encodedUtf8ToByteArray(utf8.encode(body))
        .concat(media)
        .concat(StaticUtils.encodedUtf8ToByteArray(utf8.encode(ending))));
  }
  console.dir(body)
  return fetch(
     `https://www.googleapis.com/upload/drive/v2/files/${id}`, {
        method: "PUT",
        headers: GDrive._createHeaders(
           `multipart/mixed; boundary=${GDrive.files.params.boundary}`,
           body.length),
        body: body
     });
}




const styles = StyleSheet.create({
  flexContainer: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    margin: 15,
    padding:0,
    width: 150,
    height: 25,
    borderColor: 'black',
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#F0F0F0'
  },
  smallButton: {
    margin: 15,
    padding:0,
    width: 75,
    height: 25,
    borderColor: 'black',
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#F0F0F0'
  },
  other : {
    flex: 0
  },
  picker: {
    width: 200
  }
});


TextInput.defaultProps = {
  multiline: true,
  style: {width: 550, height: 650}
}