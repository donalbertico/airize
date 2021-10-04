import * as React from 'react';
import * as SplashScreen from 'expo-splash-screen'
import * as firebase from 'firebase'
import 'firebase/firestore'
import apiKeys from '../constants/apiKeys.js'
import useUserRead from './useUserRead'
import useUserStore from './useUserStore'

export default function useCachedResources(){
  const [auth, setAuth] = React.useState('toLoad')
  const [userInfo,setUserInfo] = React.useState({})
  const [setUser] = useUserStore()
  const [user,readUser] = useUserRead('get')
  const [isNew,setIsNew] = React.useState(false)

  React.useEffect(()=>{
    async function loadResourcesAndDataAsync(){
      try {
        SplashScreen.preventAutoHideAsync();
        firebase.initializeApp(apiKeys.firebase)
        firebase.auth().onAuthStateChanged((authUser)=>{
          console.log('noay?',(!authUser));
          if(authUser){
            setUserInfo({
              uid:authUser.uid,
              email:authUser.email,
              displayName:authUser.displayName})
            if(authUser.metadata.creationTime == authUser.metadata.lastSignInTime){
              setIsNew(true)
            }
            setAuth(true)
          }else{
            setIsNew(false)
            setAuth(false)
            setUser({destroyed :true})
            SplashScreen.hideAsync()
          }
        })
      } catch (err) {
        console.warn(err);
      }
    }
    loadResourcesAndDataAsync();
  }, []);


  React.useEffect(()=>{
    console.log(auth,user);
    if(auth==true&&user!='get'){
      if(user.uid){
        SplashScreen.hideAsync();
        return;
      }
      if(!isNew){
        let db = firebase.firestore()
        db.settings({ experimentalForceLongPolling: true })
        let userRef = db.collection('users')
        userRef.doc(userInfo.uid).get()
            .then((doc)=>{
              console.log('trayendoo');
              let newInfo = userInfo;
              newInfo.description = doc.data().description
              setUserInfo(newInfo)
              setUser(userInfo)
              SplashScreen.hideAsync()
            })
            .catch((e)=>{
              console.log('pepeta',e);
            })
      }
    }
  },[user,auth])

  return [auth]
}
