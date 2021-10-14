import * as React from 'react';
import * as SplashScreen from 'expo-splash-screen'
import * as firebase from 'firebase'
import * as Asset from 'expo-asset'
import 'firebase/firestore'
import apiKeys from '../constants/apiKeys'
import useUserRead from './useUserRead'
import useUserStore from './useUserStore'
import useAssetStore from './useAssetStore'
import useKeyStore from './useKeyStore'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function useCachedResources(){
  const [auth, setAuth] = React.useState('toLoad')
  const [userInfo,setUserInfo] = React.useState({})
  const [setUser] = useUserStore()
  const [user,readUser] = useUserRead('get')
  const [isNew,setIsNew] = React.useState(false)
  const [assets,err] = Asset.useAssets([
    require('../assets/splash.png'),
    require('../assets/adaptive-icon.png'),
    require('../assets/avatar.png'),
    require('../assets/homeSelected.png'),
    require('../assets/searchUnselected.png'),
    require('../assets/friendsUnselected.png'),
    require('../assets/linkUnselected.png'),
    require('../assets/propertiesUnselected.png')
  ])
  const [storedAssets,storeAssets] = useAssetStore()
  const [assetsLoaded,setLoaded] = React.useState(false)
  const [ready,setReady] = React.useState(false)
  const [keys,storeKeys] = useKeyStore()

  React.useEffect(()=>{
    async function loadResourcesAndDataAsync(){
      SplashScreen.preventAutoHideAsync();
      try {
        firebase.initializeApp(apiKeys.firebase)
        let db = firebase.firestore()
        db.settings({ experimentalForceLongPolling: true })
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
            getKeys()
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
    async function getKeys(){
      const uri = await firebase.storage().ref('scr/spotify.json').getDownloadURL()
      let rs = await fetch(uri)
      let json = await rs.json()
      storeKeys({spotify:json.id})
    }

    async function removeSt(){
      try {
        await AsyncStorage.removeItem('spotifyToken')
      } catch (e) {

      }
    }
    // removeSt()

    loadResourcesAndDataAsync();
  }, []);
  React.useEffect(()=>{
    if(auth==true&&user!='get'){
      if(user.uid){
        setReady(true)
        return;
      }
      if(!isNew){
        console.log('not new');
        let db = firebase.firestore()
        let userRef = db.collection('users')
        userRef.doc(userInfo.uid).get()
            .then((doc)=>{
              console.log('trayendoo');
              let newInfo = userInfo;
              newInfo.description = doc.data().description
              setUserInfo(newInfo)
              setUser(userInfo)
              setReady(true)
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
      assetsOb.avatar= assets[2].localUri
      assetsOb.menu = {
        home: assets[3].localUri,
        search: assets[4].localUri,
        friends: assets[5].localUri,
        link: assets[6].localUri,
        set: assets[7].localUri
      }
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
