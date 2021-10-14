import * as React from 'react'
import * as firebase from 'firebase'
import { Audio } from 'expo-av'
import 'firebase/firestore'
import Voice from '@react-native-voice/voice'
import SpotifyWebApi from 'spotify-web-api-js'
import {View,TouchableOpacity,Modal,ActivityIndicator} from 'react-native'
import {Text} from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import {styles} from '../styles'
import Timer from './components/timerComponent'
import useUserRead from '../../hooks/useUserRead'
import useSpotifyTokenRefresh from '../../hooks/useSpotifyTokenRefresh'
import useSpotifyTokenStore from '../../hooks/useSpotifyTokenStore'
import useSpotifyPlayStore from '../../hooks/useSpotifyPlayStore'

export default function SessionScreen(props){
  const [user] = useUserRead('get')
  const [refreshErr,refreshedTokens,setRefresh] = useSpotifyTokenRefresh(false)
  const [storedToken] = useSpotifyTokenStore()
  const [playInfo,setPlayInfo] = useSpotifyPlayStore()
  const [isRecording,setIsRecording] = React.useState(false)
  const [pause,setPause] = React.useState(true)
  const [listening,setListening] = React.useState(false)
  const [status,setStatus] = React.useState('w') //[w:work,r:record,s:stopping,p:playing]
  const [recordTime,setRecordTime] = React.useState(0)
  const [showModal,setModal] = React.useState(false)
  const [time,setWorkoutTime] = React.useState()
  const [recording,setRecording] = React.useState()
  const [isReproducing,setIsReproducing] = React.useState(false)
  const [message,setMessage] = React.useState()
  const [messageDuration,setMessageDuration] = React.useState(0)
  const [isSending,setSending] = React.useState(false)
  const sessId = '3npzsgvRcjqObSfJ8UJD'
  const [sessRef,setRf] = React.useState()
  const [recordUri,setRecordUri] = React.useState()
  const [storeMessageName,setMessageName] = React.useState()
  const [tokenExpired,setTokenExpired] = React.useState(true)
  const [spotifyAv,setSpotifyAv] = React.useState(false)
  const [spotifyCall,setSpotifyCall] = React.useState()
  const [spotifyToken,setSpotifyToken] = React.useState()
  const [currentUri,setCurrentRui] = React.useState()

  const workSpeechResultsHandler = (results) =>{
    let options = results.value
    if(options){
        for(var i in options){
          if(options[i]=='stop'){
            setListening(false)
            Voice.destroy()
            setStatus('s')
            setPause(true)
            setModal(true)
            setListening(true)
            setPause(false)
          }else if(options[i]=='record'||options[i]=='send message'){
            setListening(false)
            Voice.destroy()
            setStatus('r')
            setIsRecording(true)
            setRecordTime(1)
          }else if(options[i]=='play'||options[i]=='play music'){
            setSpotifyCall('play')
          }
        }
      }
  }
  const confirmationSpeechResultHandler = (results)=>{
    let options = results.value
    if(options){
      for(var i in options){
        if(options[i]=='stop'||options[i]=='yes'){
          setListening(false)
          Voice.destroy()
          setStatus('f')
          setPause(true)
        }else if(options[i]=='no'||options[i]=='continue'){
          setListening(false)
          Voice.destroy()
          setStatus('w')
          setPause(true)
          setModal(false)
          setListening(true)
          setPause(false)
        }
      }
    }
  }
  const checkTokenExpired = ()=> {
    let yesterday = new Date()
    if(!storedToken)return;
    console.log(storedToken.expires);
    yesterday.setDate(yesterday.getDate()+1)
    if(storedToken.expires <= new Date().getTime()){
      console.log('ya nouay');
      setRefresh(true)
    }else{
      setSpotifyToken(storedToken.access)
    }
  }
  //onMount hook
  React.useEffect(()=>{
    props.navigation.addListener('beforeRemove',(e)=>{
      e.preventDefault()
    })
    let db = firebase.firestore();
    setRf(db.collection('sessions').doc(sessId).collection('messages'))
    setPause(false)
    setListening(true)
  },[])
  //status
  //changes speech handlers
  React.useEffect(()=>{
    switch (status) {
      case 'w':
        Voice.onSpeechResults = workSpeechResultsHandler
        break;
      case 's':
        Voice.onSpeechResults = confirmationSpeechResultHandler
        break;
      case 'f':
        props.navigation.addListener('beforeRemove',(e)=>{
          props.navigation.dispatch(e.data.action)
        })
        let db = firebase.firestore()
        let reference = db.collection('sessions')
        reference.add({users:[user.uid,'asdf'],status:'f',time:time})
          .then((doc)=>{
            setPause(true)
            setModal(false)
            props.navigation.navigate('home')
          })
          .catch((e)=>{console.log(e);})
        break;
    }
  },[status])
  //listening
  //starts voice function to listen each 4 seconds
  React.useEffect(()=>{
    let that = this;
    if(listening){
      if(status=='s'){
        Voice.start('en-UK')
      }
      that.interval = setInterval(()=>{
        Voice.start('en-UK')
      },4000)
    }else{
      clearInterval(that.interval)
    }
  },[listening])
  //recordTime
  //handle record command for (S) seconds
  React.useEffect(()=>{
    let that = this
    async function record(){
      try{
        const {recording} = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY)
        setRecording(recording)
        console.log('reacording');
      }catch(e){
        console.log('ERROR recording',e);
      }
    }
    async function stopRecord(){
        await recording.stopAndUnloadAsync()
        const uri = recording.getURI()
        setRecording(undefined)
        setRecordUri(uri)
    }
    if(recordTime == 1){
      record()
      that.interval = setInterval(()=>{
        setRecordTime(recordTime => recordTime+1)
      },1000)
    }
    if(recordTime == 6){
      clearInterval(that.interval)
      stopRecord()
      setRecordTime(recordTime => 0)
      setIsRecording(false)
    }
  },[recordTime])
  //recordUri
  //uploads recoreded audio
  React.useEffect(()=>{
    async function upload(){
      setSending(true)
      try {
        const blob= await new Promise((resolve,reject)=>{
          const xhr = new XMLHttpRequest()
          xhr.onload = () => {
            resolve(xhr.response)
          }
          xhr.onerror = (e)=>{
            console.log('EEROR',e);
          }
          xhr.responseType = 'blob';
          xhr.open('GET',recordUri,true)
          xhr.send(null)
        })
        if(blob!=null){
          const uriParts = recordUri.split(".");
          const fileType = uriParts[uriParts.length - 1];
          sessRef.add({user:user.uid}).then((doc)=>{
            setMessageName(`${doc.id}.${fileType}`)
            firebase
              .storage()
              .ref()
              .child(`${doc.id}.${fileType}`)
              .put(blob,{
                contentType:`audio/${fileType}`
              })
              .then(()=>{
                setSending(false)
              })
              .catch((e)=>{
                console.log('error',e);
              })
          })
          .catch((e)=>{console.log(e)})
        }
      } catch (e) {
        console.log(e,'errors');
      }
    }
    if(recordUri)upload()
  },[recordUri])
  //isSending
  //creates plaback object with uri and reproduces audio
  React.useEffect(()=>{
    async function playMessage(){
      setIsReproducing(true)
      const uri = await firebase.storage().ref(storeMessageName).getDownloadURL();
      const soundObj = new Audio.Sound()
      console.log('cuantas cuentas',uri);
      try {
        await soundObj.loadAsync({uri})
        setMessageDuration(1)
        await soundObj.playAsync()
        setMessageName()
      } catch (e) {
        console.log('error playing',e);
      }
    }
    if(storeMessageName&&!isSending)playMessage()
  },[isSending])
  //messageDuration
  //count for message duration while it reproduces
  React.useEffect(()=>{
    let that = this
    if(messageDuration == 1){
      setIsReproducing(true)
      that.interval = setInterval(()=>{
        setMessageDuration(messageDuration=>messageDuration+1)
      },1000)
    }
    if(messageDuration == 5){
      clearInterval(that.interval)
      setMessageDuration(messageDuration=>0)
      setIsReproducing(false)
      setStatus('w')
      setListening(true)
    }
    console.log('reproducing',messageDuration);
  },[messageDuration])
  //spotify tokens
  //check if spotify is authorized
  React.useEffect(()=>{
    if(storedToken)setSpotifyAv(true)
  },[storedToken])
  //tokenExpired, Spotifycall
  //calls a spotify function if token isnt expired
  React.useEffect(()=>{
    const client = new SpotifyWebApi()
    async function play(){
      await client.play({
        uris: ['spotify:track:1jhidLCLbiNc7MP4XjkENP'],
        device_id: playInfo.device,
        position_ms:0
      })
      setSpotifyCall('')
    }
    if(spotifyToken&&spotifyCall) {
      console.log('ahooora',spotifyCall);
      client.setAccessToken(spotifyToken)
      switch (spotifyCall) {
        case 'play':
            play()
          break;
      }
    }
    if(spotifyCall)checkTokenExpired()
  },[spotifyToken,spotifyCall])
  //refreshedTokens
  //set access token when refreshedTokens are set
  React.useEffect(()=>{
    if(refreshedTokens)setSpotifyToken(refreshedTokens.access)
  },[refreshedTokens])

  handleOnTime = (e)=>{
    setWorkoutTime(e)
  }

  return(
    <View style={styles.container}>
      <Modal visible={showModal}>
          <View>
            <Text h2>Are you sure you want to stop?</Text>
          </View>
      </Modal>
      <View style={styles.header}></View>
      <View style={{flex:3}}>
        <View style={{flex:1}}></View>
        <View>
          <View style={styles.horizontalView}>
            <View style={{flex:2}}></View>
            <View>
              {isRecording?(
                <View>
                  <Ionicons name="mic" size={70} color='black'/>
                </View>
              ):(isReproducing?(
                <View>
                  <Ionicons name="play-outline" size={70} color='black'/>
                </View>
              ):(isSending?(
                  <View>
                    <ActivityIndicator style={{flex:2}}/>
                  </View>
                ):(
                  <View></View>
                  )
                )
              )}
              <Timer pause={pause} handleOnTime={handleOnTime}/>
            </View>
            <View style={{flex:2}}></View>
          </View>
        </View>
        <View>
          {spotifyAv? (
            <View><Text>SOOOnando</Text></View>
          ):(
            <View><Text>authroize spotify to share yout music</Text></View>
          )}
        </View>
        <View style={{flex:2}}></View>
      </View>
      <View style={{flex:1}}></View>
    </View>
  )
}
