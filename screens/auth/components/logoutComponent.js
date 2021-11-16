import React, {Component} from 'react'
import * as firebase from 'firebase'
import {View, TouchableOpacity} from 'react-native'
import {Text} from 'react-native-elements'

export default class Logout extends Component {

  render(){
    const _logout = () =>{
      firebase.auth().signOut()
    }

    return(
      <TouchableOpacity onPress={_logout}>
        <Text>Log out</Text>
      </TouchableOpacity>
    )
  }
}
