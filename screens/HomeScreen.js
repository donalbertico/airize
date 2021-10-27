import * as React from 'react'
import { Audio } from 'expo-av'
import {styles} from './styles'
import * as firebase from 'firebase'
import 'firebase/firestore'
import { View, TouchableOpacity, Image, Modal } from 'react-native'
import { Text, Button } from 'react-native-elements'
import Voice from '@react-native-voice/voice'
import SpotifyWebApi from 'spotify-web-api-js'
import useUserRead from '../hooks/useUserRead'
import useSpotifyAuth from '../hooks/useSpotifyAuth'
import useSpotifyTokenStore from '../hooks/useSpotifyTokenStore'
import useSpotifyTokenRefresh from '../hooks/useSpotifyTokenRefresh'
import useAssetStore from '../hooks/useAssetStore'
import Logout from './auth/components/logoutComponent'
import NavBar from './components/bottomNavComponent'
import SessionList from './components/sessionListComponent'

export default function HomeScreen(props){
  const [refreshErr,refreshedTokens,setRefresh] = useSpotifyTokenRefresh(false)
  const [user,setUser] = useUserRead('get')
  const [newTokens,authErr,askToken] = useSpotifyAuth(false)
  const [storedToken,setStoredToken] = useSpotifyTokenStore()
  const [assets,setAssets] = useAssetStore()
  const [playbackDevice,setDevice] = React.useState()
  const [spotifyAv, setSpotifyAv] = React.useState(false)
  const [audioGranted,setAudioGranted] = React.useState()
  const [spotifyToken,setSpotifyToken] = React.useState()
  const [searchDevices,setSearchDevices] = React.useState(false)
  const [avatarUri,setAvatar] = React.useState()
  const [sessionsReference,setSessionsReference] = React.useState()
  const [sessions,setSessions] = React.useState()
  const [isHost,setIsHost] = React.useState(false)
  const [sessStarting,setSessStarting] = React.useState(false)
  const [latentSession,setLatentSession] = React.useState()

  const getSessionReady = (session) => {
    setSessStarting(true)
    if(session.host == user.uid){
      setIsHost(true)
      sessionsReference.doc(session.id)
        .update({
          status : 'r'
        })
    }
  }
  const startSession = () => {
    sessionsReference.doc(latentSession.id)
      .update({status : 's'})
  }
  //on mount
  React.useEffect(()=>{
    let db = firebase.firestore()
    async function askPermissions(){
      try {
        console.log('Requesting permissions..');
        Voice.start()
        await Audio.requestPermissionsAsync();
        Voice.stop()
        Voice.destroy()
      } catch (err) {
        console.error('Failed to start recording', err);
      }
    }
    async function checkPermissions(){
      const {status} = await Audio.getPermissionsAsync()
      if(status == 'granted'){setAudioGranted(true)}
      else{
        setAudioGranted(false)
        askPermissions()
      }
    }
    checkPermissions()
    setSessionsReference(db.collection('sessions'))
  },[])
  //.route
  //lookf for user because it has been updated
  React.useEffect(()=>{
    if(props.route.params?.userUpdate)setUser('get')
  },[props.route.params])
  //user
  //wait for the user until is set because of fresh login
  React.useEffect(()=>{
    if(user == 'get' || user.destroyed){setUser('get')}
  },[user])
  //spotify authorization
  //check if auth is true
  React.useEffect(()=>{
    if(newTokens){
      setStoredToken(newTokens)
      setSearchDevices(true)
    }
  },[newTokens])
  //StoredToken
  //Sets spotifyAv if stored token
  React.useEffect(()=>{
    if(storedToken){
      setSpotifyAv(true)
      setSearchDevices(true)
    }
  },[storedToken])
  //authErr, refresh error
  //warns if any error when auth or refreshing
  React.useEffect(()=>{
    if(authErr) console.warn(authErr);
  },[authErr])
  //searchDevices
  //check if token is expried and sets access token setSpotifyToken
  React.useEffect(()=>{
    if(searchDevices){
      if(storedToken.expires <= new Date().getTime()){
        setRefresh(true)
      }else{
        setSpotifyToken(storedToken.access)
        setSearchDevices(false)
      }
    }
  },[searchDevices])
  //refreshedTokens
  //set spotify access token with refreshed
  React.useEffect(()=>{
    if(refreshedTokens){
      setSpotifyToken(refreshedTokens.access)
      setSearchDevices(false)
      setStoredToken(refreshedTokens)
    }
  },[refreshedTokens])
  //searchDevices
  //looks for spotify devices and the avalible
  React.useEffect(()=>{
    async function getDevices(){
      const client = new SpotifyWebApi()
      client.setAccessToken(spotifyToken)
      try {
        const result = await client.getMyDevices()
        if(result){
          let devices = result.devices
          if(devices?.length == 0) {
            setDevice()
          }
          devices.forEach((device, i) => {
            console.log(device);
            if(device.type == "Smartphone"){
              setDevice(device.id)
            }
          });
        }
      } catch (e) {
        console.log('EEROR spotify devices',e);
      }
    }
    if(spotifyToken&&spotifyToken!='refresh')getDevices()
  },[spotifyToken])
  //assets
  //check for assets
  React.useEffect(()=>{
    if(assets){
      setAvatar(assets.avatar)
    }
  },[assets])
  //useruid and sessions reference
  //set Sessions listener
  React.useEffect(() => {
    let that = this;
    if(!that) return ()=>{};
    let start = new Date()
    let end = new Date()
    start.setUTCHours(0,0,0,0)
    end.setUTCHours(23,59,59,999)
    if(user.uid && sessionsReference) {
      if(!that.sessionListener){
        that.sessionListener =
          sessionsReference
            .where('users', 'array-contains', user.uid)
            .where('dueDate' ,'>=', start)
            .where('dueDate' ,'<', end)
            .onSnapshot((snapshot) => {
              let sessArray = []
              snapshot.forEach((sess, i) => {
                let session = sess.data()
                let sessDate = new Date(session.dueDate.seconds)
                session.id = sess.id
                session.dueDate = `${sessDate.getHours()} : ${sessDate.getMinutes()}`
                sessArray = [...sessArray,session]
                if(session.status == 'r') {
                  setSessStarting(true)
                  setLatentSession(session)
                  return;
                }
                if(session.status == 's') {
                  props.navigation.navigate('session',{ session : session, host: isHost})
                  setSessStarting(false)
                  return;
                }
              });
              setSessions(sessArray)
            })
      }
    }
    return () => {
      if(that.sessionListener) that.sessionListener()
    }
  },[user,sessionsReference])


  return(
    <View style={styles.container}>
      <Modal transparent={true} visible={sessStarting}>
        <View style={styles.alignCentered}>
          <View style={styles.modalView}>
            {isHost? (
              <View>
                <Text h4>
                  Waiting for your partner to start
                </Text>
                <View></View>
              </View>
            ): (
              <View>
                <Text >
                  User is asking to start
                </Text>
                <View></View>
                <View>
                  <Button style={styles.buttonOpen} title='Start Session' buttonStyle={{borderRadius:100, height:110}}
                    titleStyle={{fontSize:20}} onPress={() => startSession()}/>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <View style={styles.header}>
        <View style={styles.horizontalView}>
          <View stlye={{flex:2}}>
            <View style={{margin:10}}>
              <Image style={styles.roundImage} source={{uri:avatarUri}}/>
            </View>
          </View>
          <View style={{flex:5}}>
            <View style={{flex:1}}></View>
            <View style={{flex:1}}>
              <View style={styles.homeLigthBox}>
                {user? (
                  <Text h3>{user.firstName} {user.lastName}</Text>
                ):(
                  <Text></Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
      <View style={{flex:12}}>
        <View style={styles.horizontalView}>
          <View style={{flex:1}}></View>
          <View style={{flex:5}}>
            <View style={{margin: 20}}>
              <Text>Today's Sessions :</Text>
            </View>
            <SessionList sessions={sessions} handleSessionSelected={getSessionReady}/>
          </View>
          <View style={{flex:1}}></View>
        </View>
        <View style={{flex:1}}></View>
        <View style={{flex:1}}>
          <View style={styles.horizontalView}>
            <View style={{flex:1}}></View>
            <View style={{flex:2}}>
              {spotifyAv?
                (playbackDevice? (<View></View>)
                  :(
                    <TouchableOpacity onPress={() => {setSearchDevices(true); setSpotifyToken('refresh')}}>
                      <Text>Please make sure spotify app is open to listen</Text>
                      <Text>Touch here if it is =)</Text>
                    </TouchableOpacity>)
                  )
                  :(
                  <TouchableOpacity onPress={()=>askToken(true)}>
                    <Text>Connect with Spotify to share music while working out</Text>
                  </TouchableOpacity>
                )}
            </View>
          </View>
        </View>
      </View>
      <View style={{flex:2}}>
        <NavBar navigation={props.navigation}/>
      </View>
    </View>
  )
}
