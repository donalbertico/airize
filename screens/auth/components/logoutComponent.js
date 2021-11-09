import React, {Component} from 'react'
import * as firebase from 'firebase'
import {View, TouchableOpacity} from 'react-native'
import {Button} from 'react-native-elements'

export default class Logout extends Component {

  render(){
    const _logout = () =>{
      firebase.auth().signOut()
    }

    return(
      <View>
        <Button title='Logout' type='clear' onPress={_logout}/>
      </View>
    )
  }
}
