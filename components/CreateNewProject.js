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
  View, TextInput, Image, Alert, Modal
} from 'react-native';
import Button from 'react-native-button';
import GDrive from "react-native-google-drive-api-wrapper";
import { createClassTemplate, createMetaInfo } from './templates/JavaClassTemplate'

export default class CreateNewProject extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      user: props.user,
      projects: props.projects,
      projectName: '',
      mainClass: '',
      modalVisible: false
    }

  }

  _validateSubmit(){
    let matched = this.state.projects.filter((proj)=> proj.name === this.state.projectName)
    if(matched.length > 0){
      Alert.alert(
        'Warning',
        'There is already a project with that name!',
        [
          {text: 'OK'},
        ],
        { cancelable: true }
      )
      return false;
    }

    if(this.state.mainClass.includes(" ")){
      Alert.alert(
        'Warning',
        'Main class may not contain spaces!',
        [
          {text: 'OK'},
        ],
        { cancelable: true }
      )
      return false;
    }

    if(this.state.projectName.length === 0){
      Alert.alert(
        'Warning',
        'Project Name must be filled in!',
        [
          {text: 'OK'},
        ],
        { cancelable: true }
      )
      return false;
    }

    if(this.state.mainClass.length === 0){
      Alert.alert(
        'Warning',
        'Main class must be filled in!',
        [
          {text: 'OK'},
        ],
        { cancelable: true }
      )
      return false;
    }

    
    return true;
  }

  async _createNewProject(){
    if(!this._validateSubmit()){
      return;
    }
    this.setState({modalVisible: true})
    
    var projectTree = this.state.projectName.split(" "),
        capMain = capitalizeFirstLetter(this.state.mainClass),
        id = await GDrive.files.safeCreateFolder({
            name: this.state.projectName,
            parents: [this.props.id]
        });
  
    await GDrive.files.createFileMultipart(
      JSON.stringify(createMetaInfo(capMain)),
      "text/plain", {
          parents: [id],
          name: `meta.json`
      });

    id = await GDrive.files.safeCreateFolder({
      name: 'src',
      parents: [id]
    })

    for(let p of projectTree){
      id = await GDrive.files.safeCreateFolder({
        name: p,
        parents: [id]
      })
    }

    await GDrive.files.createFileMultipart(
      createClassTemplate(this.state.projectName.split('').reduce((a,b) =>  a.concat(b === ' ' ? '.' : b)  ).toLowerCase(), capMain),
      "text/plain", {
          parents: [id],
          name: `${capMain}.java`
      });

    Alert.alert(
      'Success!',
      'Project successfully created!',
      [
        {text: 'OK'},
      ],
      { cancelable: true }
    )
    this.setState({modalVisible: false})
    Actions.projectSelect({update: true, user: this.props.user});
  }

  componentDidMount(){
    if(!GDrive.isInitialized()){
      GDrive.setAccessToken(this.props.user.accessToken);
      GDrive.init()
    }
  }

  render() {
      return (
        <Image 
          style={styles.container}
          resizeMethod='resize'
          source={require('../lib/img/bg.jpg')}
      >
      
        {
          this.props.user ? 
          <View
            style={styles.shadedBlock}
          >
            <View
              style={styles.innerContainer}
            >
              <Text
                style={styles.text}
              >Project Name</Text>
            
            </View>
            
            <TextInput
              style={{height: 40, width: 250, borderColor: 'gray', borderWidth: 1, backgroundColor: 'rgba(255,255,255,.5)', textAlign: 'center', margin: 10}}
              onChangeText={(text) => this.setState({projectName: text})}
              value={this.state.projectName}
            />

            <Text
                style={styles.text}
              >Main Class Name</Text>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1, backgroundColor: 'rgba(255,255,255,.5)', textAlign: 'center', margin: 10}}
              onChangeText={(text) => this.setState({mainClass: text})}
              value={this.state.mainClass}
            />
          
            <Button
              onPress={this._createNewProject.bind(this)}
              style={styles.button}
            >Create Project</Button>

         
              <Modal
                animationType="fade"
                transparent={true}
                visible={this.state.modalVisible}
                style={{marginTop: 0}}
                onRequestClose={()=>{}} //nothing!
                >
                <View style={{justifyContent: 'center',alignItems: 'center',marginTop:100, backgroundColor: 'white', height: 100, margin: 25}}>
                  <Text>Loading, please wait...</Text>
                  <Text>Project is being created</Text>
                </View>
              </Modal>
            


          </View>

          :

          <View>

          </View>
        }
        
          
        </Image>
      );
  }

  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    height: null,
    width: null,
  },
  shadedBlock: {
    backgroundColor: 'rgba(0,0,0,.4)', 
    marginTop: 75, 
    padding: 50, 
    borderWidth: 2, 
    borderColor: 'gray', 
    borderRadius: 15
  },
  button: {
    margin: 5,
    backgroundColor: 'steelblue',
    borderWidth:1,
    borderColor: 'black',
    borderRadius: 10,
    padding: 5,
    color: '#fafafa'
  },
  text : {
    fontSize: 18,
    fontFamily: 'Helvetica, serif',
    color: '#fafafa',
    textAlign: 'center'
  }
});


function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}