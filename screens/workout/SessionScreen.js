import * as React from 'react'
import { Audio } from 'expo-av'
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
    askPermission()
  }

  inferenceCb = (obj)=>{
    console.log('aloo',JSON.stringify(obj));
  }

  // React.useEffect(()=>{
  //   async function viendoviendo(){
  //     let uri = await Asset.fromModule(require('../../assets/rhino.rhn')).localUri
  //     setUrl(uri)
  //   }
  //   viendoviendo()
  //
  //   async function createRhinoManager(){
  //     // console.log('a ver',url);
  //     console.log(url.split('file:///')[1]);
  //
  //     // try{
  //     //   const rhinoManager = RhinoManager.create(
  //     //     url,
  //     //     inferenceCb)
  //     // }catch(e){
  //     //   console.log(e);
  //     // }
  //
  //   }
  //   if (url != undefined) {
  //     createRhinoManager()
  //   }
  // },[url])

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
