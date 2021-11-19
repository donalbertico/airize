import * as React from 'react';
import * as SplashScreen from 'expo-splash-screen'
import * as firebase from 'firebase'
import * as Asset from 'expo-asset'
import * as Font from 'expo-font'
import 'firebase/firestore'
import apiKeys from '../constants/apiKeys'
import useUserRead from './useUserRead'
import useUserStore from './useUserStore'
import useAssetStore from './useAssetStore'
import useKeyStore from './useKeyStore'

export default function useCachedResources(){
  const [auth, setAuth] = React.useState('toLoad')
  const [userInfo,setUserInfo] = React.useState({})
  const [setUser] = useUserStore()
  const [user,readUser] = useUserRead('get')
  const [isNew,setIsNew] = React.useState(false)
  const [assets,err] = Asset.useAssets([
    require('../assets/splash.png'),
    require('../assets/logo.png'),
    require('../assets/avatar.png'),
    require('../assets/homeSelected.png'),
    require('../assets/searchUnselected.png'),
    require('../assets/friendsUnselected.png'),
    require('../assets/linkUnselected.png'),
    require('../assets/propertiesUnselected.png'),
    require('../assets/googleLogo.png'),
    require('../assets/facebookLogo.png'),
    require('../assets/email.png'),
    require('../assets/password.png'),
    require('../assets/username.png'),
    require('../assets/friendsSelected.png'),
    require('../assets/linkSelected.png'),
    require('../assets/propertiesSelected.png'),
    require('../assets/searchSelected.png'),
    require('../assets/userImage.png'),
    require('../assets/feedback.png'),
    require('../assets/passwordDark.png'),
    require('../assets/shareDark.png'),
    require('../assets/planDark.png'),
    require('../assets/spotifyDark.png'),
    require('../assets/homeUnselected.png'),
    require('../assets/backwards.png'),
    require('../assets/play.png'),
    require('../assets/forwards.png'),
    require('../assets/pause.png'),
    require('../assets/infogram.png'),
  ])
  const [storedAssets,storeAssets] = useAssetStore()
  const [assetsLoaded,setLoaded] = React.useState(false)
  const [userReady,setUserReady] = React.useState(false)
  const [ready,setReady] = React.useState(false)
  const [fontReady,setFontReady] = React.useState(false)
  const [keys,storeKeys] = useKeyStore()

  React.useEffect(()=>{
    SplashScreen.preventAutoHideAsync();
    async function loadResourcesAndDataAsync(){
      await Font.loadAsync({
        'ubuntu' : require('../assets/Ubuntu-R.ttf')
      }).then(() => {
        setFontReady(true)
      })
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
            setUserReady(true)
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
    loadResourcesAndDataAsync();
  }, []);
  React.useEffect(() => {
    if(auth==true && user!='get'){
      if(user.uid){
        setUserReady(true)
        return;
      }
      if(!isNew){
        let db = firebase.firestore()
        let userRef = db.collection('users')
        userRef.doc(userInfo.uid).get()
            .then((doc)=>{
              let newInfo = userInfo;
              let docData = doc.data()
              newInfo.description = docData.description
              newInfo.firstName = docData.firstName
              newInfo.lastName = docData.lastName
              newInfo.email = docData.email
              newInfo.picture = docData.picture
              newInfo.provider = docData.provider
              setUser(newInfo)
              setUserReady(true)
            })
            .catch((e)=>{
              console.log('pepeta',e);
            })
      }
    }
  },[user,auth])
  React.useEffect(() => {
    let i = 0
    let assetsOb = {}
    if(assets){
      assetsOb.splash = assets[0].localUri
      assetsOb.logo = assets[1].localUri
      assetsOb.avatar= assets[2].localUri
      assetsOb.menu = {
        home: assets[23].localUri,
        search: assets[4].localUri,
        friends: assets[5].localUri,
        link: assets[6].localUri,
        set: assets[7].localUri,
        homeSe : assets[3].localUri,
        friendSe: assets[13].localUri,
        searchSe: assets[16].localUri,
        linkSe: assets[14].localUri,
        setSe: assets[15].localUri
      }
      assetsOb.google= assets[8].localUri
      assetsOb.facebook= assets[9].localUri
      assetsOb.login = {
        email : assets[10].localUri,
        password: assets[11].localUri,
        username: assets[12].localUri
      }
      assetsOb.preferences = {
        profile : assets[17].localUri,
        feedback : assets[18].localUri,
        password : assets[19].localUri
      }
      assetsOb.home = {
        search : assets[20].localUri,
        friends : assets[21].localUri,
        spotify : assets[22].localUri,
        infogram : assets[28].localUri
      }
      assetsOb.music = {
        previous : assets[24].localUri,
        play : assets[25].localUri,
        next : assets[26].localUri,
        pause : assets[27].localUri
      }
      storeAssets(assetsOb)
      setLoaded(true)
    }
  },[assets])
  React.useEffect(() => {
    if(assetsLoaded && userReady && fontReady){
      SplashScreen.hideAsync()
      setReady(true)
    }
  },[assetsLoaded,userReady,fontReady])

  return [auth, ready]
}
