/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { Actions } from 'react-native-router-flux';
import {
  StyleSheet, Text, View, Alert, Image, Picker
} from 'react-native';
import Button from 'react-native-button';
import GDrive from "react-native-google-drive-api-wrapper";

export default class ProjectSelect extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      user: null,
      projects: [],
      selectedProject: {},
      horizonId: ''
    }
  }

  componentWillMount(){
    if(this.props.user){
      GDrive.setAccessToken(this.props.user.accessToken);
      GDrive.init()
      console.dir(GDrive)
      GDrive.files.list({q: "mimeType='application/vnd.google-apps.folder' and name contains 'HorizonIDE'"}).then((data,err) => {
        return data.json()
      }).then((result) => {
        console.dir(result)
        if(result.files.length === 0){
          GDrive.files.safeCreateFolder({
              name: "HorizonIDE",
              parents: ["root"]
          });
        }else{
          var id = result.files[0].id;
          GDrive.files.list({q: `mimeType='application/vnd.google-apps.folder' and '${id}' in parents`}).then((data,err) => {
            return data.json()
          }).then((result) => {
            console.dir(result)
            this.setState({
              projects: result.files,
              horizonId: id
            })
          })
        }
      })
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
              >Welcome back, {this.props.user.name}!</Text>
            
            <Button
              onPress={()=>{
                Actions.createNewProject({user: this.props.user, projects: this.state.projects, id: this.state.horizonId})
              }}
              style={styles.button}
              accessibilityLabel="Send To Server to Compile and get Response"
            >Create New Project</Button>
            </View>
            <View
              style={styles.selectContainer}
            >
            <Text
                style={styles.text}
              >Choose an existing project...</Text>
            <Picker
              selectedValue={this.state.selectedProject}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) => this.setState({selectedProject: itemValue})}
              >
              {
              this.state.projects.map((p) => 
                <Picker.Item key={p.id} label={p.name} value={p.id} />
                )
              }
            </Picker>
            <Button
              onPress={()=>{ Actions.editor() }}
              style={styles.button}
            >Load Project</Button>
            </View>
            

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
  innerContainer: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  selectContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 100
  },
  shadedBlock: {
    backgroundColor: 'rgba(0,0,0,.4)', 
    marginTop: 75, 
    padding: 50, 
    borderWidth: 2, 
    borderColor: 'gray', 
    borderRadius: 15
  },
  other : {
    flex: 0
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
  picker: {
    width: 250,
    backgroundColor: '#FFF0E0',
    borderColor: 'black',
    borderWidth: 1,
    marginBottom: 10,
    margin: 10
  },
  text : {
    fontSize: 22,
    fontFamily: 'Helvetica, serif',
    color: '#fafafa',
  }
});
