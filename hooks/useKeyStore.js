import * as React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function useKeyStore(val){
  const [keys,setKeys] = React.useState(val)
  async function store(){
    try {
      const string = JSON.stringify(keys)
      await AsyncStorage.setItem('keys',string)
    } catch (e) {
      console.warn('ERROR saving keys',e);
    }
  }
  async function read(){
    try {
      let data = await AsyncStorage.getItem('keys')
      if(data) setKeys(JSON.parse(data))
    } catch (e) {
      console.warn('ERROR reading keys',e);
    }
  }
  if(keys){
    store()
  }else{
    read()
  }
  return [keys,setKeys]
}
