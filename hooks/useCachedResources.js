import * as React from 'react';
import * as SplashScreen from 'expo-splash-screen'
import * as firebase from 'firebase'
import * as Asset from 'expo-asset'
import 'firebase/firestore'
import apiKeys from '../constants/apiKeys.js'
import useUserRead from './useUserRead'
import useUserStore from './useUserStore'
import useAssetStore from './useAssetStore'

export default function useCachedResources(){
  const [auth, setAuth] = React.useState('toLoad')
  const [userInfo,setUserInfo] = React.useState({})
  const [setUser] = useUserStore()
  const [user,readUser] = useUserRead('get')
  const [isNew,setIsNew] = React.useState(false)
  const [assets,err] = Asset.useAssets([require('../assets/splash.png'),require('../assets/adaptive-icon.png')])
  const [storedAssets,storeAssets] = useAssetStore()
  const [assetsLoaded,setLoaded] = React.useState(false)
  const [ready,setReady] = React.useState(false)

  React.useEffect(()=>{
    async function loadResourcesAndDataAsync(){
      try {
        SplashScreen.preventAutoHideAsync();
        firebase.initializeApp(apiKeys.firebase)
        firebase.auth().onAuthStateChanged((authUser)=>{
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
            setReady(true)
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
        setReady(true)
        return;
      }
      if(!isNew){
        let db = firebase.firestore()
        // db.settings({ experimentalForceLongPolling: true })
        let userRef = db.collection('users')
        userRef.doc(userInfo.uid).get()
            .then((doc)=>{
              console.log('trayendoo');
              let newInfo = userInfo;
              newInfo.description = doc.data().description
              setUserInfo(newInfo)
              setUser(userInfo)
            })
            .catch((e)=>{
              console.log('pepeta',e);
            })
      }
    }
  },[user,auth])

  React.useEffect(()=>{
    let i = 0
    let assetsOb = {}
    if(assets){
      assetsOb.splash = assets[0].localUri
      assetsOb.logo = assets[1].localUri
      storeAssets(assetsOb)
      setLoaded(true)
    }
  },[assets])

  React.useEffect(()=>{
    if(assetsLoaded&&ready){
      SplashScreen.hideAsync()
    }
  },[assetsLoaded,ready])

  return [auth]
}
