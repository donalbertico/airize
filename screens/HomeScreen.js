import * as React from 'react'
import { Audio } from 'expo-av'
import {styles} from './styles'
import * as firebase from 'firebase'
import 'firebase/firestore'
import * as Analytics from 'expo-firebase-analytics';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Image, Modal, SafeAreaView,
   ScrollView, ImageBackground} from 'react-native'
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
import SessionsListenerComponent from './components/sessionsListenerComponent'

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
  const [backgroundHome, setBackground] = React.useState()
  const [showCommands, setShowCommand] = React.useState(false)
  const scrollRef = React.useRef()

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
  },[])
  //user
  //wait for the user until is set because of fresh login
  React.useEffect(()=>{
    if(user == 'get' || user.destroyed){setUser('get')}
    if(user.uid) setNotificationService(true)
    if(user.picture)setPictureUrl(user.picture)
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
  //assets
  //check for assets
  React.useEffect(()=>{
    if(assets){
      setAvatar(assets.avatar)
      setIcons(assets.home)
      setBackground(assets.backgroundHome)
    }
  },[assets])
  // showComamnds
  // scroll View
  React.useEffect(() => {
    if(showCommands) scrollRef.current?.scrollTo({y: 200, animated : true})
  },[showCommands])

  return(
    <SafeAreaView style={styles.container}>
      <SessionsListenerComponent navigation={props.navigation}/>
      <View style={styles.header}>
        <View style={{flex:1}}>
        </View>
        <View style={{justifyContent : 'center'}}>
          <Text style={styles.h2_ligth}>Home</Text>
        </View>
        <View style={{flex:3}}></View>
      </View>
      <ImageBackground
        style={{width : '100%'}}
        source={{uri : backgroundHome}}>
        <View style={{alignItems : 'center'}}>
          <View style={{margin:15}}>
            <Image style={styles.bigRoundImage}
              source={{uri: profilePicture? profilePicture : avatarUri}}/>
          </View>
        </View>
      </ImageBackground>
      <View style={{flex:1,marginBottom : 10}}>
          <View style={styles.homeLigthBox}>
            <Text style={styles.h2}>{user?.firstName} {user?.lastName}</Text>
          </View>
      </View>
      <View style={{flex:6}}>
        <ScrollView ref={scrollRef}>
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
                  <Image style={{height : 22, width : 22}} source={{uri: icons?.plan}}/>
                </View>
                <View style={{flex:1}}></View>
                <View style={{flex:4}}>
                  <Text>Plan a workout</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.listItemContainer}
                onPress={() => {props.navigation.navigate('invitations')}}>
                <View>
                  <Image style={{height : 22, width : 27}} source={{uri: icons?.chat}}/>
                </View>
                <View style={{flex:1}}></View>
                <View style={{flex:4}}>
                  <Text>Send messages</Text>
                </View>
            </TouchableOpacity>
          </View>
          <View style={styles.separator}></View>
            <TouchableOpacity style={styles.listItemContainer}
                onPress={() => {setShowCommand(!showCommands)}}>
                <View>
                  <Ionicons size={28} name="mic" color='#343F4B'/>
                </View>
                <View style={{flex:1}}></View>
                <View style={{flex:4}}>
                  <Text>See voice commands</Text>
                </View>
            </TouchableOpacity>
            { showCommands && (
              <View style={{flex:1}}>
                  <View style={{marginTop : 25, marginBottom: 5, height : 800}}>
                    <Image style={{height: '80%' , width : '95%'}} source={{uri: icons?.infogram}}/>
                  </View>
              </View>
            )}
        </ScrollView>
      </View>
      <View>
        <NavBar navigation={props.navigation} route={0}/>
      </View>
    </SafeAreaView>
  )
}
