import React, {Component} from 'react'

import {View, TouchableOpacity} from 'react-native'
import {Text} from 'react-native-elements'

export default class Logout extends Component {

  render(){

    _logout = () =>{
      firebase.auth().signOut()
    }

    return(
      <View>
        <TouchableOpacity onPress={()=> _logout()}>
          <Text>bye</Text>
        </TouchableOpacity>
      </View>
    )
  }
}
