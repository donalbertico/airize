import * as React from 'react'
import { Audio } from 'expo-av'
import {styles} from './styles'
import * as firebase from 'firebase'
import 'firebase/firestore'
import * as Analytics from 'expo-firebase-analytics';
import * as Notifications from 'expo-notifications';
import { View, TouchableOpacity, Image, Modal, SafeAreaView, ScrollView} from 'react-native'
import { Text, Button } from 'react-native-elements'
import Voice from '@react-native-voice/voice'
import Toast from 'react-native-toast-message'
import SpotifyWebApi from 'spotify-web-api-js'
import useUserRead from '../hooks/useUserRead'
import useSpotifyAuth from '../hooks/useSpotifyAuth'
import useProfilePicture from '../hooks/useProfilePicture'
import useSpotifyTokenStore from '../hooks/useSpotifyTokenStore'
import useSpotifyTokenRefresh from '../hooks/useSpotifyTokenRefresh'
import useAssetStore from '../hooks/useAssetStore'
import useAppState from '../hooks/useAppState'
import useNotifications from '../hooks/useNotifications'
import NavBar from './components/bottomNavComponent'
import SessionList from './components/sessionListComponent'

export default function HomeScreen(props){
  const [refreshErr,refreshedTokens,setRefresh] = useSpotifyTokenRefresh(false)
  const [user,setUser] = useUserRead('get')
  const [newTokens,authErr,askToken] = useSpotifyAuth(false)
  const [storedToken,setStoredToken] = useSpotifyTokenStore()
  const [assets,setAssets] = useAssetStore()
  const [nextState] = useAppState()
  const [notification, setNotification, setNotificationService] = useNotifications()
  const [profilePicture,setPictureUrl] = useProfilePicture()
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
  const [playlist,setPlaylist] = React.useState()
  const [icons,setIcons] = React.useState()
  const [listTracks,setLreactistTracks] = React.useState()
  const [audioPermit,setAudioPermit] = React.useState()
  const [notified, setNotified] = React.useState(false)
  const [news, setNews] = React.useState(0)
  const [lastNews, setLastNews] = React.useState()
  const [fromNotification, setFromNotification] = React.useState(false)
  const [firstLoad, setFirstLoad] = React.useState(true)
  const responseListener = React.useRef()
  const [checkingSession, setCheckingSession] = React.useState()

  const startSession = () => {
    sessionsReference.doc(latentSession.id)
      .update({status : 's'})
  }
  const deleySession = () => {
    sessionsReference.doc(latentSession.id)
      .update({status : 'a'})
  }
  const setNewReferenceListener = () => {
    let start = new Date()
    let end = new Date()
    start.setUTCHours(0,0,0,0)
    end.setUTCHours(23,59,59,999)
    // .where('dueDate' ,'>=', start)
    // .where('dueDate' ,'<', end)
    // console.log('listening?',sessionsReference?.where);
    if(sessionsReference?.where)
      return sessionsReference
        .where('users', 'array-contains', user.uid)
        .where('status', 'in', ['c','r','s','p','ap','al','a'])
        .onSnapshot((snapshot) => {
          let sessArray = []
          snapshot.forEach((sess, i) => {
            let session = sess.data()
            let sessDate = new firebase.firestore.Timestamp(session.dueDate.seconds,session.dueDate.nanoseconds)
            sessDate = sessDate.toDate()
            session.id = sess.id
            session.dueDate = `${sessDate.getHours()} : ${sessDate.getMinutes()}`
            if(session.status == 'c') sessArray = [...sessArray,session]
            if(session.status == 'r')  {
              if(session.host == user.uid) setIsHost(true)
              setSessStarting(true)
              setNotified(false)
              setLatentSession(session)
            }
            setCheckingSession(session)
          });
          setSessions(sessArray)
        })
  }
  //on mount
  React.useEffect(()=>{
    let db = firebase.firestore()
    let that = this
    async function askPermissions(){
      try {
        const audioPermission = await Audio.requestPermissionsAsync();
        if(audioPermission?.granted){
          setAudioPermit(true)
          Voice.onSpeechResults = () => {}
          Voice.onSpeechVolumeResults = () => {}
          Voice.start()
          setTimeout(() => {
            Voice.stop()
            Voice.destroy()
          },150)
        }
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
    Analytics.setCurrentScreen('home');
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      setFromNotification(true)
    })
    return () => {
      if(sessionsReference && that) {
        that.sessionListener = null
        setTimeout(() => {
          that.sessionListener = setNewReferenceListener()
        },200)
      }
    }
  },[])
  //.route
  //lookf for user because it has been updated
  React.useEffect(()=>{
    let that = this;
    if(props.route.params?.userUpdate)setUser('get')
    if(props.route.params?.refresh) {
      if(!that?.sessionListener){
        that.sessionListener = setNewReferenceListener()
      }
    }
    if(props.route.name != 'home'){
      if(sessionsReference) {
        this.sessionListener = null
        setTimeout(() => {
          that.sessionListener = setNewReferenceListener()
        },200)
      }
    }
  },[props.route.params,sessionsReference])
  //.route
  //look if page changed to restart sessions listener
  React.useEffect(()=>{
    let that = this;
    if(props.route.name != 'home'){
      if(sessionsReference) {
        this.sessionListener = null
        setTimeout(() => {
          that.sessionListener = setNewReferenceListener()
        },200)
      }
    }
  },[props.route.name])
  //user
  //wait for the user until is set because of fresh login
  React.useEffect(()=>{
    if(user == 'get' || user.destroyed){setUser('get')}
    if(user.uid) setNotificationService(true)
  },[user])
  //spotify authorization
  //check if auth is true
  React.useEffect(()=>{
    if(newTokens){
      setStoredToken(newTokens)
      setSearchDevices(true)
      Analytics.logEvent('spotify_auth', {
        user: user.uid,
        screen: 'home',
        purpose: 'authorizing spotify',
      });
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
      if(storedToken?.expires <= new Date().getTime()){
        setRefresh(true)
      }else{
        setSpotifyToken(storedToken?.access)
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
    const client = new SpotifyWebApi()
    async function getDevices(){
      try {
        const result = await client.getMyDevices()
        if(result){
          let devices = result.devices
          if(devices?.length == 0) setDevice()
          devices.forEach((device, i) => {
            console.log(device);
            if(device.type == "Smartphone") setDevice(device.id)
          });
        }
      } catch (e) {
        Toast.show({text1:'Not able to connect to Spotify',
          type : 'error', position : 'bottom', visibilityTime: 4000})
      }
    }
    async function getPlayLists(){
      try {
        const result = await client.getUserPlaylists()
        if(result){
          result.items?.forEach((playlist, i) => {
            if(playlist.name.toLowerCase() == 'airize') setPlaylist(playlist.uri)
          });
        }
      } catch (e) {
        Toast.show({text1:'Not able to connect to Spotify',
          type : 'error', position : 'bottom', visibilityTime: 4000})
      }
    }
    if(spotifyToken&&spotifyToken!='refresh'){
      client.setAccessToken(spotifyToken)
      getDevices()
      getPlayLists()
    }
  },[spotifyToken])
  //assets
  //check for assets
  React.useEffect(()=>{
    if(assets){
      setAvatar(assets.avatar)
      setIcons(assets.home)
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
      if(!that?.sessionListener){
        that.sessionListener = setNewReferenceListener()
      }
    }
    if(user.picture)setPictureUrl(user.picture)
  },[user,sessionsReference])
  // nextState
  // refreshe some states when app in nextState
  React.useEffect(() => {
    let that = this;
    if(props.route.name == 'home'){
      if(nextState == 'active'){
        console.log('shearch?');
        setSearchDevices(true)
        setSpotifyToken('refresh')
        if(!that?.sessionListener){
          that.sessionListener = setNewReferenceListener()
        }
      }else if(nextState == 'background'){
        if(that?.sessionListener){
          setNotified(false)
          that.sessionListener = null
          that.sessionListener = setNewReferenceListener()
        }
      }
    }
  },[nextState])
  // checkingSession
  // redirect to session if latent status 'started'
  React.useEffect(() => {
    if(checkingSession){
      if(checkingSession.status != 'f' && checkingSession.status != 'r'
          && checkingSession.status != 'a' &&  checkingSession.status != 'c'
          &&  checkingSession.status != 'd'){
        setFromNotification(false)
        setSessStarting(false)
        props.navigation.navigate('session',{ session : checkingSession, playlist: playlist})
      }
      if(news != lastNews){
        if(checkingSession.status == 'c' && checkingSession.host != user.uid) {
          setNotification({title : 'invited'})
        }
        if(news > 0) setLastNews(news)
      }
      if(!fromNotification){
        if(checkingSession.status == 'r' && checkingSession.host != user.uid)
          setNotification({title : 'starting'})
      }
      if(checkingSession.status == 'a') {
        if(latentSession?.id == checkingSession.id) {
          setLatentSession()
          setSessStarting(false)
          if(checkingSession.host == user.uid) Toast.show({text1:'Partner not ready',
                  text2: 'go to events and start again later',
                  type : 'info', position : 'bottom', visibilityTime: 4000})
        }
      }
    }
  },[checkingSession])
  //sessions
  //set news for notification control
  React.useEffect(() => {
    if(sessions) {
      setNews(sessions.length)
      if(firstLoad)  {
        setLastNews(sessions.length)
        setFirstLoad(false)
      }
    }
  },[sessions])

  return(
    <SafeAreaView style={styles.container}>
      <Modal transparent={true} visible={sessStarting}>
        <View style={styles.alignCentered}>
          <View style={styles.modalView}>
            {isHost? (
              <View>
                <Text>
                  Waiting for your partner to start
                </Text>
                <View></View>
              </View>
            ): (
              <View>
                <View style={{marginBottom:20}}>
                  <Text>
                    Your friend is ready to start
                  </Text>
                </View>
                <View style={styles.horizontalView}>
                  <View>
                    <Button type='clear'
                      titleStyle= {styles.secondaryButton}
                      title='Not yet' onPress={() => deleySession()}/>
                  </View>
                    <View style={{width : 30}}></View>
                  <View>
                    <Button type='clear' title='Start' onPress={() => startSession()}/>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
      <View style={styles.mainHeader}>
        <View style={styles.horizontalView}>
          <View stlye={{flex:2}}>
            <View style={{margin:10}}>
              <Image style={styles.roundImage}
                source={{uri: profilePicture? profilePicture : avatarUri}}/>
            </View>
          </View>
          <View style={{flex:5}}>
            <View style={{flex:1}}></View>
            <View style={{flex:1}}>
              <View style={styles.homeLigthBox}>
                <Text style={styles.h2}>{user?.firstName} {user?.lastName}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      <View style={{flex:8}}>
        <View >
          <TouchableOpacity style={styles.listItemContainer}
            onPress={() => {props.navigation.navigate('friends')}}>
              <View>
                <Image style={styles.largeInputIcon} source={{uri: icons?.search}}/>
              </View>
              <View style={{flex:1}}></View>
              <View style={{flex:4}}>
                <Text>Invite a friend</Text>
              </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItemContainer}
              onPress={() => {props.navigation.navigate('invitations')}}>
              <View>
                <Image style={styles.largeInputIcon} source={{uri: icons?.friends}}/>
              </View>
              <View style={{flex:1}}></View>
              <View style={{flex:4}}>
                <Text>Plan a workout</Text>
              </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listItemContainer}
              onPress={() => {props.navigation.navigate('invitations')}}>
              <View>
                <Image style={styles.largeInputIcon} source={{uri: icons?.friends}}/>
              </View>
              <View style={{flex:1}}></View>
              <View style={{flex:4}}>
                <Text>Send messages</Text>
              </View>
          </TouchableOpacity>
        </View>
        <View style={styles.separator}>
          <Text style={styles.subtext}>Voice commands</Text>
        </View>
        <View style={{flex:1}}>
          <ScrollView >
            <Image style={{height: 710 , width : '100%'}} source={{uri: icons?.infogram}}/>
          </ScrollView>
        </View>
      </View>
      <View>
        <NavBar navigation={props.navigation} route={0}/>
      </View>
    </SafeAreaView>
  )
}
