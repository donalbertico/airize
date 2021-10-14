import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function useSpotifyPlayStore(val){
  const [playInfo,setPlayInfo] = useState()
  async function store(){
    try {
      const string = JSON.stringify(playInfo)
      await AsyncStorage.setItem('playInfo',string)
    } catch (e) {
      console.warn('Error saving playInfo',e);
    }
  }
  async function read(){
    try {
      let data = await AsyncStorage.getItem('playInfo')
      if(data) setPlayInfo(JSON.parse(data))
    } catch (e) {
      console.warn('ERROR reading keys',e);
    }
  }
  if(playInfo){
    store()
  }else{
    read()
  }
  return [playInfo,setPlayInfo]
}
