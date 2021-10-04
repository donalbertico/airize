import * as React from 'react'
import { Audio } from 'expo-av'
import Voice from '@react-native-voice/voice'
import {View,TouchableOpacity} from 'react-native'
import { Ionicons } from '@expo/vector-icons';


import {styles} from '../styles'

export default function SessionScreen(props){


  const [permission,setPermission] = React.useState(false)
  const [url,setUrl] = React.useState()

  async function askPermission(){
    try {
      await Audio.requestPermissionsAsync()
    }catch(e){
      console.warn(e);
    }
  }

  handleListen = ()=>{
    console.log('pg');
  }

  onSpeechStart = ()=>{
    console.log('speechstarted');
    async function startListening(){
      try {
        await Voice.start()
      } catch (e) {
        console.log('error',e);
      }
    }
  }

  React.useEffect(()=>{
    Voice.onSpeechStart = onSpeechStart
  },[])


  return(
    <View style={styles.container}>
      <View style={{flex:1}}></View>
      <View style={styles.alignCentered}>
        <View style={styles.horizontalView}>
          <View style={{flex:2}}></View>
          <Ionicons name="mic" size={70} color='black' onPress={handleListen}/>
          <View style={{flex:2}}></View>
        </View>
      </View>
      <View style={{flex:1}}></View>
    </View>
  )
}
