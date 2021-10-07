import * as React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function useAssetStore(val){
  const [assets,setAssets] = React.useState(val)

  React.useEffect(()=>{
    async function store(){
      try{
        const string = JSON.stringify(assets)
        await AsyncStorage.setItem('assets',string)
      }catch(e){
        console.warn('ERROR saving assets:',e);
      }
    }
    async function read(){
      try {
        let data = await AsyncStorage.getItem('assets')
        if (data) {
          setAssets(JSON.parse(data))
        }
      } catch (e) {
        console.warn('ERROR reading assets:',e);
      }
    }
    if(assets){
      store()
    }else {
      read()
    }
  },[assets])

  return [assets,setAssets]
}
