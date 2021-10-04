import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useUserRead(val){
  const [user,setUser] = React.useState(val)

  React.useEffect(()=>{
    async function getUser(){
      try {
        let data = await AsyncStorage.getItem('user')
        if (data != null){
          setUser(JSON.parse(data))
        }else{
          setUser({destroyed:true})
        }
      } catch (e) {
        console.warn('ERROR : retraving user',e);
        setUser(null)
      }
     // console.log('reading');
    }
    if(user == 'get')getUser()
  },[user])

  return [user,setUser]
}
