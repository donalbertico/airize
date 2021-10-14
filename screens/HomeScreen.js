import * as React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Audio } from 'expo-av'
import {styles} from './styles'
import { Text, Button } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import SpotifyWebApi from 'spotify-web-api-js'
import useUserRead from '../hooks/useUserRead'
import useSpotifyAuth from '../hooks/useSpotifyAuth'
import useSpotifyTokenStore from '../hooks/useSpotifyTokenStore'
import useSpotifyTokenRefresh from '../hooks/useSpotifyTokenRefresh'
import useSpotifyPlayStore from '../hooks/useSpotifyPlayStore'
import Logout from './auth/components/logoutComponent'


export default function HomeScreen(props){
  const [refreshErr,refreshedTokens,setRefresh] = useSpotifyTokenRefresh(false)
  const [user,setUser] = useUserRead('get')
  const [newTokens,authErr,askToken] = useSpotifyAuth(false)
  const [storedToken,setStoredToken] = useSpotifyTokenStore()
  const [playInfo,setPlayInfo] = useSpotifyPlayStore()
  const [spotifyAv, setSpotifyAv] = React.useState(false)
  const [audioGranted,setAudioGranted] = React.useState()
  const [spotifyToken,setSpotifyToken] = React.useState()
  const [deviceAvalible,setDeviceAvalible] = React.useState()
  const [searchDevices,setSearchDevices] = React.useState(false)
  //on mount
  React.useEffect(()=>{
    async function askPermissions(){
      try {
        console.log('Requesting permissions..');
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
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
  //audio Permissions
  //ask if false
  React.useEffect(()=>{
    async function askPermission(){setRefresh
      const {status} = await Permissions.askAsync(Permissions.AUDIO_RECORDING)
      if(status=="granted"){setAudioGranted(true)}
    }
    if(audioGranted == false)askPermission()
  },[audioGranted])
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
          console.log(devices);
          devices.forEach((device, i) => {
            if(device.type == "Smartphone"){
              setDeviceAvalible(true)
              setPlayInfo({device:device.id})
            }
          });
        }
      } catch (e) {
        console.log(e);
      }
    }
    if(spotifyToken&&spotifyToken!='refresh')getDevices()
  },[spotifyToken])

  askforToken = ()=> {
    askToken(true)
  }

  return(
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.horizontalView}>
          <Ionicons name="md-menu" size={32} color='white' onPress={()=>props.navigation.navigate('edit')}/>
          <View style={{flex:5}}></View>
        </View>
      </View>
      <View style={{flex:10}}>
        <View style={styles.centeredBox,styles.alignCentered}>
          <TouchableOpacity onPress={()=>props.navigation.navigate('login')}>
            <Text>Wellcome</Text>
            {user? (
              <Text>{user.displayName}</Text>
            ):(
              <Text></Text>
            )}
          </TouchableOpacity>
        </View>
        <View style={{flex:1}}></View>
        <View style={styles.horizontalView}>
          <View style={{flex:2}}></View>
          <View style={{flex:4}}>
            <Button title='Start Session' onPress={()=>props.navigation.navigate('session')}/>
          </View>
          <View style={{flex:2}}></View>
        </View>
        <View style={{flex:1}}></View>
        <View style={{flex:1}}>
          <View style={styles.horizontalView}>
            <View style={{flex:1}}></View>
            <View style={{flex:2}}>
              {spotifyAv?
                (deviceAvalible? (<View></View>)
                  :(
                    <TouchableOpacity onPress={()=>{setSearchDevices(true);setSpotifyToken('refresh')}}>
                      <Text>Please make sure spotify app is open to listen</Text>
                      <Text>Touch here if it is</Text>
                    </TouchableOpacity>)
                  )
              :(
                <TouchableOpacity onPress={askforToken}>
                  <Text>Connect with Spotify to share music while working out</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
      <View style={{flex:1}}>
        <View style={styles.darkBackground}>
          <View style={styles.horizontalView}>
            <Logout/>
            <View style={{flex:1}}></View>
            <Ionicons name="md-menu" size={32} color='white' onPress={()=>props.navigation.navigate('edit')}/>
            <View style={{flex:1}}></View>
            <Ionicons name="logo-ionic" size={32} color='white' onPress={()=>props.navigation.navigate('session')}/>
            <View style={{flex:1}}></View>
          </View>
        </View>
      </View>
    </View>
  )
}
