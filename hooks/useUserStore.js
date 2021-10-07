import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useUserStore(val){
  const [user, setUser] = React.useState(val)

  React.useEffect(()=>{
    async function storeUser(){
      try {
        const string = JSON.stringify(user)
        await AsyncStorage.setItem('user',string)
      } catch (e) {
        console.warn('ERROR saving user:',e)
      }
    }
    if(user){
      storeUser()
      // console.log('storing');
    }
  },[user]);

  return [setUser]
}
