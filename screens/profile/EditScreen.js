import * as React from 'react'
import * as firebase from 'firebase'
import * as ImagePicker from 'expo-image-picker'
import { View, TouchableOpacity, SafeAreaView} from 'react-native'
import {Text, Image} from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import {styles} from '../styles'
import useAssetStore from '../../hooks/useAssetStore'


import NavBar from '../components/bottomNavComponent'
import Logout from '../auth/components/logoutComponent'

export default function EditScreen(props){
  const [assets,setAssets] = useAssetStore()
  const [icons,setIcons] = React.useState()

  React.useEffect(() => {
    if(assets){
     setIcons(assets.preferences)
   }
  },[assets])

  return(
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{flex:1}}>
          <View style={styles.alignCentered}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Ionicons size={30} name="arrow-back-outline" color='#E8E8E8'/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{justifyContent : 'center'}}>
          <Text style={styles.h2_ligth}>Preferences</Text>
        </View>
        <View style={{flex:3}}></View>
      </View>
      <View style={{flex:7}}>
        <TouchableOpacity style={styles.listItemContainer}
          onPress={() => {props.navigation.navigate('friends')}}>
            <View>
              <Image style={{height : 24, width : 40}} source={{uri: icons?.feedback}}/>
            </View>
            <View style={{flex:1}}></View>
            <View style={{flex:5}}>
              <Text>Feedback</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItemContainer}
          onPress={() => {props.navigation.navigate('personalinfo')}}>
            <View >
              <Image style={{height : 27, width : 27}} source={{uri: icons?.profile}}/>
            </View>
            <View style={{flex:1}}></View>
            <View style={{flex:5}}>
              <Text>Personal Info</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItemContainer}
          onPress={() => {props.navigation.navigate('password',{change : true})}}>
            <View>
              <Image style={{height : 26, width : 23}} source={{uri: icons?.password}}/>
            </View>
            <View style={{flex:1}}></View>
            <View style={{flex:5}}>
              <Text>Password</Text>
            </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.listItemContainer}>
            <View>
              <Ionicons size={32} name="exit" color='#343F4B'/>
            </View>
            <View style={{flex:1}}>
            </View>
            <View style={{flex:5}}>
              <Logout/>
            </View>
        </TouchableOpacity>
      </View>
      <NavBar navigation={props.navigation} route={4}/>
    </SafeAreaView>
  )
}
