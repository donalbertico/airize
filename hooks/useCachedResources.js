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
          readUser('get')
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
    if(auth==true&&user!='get'){
      if(user.uid){
        SplashScreen.hideAsync();
        return;
      }
      if(!isNew){
        let db = firebase.firestore()
        let userRef = db.collection('users')
        userRef.doc(userInfo.uid).get()
            .then((doc)=>{
              let newInfo = userInfo;
              newInfo.description = doc.data().description
              setUserInfo(newInfo)
              setUser(userInfo)
              SplashScreen.hideAsync()
            })
      }
    }
  },[user,auth])

  return [auth]
}
