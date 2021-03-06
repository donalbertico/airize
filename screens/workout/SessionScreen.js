import * as React from 'react'
import * as firebase from 'firebase'
import * as Speech from 'expo-speech'
import * as Analytics from 'expo-firebase-analytics';
import { Audio } from 'expo-av'
import 'firebase/firestore'
import Voice from '@react-native-voice/voice'
import {PorcupineManager} from '@picovoice/porcupine-react-native'
import SpotifyWebApi from 'spotify-web-api-js'
import { View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  Image,
  SafeAreaView,
  ImageBackground } from 'react-native'
import { Text, Button, Input } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import {styles} from '../styles'
import useAssetStore from '../../hooks/useAssetStore'
import useUserRead from '../../hooks/useUserRead'
import useSpotifyTokenRefresh from '../../hooks/useSpotifyTokenRefresh'
import useSpotifyTokenStore from '../../hooks/useSpotifyTokenStore'
import useAppState from '../../hooks/useAppState'
import useProfilePicture from '../../hooks/useProfilePicture'

import Timer from './components/timerComponent'
import Chat from './components/chatComponent'

export default function SessionScreen(props){
  const [user] = useUserRead('get')
  const [messageLimit,setMessageLimit] = React.useState(5)
  const [refreshErr,refreshedTokens,setRefresh] = useSpotifyTokenRefresh(false)
  const [storedToken] = useSpotifyTokenStore()
  const [assets,setAssets] = useAssetStore()
  const [nextState] = useAppState()
  const [hostPic, setHostPic] = useProfilePicture()
  const [guestPic, setGuestPic] = useProfilePicture()
  const [avatarUri,setAvatar] = React.useState()
  const [logoUri,setLogo] = React.useState()
  const [backgroundChat,setBackground] = React.useState()
  const [playbackInfo,setPlayInfo] = React.useState()
  const [playbackImage,setPlayImage] = React.useState()
  const [playbackCurrent,setPlaybackCurrent] = React.useState()
  const [playlistCover,setPlaylistCover] = React.useState()
  const [isRecording,setIsRecording] = React.useState(false)
  const [pause,setPause] = React.useState(true)
  const [voiceListening,setVoiceListening] = React.useState('started')
  const [porcupineReady,setPorcupineReady] = React.useState(false)
  const [wakeListening,setWakeListening] = React.useState('started')
  const [status,setStatus] = React.useState() //[w:work,r:record,s:stopping,p:playing]
  const [recordTime,setRecordTime] = React.useState(0)
  const [askPause,setAskPause] = React.useState(false)
  const [askLeave,setAskLeave] = React.useState(false)
  const [time,setWorkoutTime] = React.useState()
  const [recording,setRecording] = React.useState()
  const [isReproducing,setIsReproducing] = React.useState(false)
  const [message,setMessage] = React.useState()
  const [playbackDevice,setPlaybackDevice] = React.useState()
  const [messageDuration,setMessageDuration] = React.useState(0)
  const [isSending,setSending] = React.useState(false)
  const [recordUri,setRecordUri] = React.useState()
  const [tokenExpired,setTokenExpired] = React.useState(true)
  const [spotifyAv,setSpotifyAv] = React.useState(false)
  const [spotifyCall,setSpotifyCall] = React.useState()
  const [spotifyToken,setSpotifyToken] = React.useState()
  const [currentUri,setCurrentRui] = React.useState()
  const [updateSession,setUpdateSession] = React.useState()
  const [sessionReference, setSessionReference] = React.useState()
  const [tellChange, setTellChange] = React.useState()
  const [playing, setPlaying] = React.useState(false)
  const [wasPlaying, setWasPlaying] = React.useState(false)
  const [playlist, setPlaylist] = React.useState()
  const [spotifyError, setSpotifyError] = React.useState()
  const [listTracks, setListTracks] = React.useState()
  const [toPlay, setToPlay] = React.useState()
  const [understood, setUnderstood] = React.useState(true)
  const [speechEnd, setSpeechEnd] = React.useState(false)
  const [pauseModal, setPauseModal] = React.useState(false)
  const [iosVoice, setIosVoice] = React.useState('init')
  const [isPremium, setIsPremium] = React.useState(true)
  const [iosVoiceCalls, setIosVoiceCalls] = React.useState(0)
  const [iosVoiceControl, setIosVoiceControl] = React.useState(0)
  const [inactive, setInactive] = React.useState(false)
  const [ios, setIos] = React.useState(Platform.OS == 'ios' ? true : false)
  const [guestUser, setGuestUser] = React.useState()
  const [icons, setIcons] = React.useState()
  const [session, setSession] = React.useState()
  const [messages, setMessages] = React.useState()
  const [messageText, setMessageText] = React.useState()

  const workSpeechResultsHandler = (results) =>{
    let options = results.value
    if(ios && options[0]?.split(' ').length < 2)return;
    if(options){
      for(var i in options){
        let string = options[i].split(' ')
        for (var j in string) {
            let word = string[j].toLowerCase();
            let next = string[parseInt(j)+1]?.toLowerCase()
            if(word =='stop' || word == 'take' || word == 'break'){
              setUnderstood(true)
              setVoiceListening(false)
              if(next == 'music' || next == 'spotify'){
                setUpdateSession('pauseSpotify')
                setWakeListening(true)
                return;
              }
              setUpdateSession('askPause')
              return;
            }
            else if (word == 'finish'){
              setUnderstood(true)
              setVoiceListening(false)
              setUpdateSession('askLeave')
              return;
            }
            else if (word=='record' || word=='send' || word=='message'){
              setMessageLimit(5)
              setUnderstood(true)
              setVoiceListening(false)
              if(playing){
                setWasPlaying(true)
                setSpotifyCall('pause');
              }
              if(next == 'long'){
                setMessageLimit(10)
              }
              setTellChange('recording')
              setStatus('r')
              setIsRecording(true)
              setRecordTime(1)
              return;
            }
            else if (word=='play' || word=='music'){
              setVoiceListening(false)
              setUnderstood(true)
              let third = string[parseInt(j)+2]?.toLowerCase()
              if(next == 'next' || next == 'song' || next == 'track'){
                setUpdateSession('playNext')
                setWakeListening(true)
                return;
              }
              if(next == 'previous' || next == 'last' ){
                setUpdateSession('playPrevious')
                setWakeListening(true)
                return;
              }
              if(next == 'mine' || next == 'my'){
                setUpdateSession('playMyList')
                setWakeListening(true)
                return;
              }
              if(third == 'list' || third == 'music'){
                setUpdateSession('playMyList')
                setWakeListening(true)
                return;
              }
              setUpdateSession('play')
              setWakeListening(true)
              return;
            }
          else if ( word =='next'){
            setUnderstood(true)
            setVoiceListening(false)
            setUpdateSession('playNext')
            setWakeListening(true)
            return;
          }else if ( word =='previous' || word == 'last'){
            setUnderstood(true)
            setVoiceListening(false)
            setUpdateSession('playPrevious')
            setWakeListening(true)
            return;
          }
          else if ( word =='pause'){
            setUnderstood(true)
            setVoiceListening(false)
            setUpdateSession('pauseSpotify')
            setTimeout(() => setWakeListening(true),100)
            return;
          }
        }
      }
      setUnderstood(true)
      if(ios) setIosVoiceCalls ( iosVoiceCalls => iosVoiceCalls+1)
      else setTimeout(() => setUnderstood(false),100)
    }
  }
  const leavingSpeechResultHandler = (results)=> {
    let options = results.value
    if(ios && options[0]?.split(' ').length < 2)return;
    if(options){
      for(var i in options){
        let string = options[i].split(' ')
        for (var j in string) {
          let word = string[j].toLowerCase();
          if(word=='stop' || word=='finish' ){
            setUnderstood(true)
            setVoiceListening(false)
            setPause(true)
            setStatus('f')
            return;
          }else if(word=='keep'||word=='continue'){
            setUnderstood(true)
            setVoiceListening(false)
            setUpdateSession('working')
            setWakeListening(true)
            return;
          }else if (word=='record' || word=='send' || word=='message'){
            setMessageLimit(5)
            setUnderstood(true)
            setVoiceListening(false)
            if(playing){
              setWasPlaying(true)
              setSpotifyCall('pause');
            }
            if(next == 'long'){
              setMessageLimit(10)
            }
            setTellChange('recording')
            setStatus('r')
            setIsRecording(true)
            setRecordTime(1)
            return;
          }
        }
      }
      setUnderstood(true)
      if(ios) setIosVoiceCalls ( iosVoiceCalls => iosVoiceCalls+1)
      else setTimeout(() => setUnderstood(false),100)
    }
  }
  const pausingSpeechResultHandler = (results)=> {
    let options = results.value
    if(ios && options[0]?.split(' ').length < 2)return;
    if(options){
      for(var i in options){
        let string = options[i].split(' ')
        for (var j in string) {
          let word = string[j].toLowerCase();
          if(word=='pause' || word=='stop' ){
            setUnderstood(true)
            setVoiceListening(false)
            setUpdateSession('pause')
            setWakeListening(true)
            return;
          }else if(word=='keep' || word=='continue'){
            setUnderstood(true)
            setVoiceListening(false)
            setUpdateSession('working')
            setWakeListening(true)
            return;
          }else if (word=='record' || word=='send' || word=='message'){
            setMessageLimit(5)
            setUnderstood(true)
            setVoiceListening(false)
            if(playing){
              setWasPlaying(true)
              setSpotifyCall('pause');
            }
            if(next == 'long'){
              setMessageLimit(10)
            }
            setTellChange('recording')
            setStatus('r')
            setIsRecording(true)
            setRecordTime(1)
            return;
          }
        }
      }
      setUnderstood(true)
      if(ios) setIosVoiceCalls ( iosVoiceCalls => iosVoiceCalls+1)
      else setTimeout(() => setUnderstood(false),100)
    }
  }
  const pausedSpeechResultHandler = (results) => {
    let options = results.value
    if(ios && options[0]?.split(' ').length < 2)return;
    if(options){
      for(var i in options){
        let string = options[i].split(' ')
        for (var j in string) {
          let word = string[j].toLowerCase();
          if(word=='continue' || word=='go' || word == 'keep'){
            setUnderstood(true)
            setVoiceListening(false)
            setUpdateSession('working')
            setWakeListening(true)
            return;
          }
          else if (word == 'finish'){
            setUnderstood(true)
            setVoiceListening(false)
            setUpdateSession('askLeave')
            setWakeListening(true)
            return;
          }else if (word=='record' || word=='send' || word=='message'){
            setMessageLimit(5)
            setUnderstood(true)
            setVoiceListening(false)
            if(playing){
              setWasPlaying(true)
              setSpotifyCall('pause');
            }
            if(next == 'long'){
              setMessageLimit(10)
            }
            setTellChange('recording')
            setStatus('r')
            setIsRecording(true)
            setRecordTime(1)
            return;
          }
        }
      }
    }
    setUnderstood(true)
    if(ios) setIosVoiceCalls ( iosVoiceCalls => iosVoiceCalls+1)
    else setTimeout(() => setUnderstood(false),100)
  }
  const speechEndHandler = (error) => {
    setSpeechEnd(false)
    setTimeout(() => {setSpeechEnd(true)},100)
  }
  const checkTokenExpired = () => {
    let yesterday = new Date()
    if(!storedToken)return;
    yesterday.setDate(yesterday.getDate()+1)
    if(storedToken.expires <= new Date().getTime()){
      setRefresh(true)
    }else{
      setSpotifyToken(storedToken.access)
    }
  }
  const handleOnTime = (time) => {
    setWorkoutTime(time)
  }
  const sendMessage = (text) => {
    if(text) sessionReference.collection('messages')
            .add({
              user: user.uid,
              text: text,
              status: 's',
              time: firebase.firestore.Timestamp.fromDate(new Date())
            })
            .then(() => {
              setMessageText('')
            })
  }
  const playAudioMessage = (msg) => {
    let name = `${msg.id}.${msg.fileType}`
    setMessage({...msg, name : name})
  }
  //onMount hook
  React.useEffect(()=>{
    let db = firebase.firestore()
    let that = this
    if(!that) return;
    async function allowRecordIos(){
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      } catch (e) {
        console.log('ERROR setting recording',e);
      }
    }
    async function setPorcupine() {
      try {
        that.porcupineManager = await PorcupineManager.fromKeywords(
          ['alexa','ok google','terminator','blueberry']
          ,()=> {
            setTellChange('yes')
            setWakeListening(false)
          })
        setPorcupineReady(true)
      } catch (e) {
        console.log('Error starting porcu',e);
      }
    }
    async function getVoices() {
      const voices = await Speech.getAvailableVoicesAsync()
      if(voices){
        voices.forEach((item, i) => {
          if(item.identifier == 'com.apple.ttsbundle.siri_female_en-GB_compact') setIosVoice(item.identifier)
        });
      }
    }
    props.navigation.addListener('beforeRemove',(e)=>{
      e.preventDefault()
    })
    Analytics.setCurrentScreen('session');
    setSessionReference(db.collection('sessions').doc(props.route.params.session.id))
    allowRecordIos()
    setPorcupine()
    if(ios) getVoices()
    else setIosVoice(false)
    return () => {
      Voice.cancel()
      Voice.stop()
      Voice.destroy()
      Speech.stop()
      that.porcupineManager?.delete()
      that.porcupineReady = null
    }
  },[])
  //
  //Session
  //
  //sessionsReference
  //set session listener
  React.useEffect(() => {
    let that = this;
    if(sessionReference && user.uid){
      that.sessionListener =
        sessionReference.onSnapshot((snapshot) => {
          let data = snapshot.data()
          if(data?.playback)setPlayInfo(data.playback)
          setSession(data)
          switch (data.status) {
            case 'al':
              setStatus('al')
              setAskLeave(true)
              setPauseModal(false)
              break;
            case 'ap':
              setStatus('ap')
              setAskPause(true)
              break;
            case 'f':
              props.navigation.addListener('beforeRemove',(e)=>{
                props.navigation.dispatch(e.data.action)
              })
              props.navigation.navigate('home',{refresh : true})
              break;
            case 's':
              setAskPause(false)
              setAskLeave(false)
              setPause(false)
              setPauseModal(false)
              setStatus('w')
              break;
            case 'p':
              setAskPause(false)
              setPause(true)
              setStatus('p')
              setPauseModal(true)
              break;
          }
      })
      that.messagesListener =
        sessionReference.collection('messages')
          .orderBy('time')
          .onSnapshot((snapshot) => {
            setMessages([])
            snapshot.forEach((message, i) => {
              let messageData = message.data()
              messageData.id = message.id
              setMessages(messages => [...messages,messageData])
              if(messageData.fileType && messageData.status == 's' && messageData.user != user.uid){
                setMessage({...messageData, name :`${messageData.id}.${messageData.fileType}`})
              }
            });
        })
    } else if (!sessionReference){
      if(that?.sessionListener){
        that.sessionListener()
        that.sessionListener = null
      }
      if(that?.messagesListener){
        that.messagesListener()
        that.messagesListener = null
      }
    }
    return () => {
      if(that.sessionListener){
        that.sessionListener()
        that.sessionListener = null
       }
      if(that.messagesListener){
        that.messagesListener()
        that.messagesListener = null
      }
    }
  },[sessionReference,user])
  //updateSession
  //updates Session based on state param
  React.useEffect(() => {
    switch(updateSession){
      case 'askLeave':
        sessionReference.update({
          leaver : user.uid,
          status : 'al',
          playback : {
            status : 's',
          }
        })
        break;
      case 'askPause':
        sessionReference.update({
          leaver : user.uid,
          status : 'ap',
          playback : {
            status : 's',
          }
        })
        break;
      case 'pause':
        Analytics.logEvent('session_paused', {
          user: user.uid,
          screen: 'session',
          purpose: 'session paused',
        });
        sessionReference.update({
          leaver : user.uid,
          status : 'p',
          playback : {
            status : 's',
          }
        })
        break;
      case 'finish':
        sessionReference.update({
          status : 'f',
          time : time,
          endDate : firebase.firestore.Timestamp.fromDate(new Date()),
          playback : {
            status : 's',
          }
        })
        break;
      case 'working':
        sessionReference.update({
          status : 's'
        })
        break;
    }
  },[updateSession])
  //session
  //listen for session to ask for other users info
  React.useEffect(() => {
    if(session) {
      let db = firebase.firestore()
      session.users.forEach((item, i) => {
        if(item != user.uid){
          db.collection('users').doc(item).get()
              .then((doc) => {
                setGuestUser({...doc.data(), id : doc.uid})
              })
        }
      });
    }
  },[session])

  //
  //Voice command listeners
  //
  //wakeListening
  //sets an interval to activate in case long time passed and voice is not voiceListening
  React.useEffect(()=>{
    let that = this
    if(!that) return;
    if(porcupineReady && wakeListening != 'started'){
      if(wakeListening == true && !isRecording) {
        that.porcupineManager?.start().then((started)=> {
          if(started)console.log('sisaaaaa');
        })
      }else if(wakeListening == false){
        that.porcupineManager?.stop().then((stopped)=> {
          if(stopped) setTimeout(() => setVoiceListening(true), ios? 100 : 200)
        })
      }else if(wakeListening == 'off'){
        that.porcupineManager?.stop()
      }
    }
  },[wakeListening,porcupineReady])
  //voiceListening
  //starts voice function and stops porcupine
  //starts porcupine and stops voice
  React.useEffect(()=>{
    console.log(voiceListening,status);
    if(voiceListening != 'started'){
      if ( voiceListening ){
        Voice.start('en-UK')
      }else{
        Voice.cancel()
        Voice.stop()
        Voice.removeAllListeners()
        Voice.destroy()
      }
    }
  },[voiceListening])
  //
  //Voice listeners handlers depending on IOS
  //
  if (ios){
    //iosVoiceCalls
    //check how many times on speech has been called to rise voice listener again
    React.useEffect(() => {
      if(iosVoiceCalls >= 12){
        setVoiceListening(false)
        setTellChange('sayAgain')
        setTimeout(() => setVoiceListening(true), 1500)
        setIosVoiceCalls(0)
      }
    },[iosVoiceCalls])
    //voiceListening - wakeListening - understood
    //starts an interval in case no interactions
    React.useEffect(()=>{
      let that = this
      if( voiceListening && !wakeListening){
        that.voiceTimer = setInterval(()=>{
          if(!wakeListening && voiceListening && understood){
            setVoiceListening(false)
            setWakeListening(true)
          }
        },22000)
      }else if(wakeListening){
        clearInterval(that.voiceTimer)
      }
      return () => {
        clearInterval(that.voiceTimer)
      }
    },[voiceListening,wakeListening])
  }else{
    //voiceListening - wakeListening - understood
    //starts an interval in case listening deactives
    React.useEffect(()=>{
      let that = this
      if( voiceListening && !wakeListening){
        that.voiceTimer = setInterval(()=>{
          if(!wakeListening && voiceListening && understood){
            setVoiceListening(false)
            setWakeListening(true)
          }
          if(!understood && voiceListening && !wakeListening) {
            setTimeout(() => {
              setVoiceListening(false)
              setWakeListening(true)
            },5000)
          }
        },8000)
      }else if(wakeListening){
        clearInterval(that.voiceTimer)
      }
      return () => {
        clearInterval(that.voiceTimer)
      }
    },[voiceListening,wakeListening])
    //understood
    //activates voiceListening if no option was selected
    React.useEffect(() => {
      if(understood == false && !wakeListening){
        setVoiceListening(false)
        setTellChange('sayAgain')
        setTimeout(() => setVoiceListening(true), 1500)
      }
    },[understood])
    //speechEnd
    //checks if speech ended to rise listening by setting understood to false
    React.useEffect(() => {
      if(speechEnd){
        setTimeout(() => {
          if(!understood){
            setUnderstood(true)
            setTimeout(() => setUnderstood(false),100)
          }
        }, 2000)
      }
    }, [speechEnd])
  }

  //status
  //changes speech handlers
  React.useEffect(()=>{
    Voice.onSpeechEnd = speechEndHandler
    switch (status) {
      case 'w':
        Voice.onSpeechResults = workSpeechResultsHandler
        setTellChange('working')
        break;
      case 'al':
        Voice.onSpeechResults = leavingSpeechResultHandler
        if(session?.leaver == user.uid) setTellChange('waitLeaveConfirmation')
        else setTellChange('askLeave')
        break;
      case 'ap':
        Voice.onSpeechResults = pausingSpeechResultHandler
        if(session?.leaver == user.uid) setTellChange('waitPauseConfirmation')
        else setTellChange('askPause')
        break;
      case 'p':
        setTellChange('pause')
        Voice.onSpeechResults = pausedSpeechResultHandler
        break;
    }
  },[status])

  //
  //voice message recording
  //
  //recordTime
  //handle record command for (S) seconds
  React.useEffect(()=>{
    let that = this
    async function record(){
      const recording = new Audio.Recording()
      try{
        const { ios, android } = Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        await recording.prepareToRecordAsync({
          android : android,
          ios : {
            ...ios,
            extension: '.mp4',
            outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC
          }
        })
        await recording.startAsync()
        setRecording(recording)
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
      setTimeout(()=>{ record()},200)
      Analytics.logEvent(messageLimit == 5 ?'message_recorded' : 'long_message_recorded', {
        user: user.uid,
        screen: 'session',
        purpose: 'message recorded',
      });
      that.recordInterval = setInterval(()=>{
        setRecordTime(recordTime => recordTime+1)
      },1000)
    }
    if(recordTime == messageLimit){
      clearInterval(that.recordInterval)
      stopRecord()
      setRecordTime(recordTime => 0)
      setIsRecording(false)
      if(wasPlaying){
        spotifyCall('play')
        setPlaying(true)
        setWasPlaying(false)
      }
    }
    return () => {
      if (recordTime == 0) clearInterval(that.recordInterval)
    }
  },[recordTime])
  //recordUri
  //uploads recoreded audio
  React.useEffect(() => {
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
          sessionReference.collection('messages')
            .add({
              user: user.uid,
              status: 'u',
              time: firebase.firestore.Timestamp.fromDate(new Date()),
              fileType: fileType
            }).then((doc)=>{
            firebase.storage().ref()
              .child(`${doc.id}.${fileType}`)
              .put( blob,{
                contentType:`audio/${fileType}`
              })
              .then(() => {
                doc.update({ status: 's' }).then(() => {
                  setRecordUri()
                  setTellChange('sent')
                  setSending(false)
                })
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
  //
  //voice message reproducing
  //
  //message
  //creates plaback object with uri from message
  React.useEffect(()=>{
    async function playMessage(){
      setIsReproducing(true)
      try {
      const uri = await firebase.storage().ref(message.name).getDownloadURL();
      const soundObj = new Audio.Sound()
        await soundObj.loadAsync({uri :  uri },{shouldPlay : true})
        setMessageDuration(1)
        setWakeListening('off')
      } catch (e) {
        console.log('error playing',e);
        setWakeListening(true)
        setIsReproducing(false)
      }
    }
    if(message)playMessage()
  },[message])
  //messageDuration
  //count for message duration while it reproduces
  React.useEffect(()=>{
    let that = this
    if(messageDuration == 1){
      setIsReproducing(true)
      that.messageInterval = setInterval(()=>{
        setMessageDuration(messageDuration => messageDuration+1)
      },1000)
    }
    if(messageDuration == messageLimit){
      clearInterval(that.messageInterval)
      setMessageDuration(messageDuration=>0)
      if(message?.id){
        sessionReference.collection('messages')
          .doc(message.id)
          .update({ status: 'l' }).then(() => {
            setMessage()
          })
      }
      setIsReproducing(false)
      setWakeListening(true)
    }
    return () => {
      if (messageDuration == 0)clearInterval(that.messageInterval)
    }
  },[messageDuration])

  //
  //Spotify auth and tasks
  //
  //spotifytoken, Spotifycall
  //calls a spotify function if token isnt expired
  React.useEffect(()=>{
    const client = new SpotifyWebApi()
    async function play(){
      try {
        await client.play({
          uris: playbackInfo.uri,
          device_id: playbackDevice,
          position_ms: 0
        })
        setPlaying(true)
        setSpotifyCall('getCurrentTrack')
      } catch (e) {
        setPlaying(false)
        setSpotifyError({type : 'play', e : e})
      }
    }
    async function pause(){
      try {
        await client.pause()
        setPlaying(false)
      } catch (e) {
        setSpotifyError({type : 'pause', e : e})
      }
      setSpotifyCall('')
    }
    async function resume(){
      try {
        await client.play()
        setPlaying(true)
        setSpotifyCall('getCurrentTrack')
      } catch (e) {
        setPlaying(false)
        setSpotifyError({type : 'resume', e : e})
      }
      setSpotifyCall('')
    }
    async function getDevices(){
      const client = new SpotifyWebApi()
      client.setAccessToken(spotifyToken)
      setPlaybackDevice()
      try {
        const result = await client.getMyDevices()
        if(result){
          setSpotifyCall('')
          let devices = result.devices
          if(devices?.length == 0) setPlaybackDevice()
          devices.forEach((device, i) => {
            if(device.type == "Smartphone") setPlaybackDevice(device.id)
          });
        }
      } catch (e) {
        setSpotifyError({type : 'devices', e : e})
      }
    }
    async function getListTracks(){
      try {
        const tracks = await client.getPlaylistTracks(playlist.split(':')[2])
        let uris = []
        let images = []
        tracks?.items?.forEach((item, i) => {
          uris = [...uris,item.track.uri]
          images = [...images,item.track.album.images[0].url]
        });
        setListTracks(uris)
        setSpotifyCall('')
      } catch (e) {
        setSpotifyCall('')
        setSpotifyError({type : 'listTraks', e : e})
      }
    }
    async function skipToNext() {
      try {
        await client.skipToNext()
        setSpotifyCall('getCurrentTrack')
        setSpotifyCall('')
      }
      catch (e) {
        setSpotifyError({type : 'nextrack', e : e})
        setSpotifyCall('')
      }
    }
    async function skipToPrevious(){
      try {
        await client.skipToPrevious()
        setSpotifyCall('getCurrentTrack')
        setSpotifyCall('')
      }
      catch (e) {
        setSpotifyError({type : 'previous',e : e})
        setSpotifyCall('')
      }
    }
    async function getPlayLists() {
      try {
        const  result = await client.getUserPlaylists()
        if(result){
          result.items?.forEach((playlist, i) => {
            if(playlist.name.toLowerCase() == 'airize') {
              setPlaylist(playlist.uri)
              setPlaylistCover(playlist.images[0].url)
              setPlayImage(playlist.images[0].url)
            }
          });
        }
        setSpotifyCall('')
      } catch (e) { setSpotifyToken({type : 'previous',e : e}) }
    }
    async function getCurrentTrack() {
      try {
        let current = await client.getMyCurrentPlayingTrack()
        if(current?.item){
          console.log(current.item);
          setPlaybackCurrent(current.item)
          setPlayImage(current.item.album.images[0].url)
        }else{
          setPlayImage(playlistCover)
        }
      } catch (e) {
        setSpotifyError({type : 'currentTrak', e: e})
      }
      setSpotifyCall('')
    }
    if(spotifyToken && spotifyCall) {
      client.setAccessToken(spotifyToken)
      switch (spotifyCall) {
        case 'play':
            if(playbackDevice) play()
            else setSpotifyCall('')
          break;
        case 'resume':
            if(playbackDevice) resume()
            else setSpotifyCall('')
          break;
        case 'pause':
            if(playbackDevice) pause()
            else setSpotifyCall('')
          break;
        case 'getDevices':
            getDevices()
          break;
        case 'getTracks':
            getListTracks()
          break;
        case 'playNext':
            skipToNext()
          break;
        case 'playPrevious':
            skipToPrevious()
          break;
        case 'getPlayList':
            getPlayLists()
          break;
        case 'getCurrentTrack':
          setTimeout(() => getCurrentTrack(),500)
          break;
      }
    }
    if(spotifyCall)checkTokenExpired()
  },[spotifyToken,spotifyCall])
  //spotify tokens
  //check if spotify is authorized
  React.useEffect(()=>{
    if(storedToken){
      setSpotifyAv(true)
      if(playlist){
        if(playbackDevice){
          setSpotifyCall('getTracks')
          if (playbackInfo) {
            if (playbackInfo.status == 'p') setTimeout(() => setSpotifyCall('play'),100)
          }else { setTimeout(() => setSpotifyCall('pause'),100) }
        }else {
          setSpotifyCall('getDevices')
        }
      }else {
        setSpotifyCall('getPlayList')
      }
    }
  },[storedToken, playlist, playbackDevice])
  //refreshedTokens
  //set access token when refreshedTokens are set
  React.useEffect(() => {
    if(refreshedTokens)setSpotifyToken(refreshedTokens.access)
  },[refreshedTokens])
  //playbackInfo
  //show text for set the device
  React.useEffect(() => {
    if(playbackInfo){
      switch (playbackInfo.status) {
        case 's':
          setSpotifyCall('pause')
          break;
        case 'p':
          if(playbackInfo.uri)setSpotifyCall('play')
          break;
        case 'r':
          setSpotifyCall('resume')
          break;
        case 'n':
          setSpotifyCall('playNext')
          break;
        case 'nn':
          setSpotifyCall('playNext')
          break;
        case 'l':
          setSpotifyCall('playPrevious')
          break;
        case 'll':
          setSpotifyCall('playPrevious')
          break;
      }
    }
  },[playbackInfo])
  //spotify Error
  //handles if any spotify error happen
  React.useEffect(() => {
    if(spotifyError){
      let error = spotifyError.e['_response']?.error
      let stringError = spotifyError.e['_response']
      let obj = stringError&& JSON.parse(stringError)
      if(error){
        switch (error?.status){
          case 404:
            if(spotifyError.type != 'pause') setSpotifyCall('getDevices')
            break;
          case 401:
            setRefresh(true)
            break;
          default:
        }
      }else {
        if(obj?.error){
          switch (obj?.error.status){
            case 403:
              if (obj.error.message?.split('violated').length < 2) {
                setIsPremium(false)
              }
              break;
            case 404:
              if(spotifyError.type != 'pause') setSpotifyCall('getDevices')
              break;
            case 401:
              setRefresh(true)
              break;
          }
        }
      }
    }
  },[spotifyError])

  //
  // voice alerts
  //
  //tellChange
  //set expo speech depending of activity
  React.useEffect(() => {
    let options = (ios && iosVoice) ? {voice : iosVoice} : undefined
    if (iosVoice != 'init'){
      switch (tellChange) {
        case 'askLeave':
            Speech.speak('friend is asking to finish',options)
            setTellChange('')
            setWakeListening(true)
          break;
        case 'askPause':
            Speech.speak('friend is asking to pause',options)
            setTellChange('')
            setWakeListening(true)
          break;
        case 'waitLeaveConfirmation':
            Speech.speak('asking friend to finish',options)
            setTellChange('')
            setWakeListening(true)
          break;
        case 'waitPauseConfirmation':
            Speech.speak('asking friend to pause',options)
            setTellChange('')
            setWakeListening(true)
          break;
        case 'working':
            Speech.speak('arise',options)
            setTellChange('')
            setWakeListening(true)
          break;
        case 'recording':
            Speech.speak('recording',options)
            setTellChange('')
          break;
        case 'yes':
            Speech.speak('yes',options)
            setTellChange('')
          break;
        case 'sent':
            Speech.speak('message sent',options)
            setWakeListening(true)
            setTellChange('')
          break;
        case 'sayAgain':
            Speech.speak('sorry, say again',options)
            setTellChange('')
          break;
        case 'pause':
            Speech.speak('taking a break',options)
            setTellChange('')
            setWakeListening(true)
          break;
        case 'noDevice':
            Speech.speak('go to spotify and comeback to share music',options)
            setTellChange('')
          break;
      }
      setTimeout(() => Speech.stop(),2500)
    }
  },[tellChange, iosVoice])
  //
  //utils
  //
  //nextState
  //check if app came from background
  React.useEffect(() => {
    if(props.route.name == 'session'){
      if(nextState == 'active'){
        let db = firebase.firestore()
        setSessionReference(db.collection('sessions').doc(props.route.params.session.id))
        setSpotifyCall('getDevices')
        setWakeListening(true)
        setInactive(false)
      }else if(nextState){
        setVoiceListening(false)
        setWakeListening('off')
        setSessionReference()
        setInactive(true)
      }
    }
  },[nextState])
  //assets
  //load images url
  React.useEffect(() => {
    if(assets) {
      setAvatar(assets.avatar)
      setLogo(assets.logo)
      setIcons(assets.music)
      setBackground(assets.backgroundChat)
    }
  },[assets])
  //wordouttime - status
  // check if session if session finish to save sessions'time
  React.useEffect(() => {
    if(time && status == 'f'){
      setAskPause(false)
      setPause(true)
      setPauseModal(false)
      setVoiceListening(false)
      setUpdateSession('finish')
    }
  },[time,status])
  // playbackDevice - playbackInfo
  //tell message if device not active
  React.useEffect(() => {
    if (spotifyAv) {
      if (playbackInfo?.status && (playbackInfo?.status == 'p' || playbackInfo?.status == 'r')){
        if(!playbackDevice) setTellChange('noDevice')
      }
    }
  },[playbackDevice,playbackInfo])
  //user - guest user
  //set pictures of users
  React.useEffect(() => {
    if(user?.picture)setHostPic(user.picture)
    if(guestUser?.picture)setGuestPic(guestUser.picture)
  },[guestUser])

  return(
    <SafeAreaView style={styles.container}>
      <Modal transparent={true} visible={askLeave}>
          <View style={styles.alignCentered}>
            <View style={styles.modalView}>
              {session?.leaver == user.uid  ? (
                <View>
                  <Text> Asking your partener to leave ..</Text>
                </View>
              ):(
                <View>
                  <Text> Your partner is asking to leave</Text>
                </View>
              )}
              <View style={{margin:10}}></View>
              <View style={styles.horizontalView}>
                <Button title='Continue' type='clear'
                  titleStyle= {styles.secondaryButton}
                  onPress={() => setUpdateSession('working')}/>
                <View style={{width : 20}}></View>
                <Button title='Finish' type='clear'
                  onPress={() => { setPause(true);setStatus('f')}}/>
              </View>
            </View>
          </View>
      </Modal>
      <Modal transparent={true} visible={askPause}>
          <View style={styles.alignCentered}>
            <View style={styles.modalView}>
              {session?.leaver==user.uid ? (
                <View>
                  <Text> Asking your partener to pause..</Text>
                </View>
              ):(
                <View>
                  <View>
                    <Text> Your partner is asking to pause</Text>
                  </View>
                </View>
              )}
              <View style={{margin:10}}></View>
              <View style={styles.horizontalView}>
                <Button title='Continue' type='clear'
                  titleStyle= {styles.secondaryButton}
                  onPress={() => setUpdateSession('working')}/>
                <View style={{width : 20}}></View>
                <Button title='Pause' type='clear'
                  onPress={() => setUpdateSession('pause')}/>
              </View>
            </View>
          </View>
      </Modal>
      <Modal transparent={true} visible={pauseModal}>
          <View style={styles.alignCentered}>
            <View style={styles.modalView}>
              <View>
                <Text style={styles.h2}> Puased</Text>
              </View>
              <View style={{margin:10}}></View>
              <View style={styles.horizontalView}>
                <View style={{flex : 1}}></View>
                <Button title='Continue' type='clear'
                  onPress={() => setUpdateSession('working')}/>
              </View>
            </View>
          </View>
      </Modal>
      <View style={styles.header}>
        <View style={{flex:1}}>
          <View style={styles.alignCentered}>
            <TouchableOpacity onPress={() => setUpdateSession('askLeave')}>
              <Ionicons size={30} name="arrow-back-outline" color='#E8E8E8'/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{justifyContent : 'center'}}>
          <Text style={styles.h2_ligth}>{guestUser?.firstName} {guestUser?.lastName}</Text>
        </View>
        <View style={{flex:3}}></View>
      </View>
      <ImageBackground
        style={{width : '100%'}}
        source={{uri : backgroundChat}}>
        <View style={styles.horizontalView}>
          <View style={{margin:10}}>
            <Image style={styles.roundImage} source={{uri: hostPic? hostPic : avatarUri}}/>
          </View>
          <View style={{flex:1}}>
            <View style={styles.alignCentered}>
              <Timer handleOnTime={handleOnTime} pause={pause}/>
            </View>
          </View>
          <View style={{margin:10}}>
            <Image style={styles.roundImage} source={{uri: guestPic? guestPic : avatarUri}}/>
          </View>
        </View>
      </ImageBackground>
      <View style={{flex:1, backgroundColor : '#D9D9D9'}}>
          <View style={{flex:1}}></View>
          <View>
            {isRecording?(
              <View style={{alignItems : 'center'}}>
                <Ionicons name="mic" size={35} color='#343F4B'/>
              </View>
            ):(isReproducing?(
              <View style={{alignItems : 'center'}}>
                <Ionicons name="play-outline" size={35} color='#343F4B'/>
              </View>
            ):(isSending &&(
                <View style={{alignItems : 'center'}}>
                  <ActivityIndicator style={{flex:2}}/>
                </View>
              ))
            )}
            { status == 'w' && (
              <View style={{alignItems : 'center'}}>
                <Text style={styles.h2_dark}>Start Workout</Text>
              </View>
            )}
            {!isPremium && (<Text>not premium =()</Text>) }
          </View>
          <View style={{flex:1}}></View>
      </View>
      <View style={{flex:6}}>
        <View style={{flex:1}}></View>
        { inactive? (
          <View>
            <View style={styles.horizontalView}>
              <View style={{flex:2}}></View>
              <ActivityIndicator style={{flex:2}}/>
              <View style={{flex:2}}></View>
            </View>
          </View>
        ) : (
          <View>
            {spotifyAv? (
              playbackDevice? (
                <>
                  <View style={styles.horizontalView}>
                    <View style={{flex:1}}></View>
                    <Image
                      style={
                        {height:175, width:175,
                          borderWidth : 5,
                          borderRadius : 10,
                          borderColor : '#343F4B'}}
                      source={{ uri:playbackImage? playbackImage: logoUri }}/>
                    <View style={{flex:1}}></View>
                  </View>
                  <View style={styles.verticalJump}></View>
                  <View style={styles.horizontalView}>
                    <View style={{flex:1}}></View>
                    <View>
                      <Text>{playbackCurrent?.name}</Text>
                      <Text style={styles.subtext}>{playbackCurrent?.artists[0]?.name}</Text>
                    </View>
                    <View style={{flex:1}}></View>
                  </View>
                  <View style={styles.verticalJump}></View>
                  <View style={styles.verticalJump}></View>
                  { playlist? (
                    <View style={styles.horizontalView}>
                      <View style={{flex:3}}></View>
                        <TouchableOpacity onPress={() => setUpdateSession('playPrevious')}>
                          <Image style={styles.inputIcon} source={{ uri: icons?.previous}}/>
                        </TouchableOpacity>
                        <View style={{flex:2}}></View>
                        <TouchableOpacity onPress={ () => {
                           playbackInfo?.status && playbackInfo?.status != 's' ?
                            (
                              setUpdateSession('pauseSpotify')
                            ) : (
                              setUpdateSession('play')
                            )
                          }}>
                          <Image style={styles.inputIcon}
                            source={{
                              uri:  playbackInfo?.status && playbackInfo?.status != 's' ?
                              (icons?.pause) :
                              (icons?.play) }}/>
                        </TouchableOpacity>
                        <View style={{flex:2}}></View>
                        <TouchableOpacity onPress={() => setUpdateSession('playNext')}>
                          <Image style={styles.inputIcon} source={{ uri: icons?.next}}/>
                        </TouchableOpacity>
                      <View style={{flex:3}}></View>
                    </View>
                  ) : (
                    <View style={styles.horizontalView}>
                      <View style={{flex:1}}></View>
                      <View style={{flex:4}}>
                        <Text>No Airize playlist, you can still listens to your partner music</Text>
                      </View>
                      <View style={{flex:1}}></View>
                    </View>
                  )}

                </>
                ) : (
                  <View style={styles.horizontalView}>
                    <View style={{flex:1}}></View>
                    <View style={{flex:4}}>
                      <Text>Spotify app is not open, please open it and come back</Text>
                    </View>
                    <View style={{flex:1}}></View>
                  </View>
                )
            ):(
              <Chat playAudioMessage={(msg) => playAudioMessage(msg)} sessMessages={messages}/>
            )}
          </View>
        )}
      </View>
      <View style={{borderWidth : 1, borderColor: '#D9D9D9'}}>
        <Input inputContainerStyle={styles.chatInput}
          placeholder='message' value={messageText}
          onChangeText={(messageText) => setMessageText(messageText)}
          leftIcon = {() => (
            <TouchableOpacity
              style={{marginLeft : -10}}
              onPress={() => {
                setWakeListening('off');
                setRecordTime(1);
                setTellChange('recording')
                setStatus('r')
                setIsRecording(true)
              } }>
              <Ionicons name="mic" size={35} color='black'/>
            </TouchableOpacity> )
          }
          rightIcon = {() => (
            <TouchableOpacity
              style={{marginRight : -10}}
              onPress={() => sendMessage(messageText)}>
              <Ionicons name="play-outline" size={35} color='black'/>
            </TouchableOpacity>
          )}
          />
      </View>
    </SafeAreaView>
  )
}
