import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function useSpotifyTokenStore(val){
  const [tokens,setTokens] = useState(val)

  useEffect(()=>{
    async function store(){
      try {
        let string = JSON.stringify(tokens)
        await AsyncStorage.setItem('spotifyToken',string)
      } catch (e) {
        console.warn('Error saving tokens:',e);
      }
    }
    async function read(){
      try {
        let data = await AsyncStorage.getItem('spotifyToken')
        if(data) setTokens(JSON.parse(data))
      } catch (e) {
        console.warn('ERROR reading assets',e);
      }
    }
    if(tokens){
      store()
    }else{
      read()
    }
  },[tokens])

  return [tokens,setTokens]
}
