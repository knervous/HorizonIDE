import React from 'react';
import { Actions } from 'react-native-router-flux';
import { MessageBarManager } from 'react-native-message-bar';
import {
  StyleSheet,
  Text,
  View, TextInput, Button, Alert, Image
} from 'react-native';

import {GoogleSignin, GoogleSigninButton} from 'react-native-google-signin'; 
import GDrive from "react-native-google-drive-api-wrapper";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    height: null,
    width: null
  },
  text : {
    fontSize: 22,
    fontFamily: 'Helvetica, serif',
    color: '#fafafa',
    margin: 20
  },
  shadedBlock: {
    backgroundColor: 'rgba(0,0,0,.4)', 
    marginTop: 75, 
    padding: 50, 
    borderWidth: 2, 
    borderColor: 'gray', 
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});


export default class Launch extends React.Component {

  constructor(props){
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this._setupGoogleSignin();
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
      Actions.projectSelect({user: user})
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

  render() {
    return (
      <Image 
      style={styles.container}
          resizeMethod='resize'
          source={require('../lib/img/bg.jpg')}
      >
      <View style={styles.shadedBlock}>
      <Text style={styles.text}>Sign in With Google</Text>
      <GoogleSigninButton style={{width: 120, height: 44}} color={GoogleSigninButton.Color.Light} 
      size={GoogleSigninButton.Size.Icon} onPress={() => { this._signIn(); }}/>
      </View>
      
    </Image>
    );
  }

}