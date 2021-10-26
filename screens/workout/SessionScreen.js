import * as React from 'react'
import * as firebase from 'firebase'
import { Audio } from 'expo-av'
import 'firebase/firestore'
import Voice from '@react-native-voice/voice'
import {PorcupineManager} from '@picovoice/porcupine-react-native'
import SpotifyWebApi from 'spotify-web-api-js'
import { View, TouchableOpacity, Modal, ActivityIndicator, Platform, Image} from 'react-native'
import {Text} from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import {styles} from '../styles'
import Timer from './components/timerComponent'
import useUserRead from '../../hooks/useUserRead'
import useSpotifyTokenRefresh from '../../hooks/useSpotifyTokenRefresh'
import useSpotifyTokenStore from '../../hooks/useSpotifyTokenStore'

export default function SessionScreen(props){
  const [user] = useUserRead('get')
  const [refreshErr,refreshedTokens,setRefresh] = useSpotifyTokenRefresh(false)
  const [storedToken] = useSpotifyTokenStore()
  const [playbackInfo,setPlayInfo] = React.useState()
  const [isRecording,setIsRecording] = React.useState(false)
  const [pause,setPause] = React.useState(true)
  const [voiceListening,setVoiceListening] = React.useState('started')
  const [porcupineReady,setPorcupineReady] = React.useState(false)
  const [wakeListening,setWakeListening] = React.useState('started')
  const [status,setStatus] = React.useState('w') //[w:work,r:record,s:stopping,p:playing]
  const [recordTime,setRecordTime] = React.useState(0)
  const [showModal,setModal] = React.useState(false)
  const [time,setWorkoutTime] = React.useState()
  const [recording,setRecording] = React.useState()
  const [isReproducing,setIsReproducing] = React.useState(false)
  const [message,setMessage] = React.useState()
  const [playbackDevice,setPlaybackDevice] = React.useState()
  const [messageDuration,setMessageDuration] = React.useState(0)
  const [isSending,setSending] = React.useState(false)
  const [sessRef,setRf] = React.useState()
  const [recordUri,setRecordUri] = React.useState()
  const [storeMessageId,setMessageId] = React.useState()
  const [tokenExpired,setTokenExpired] = React.useState(true)
  const [spotifyAv,setSpotifyAv] = React.useState(false)
  const [spotifyCall,setSpotifyCall] = React.useState()
  const [spotifyToken,setSpotifyToken] = React.useState()
  const [currentUri,setCurrentRui] = React.useState()
  const [updateSession,setUpdateSession] = React.useState()
  const [sessionReference, setSessionReference] = React.useState()

  const workSpeechResultsHandler = (results) =>{
    let options = results.value
    if(options){
      for(var i in options){
        let string = options[i].split(' ')
        for (var j in string) {
          let word = string[j].toLowerCase();
          if(word =='stop'){
            setVoiceListening(false)
            let next = string[j+1]?.toLowerCase()
            if(next == 'music' || next == 'spotify'){
              setUpdateSession('pause')
              setWakeListening(true)
              return;
            }
            setStatus('s')
            setPause(true)
            setModal(true)
            return;
          }else if (word=='record'||word=='send'||word=='message'){
            setVoiceListening(false)
            setStatus('r')
            setIsRecording(true)
            setRecordTime(1)
            return;
          }else if (word=='play'||word=='music'){
            setVoiceListening(false)
            setUpdateSession('play')
            setWakeListening(true)
            return;
          }else if ( word=='pause'){
            setVoiceListening(false)
            setUpdateSession('pause')
            setWakeListening(true)
            return;
          }
        }
      }
    }
  }
  const confirmationSpeechResultHandler = (results)=> {
    let options = results.value
    if(options){
      for(var i in options){
        let string = options[i].split(' ')
        for (var j in string) {
          let word = string[j].toLowerCase();
          if(word=='stop' || word=='yes' || word=='yeah'){
            setStatus('f')
            setPause(true)
            return;
          }else if(word=='no'||word=='continue'){
            setStatus('w')
            setPause(false)
            setModal(false)
            return;
          }
        }
      }
    }
  }
  const speechEndHandler = (error)=> {
    console.log('STOPD');
  }
  const checkTokenExpired = ()=> {
    let yesterday = new Date()
    if(!storedToken)return;
    yesterday.setDate(yesterday.getDate()+1)
    if(storedToken.expires <= new Date().getTime()){
      setRefresh(true)
    }else{
      setSpotifyToken(storedToken.access)
    }
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
            setWakeListening(false)
          })
        setPorcupineReady(true)
      } catch (e) {
        console.log('Error starting porcu',e);
      }
    }

    props.navigation.addListener('beforeRemove',(e)=>{
      e.preventDefault()
    })
    setSessionReference(db.collection('sessions').doc(props.route.params.session.id))
    setPause(false)
    allowRecordIos()
    setPorcupine()
    return () => {
      Voice.cancel()
      Voice.stop()
      Voice.destroy()
      that.porcupineManager?.delete()
      that.porcupineReady = null
    }
  },[])
  //sessionsReference
  //set session listener
  React.useEffect(() => {
    let that = this;
    if(sessionReference){
      that.sessionListener =
        sessionReference.onSnapshot((snapshot) => {
          let data = snapshot.data()
          let playback = data?.playback
          if(playback){
            console.log('iupdatinggg',playback);
            setPlayInfo(playback)
          }
        })
      that.messagesListener =
        sessionReference.collection('messages')
          .orderBy('time')
          .limit(1)
          .onSnapshot((snapshot) => {
            snapshot.forEach((message, i) => {
              let messageData = message.data()
              messageData.id = message.id
              if(messageData.status == 's' && messageData.user !== user.uid){
                  console.log(`${messageData.id}.${messageData.fileType}`);
                  setMessageId(`${messageData.id}.${messageData.fileType}`)
              }
            });
        })
    }
    return () => {
      if(that.sessionListener)that.sessionListener()
      if(that.messagesListener)that.messagesListener()
    }
  },[sessionReference])
  //updateSession
  //updates Session based on state param
  React.useEffect(() => {
    switch(updateSession){
      case 'play':
        sessionReference.update({
          playback : {
            uri : playbackInfo.uri,
            status : 'p',
            image :playbackInfo.image
          }
        })
        setUpdateSession('')
        break;
      case 'pause':
        sessionReference.update({
          playback : {
            uri : playbackInfo.uri,
            status : 's',
            image :playbackInfo.image
          }
        })
        setUpdateSession('')
        break;
    }
  },[updateSession])
  //wakeListening
  //sets an interval to activate in case long time passed and voice is not voiceListening
  React.useEffect(()=>{
    let that = this
    if(!that) return;
    if(porcupineReady && wakeListening != 'started'){
      if(wakeListening) {
        that.porcupineManager?.start().then((started)=> {
          if(started){
            console.log('sisaaaaa');
          }
        })
      }else {
        that.porcupineManager?.stop().then((stopped)=> {
          if(stopped){
            setVoiceListening(true)
          }
        })
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
  //voiceListening - wakeListening
  //starts an interval in case listening deactives
  React.useEffect(()=>{
    let that = this
    if( voiceListening && !wakeListening ){
      that.timer = setInterval(()=>{
        console.log('a ver?');
        if(!wakeListening && voiceListening){
          setVoiceListening(false)
          setWakeListening(true)
        }
      },10000)
    }else if(wakeListening){
      clearInterval(that.timer)
    }
    return () => {
      clearInterval(that.timer)
    }
  },[voiceListening,wakeListening])
  //status
  //changes speech handlers
  React.useEffect(()=>{
    switch (status) {
      case 'w':
        Voice.onSpeechResults = workSpeechResultsHandler
        Voice.onSpeechEnd = speechEndHandler
        setWakeListening(true)
        break;
      case 's':
        Voice.onSpeechResults = confirmationSpeechResultHandler
        Voice.onSpeechEnd = speechEndHandler
        setTimeout(()=>setVoiceListening(true),100)
        break;
      case 'f':
        setVoiceListening(false)
        props.navigation.addListener('beforeRemove',(e)=>{
          props.navigation.dispatch(e.data.action)
        })
        let db = firebase.firestore()
        let sessionReference = db.collection('sessions')
        sessionReference.add({users:[user.uid,'asdf'],status:'f'})
          .then((doc)=>{
            setPause(true)
            setModal(false)
            props.navigation.navigate('home')
          })
          .catch((e)=>{console.log(e);})
        break;
    }
  },[status])
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
      setTimeout(()=>{ record()},100)
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
  //isSending
  //creates plaback object with uri and reproduces audio
  React.useEffect(()=>{
    async function playMessage(){
      setIsReproducing(true)
      try {
      const uri = await firebase.storage().ref(storeMessageId).getDownloadURL();
      const soundObj = new Audio.Sound()
        await soundObj.loadAsync({uri :  uri },{shouldPlay : true})
        setMessageDuration(1)
        setMessageId()
      } catch (e) {
        console.log('error playing',e);
      }
    }
    if(storeMessageId)playMessage()
  },[storeMessageId])
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
    }
  },[messageDuration])
  //spotify tokens
  //check if spotify is authorized
  React.useEffect(()=>{
    if(storedToken){
      setSpotifyAv(true)
      setSpotifyCall('getDevices')
    }
  },[storedToken])
  //tokenExpired, Spotifycall
  //calls a spotify function if token isnt expired
  React.useEffect(()=>{
    const client = new SpotifyWebApi()
    async function play(){
      console.log('playback', playbackInfo);
      try {
        await client.play({
          uris: [playbackInfo.uri],
          device_id: playbackDevice,
          position_ms: 0
        })
      } catch (e) {
        console.log('error playing',e);
        setSpotifyCall('')
      }

      setSpotifyCall('')
    }
    async function pause(){
      await client.pause({})
      setSpotifyCall('')
    }
    async function getSaved(){
      try {
        const tracks = await client.getMySavedTracks({limit:1})
        if (tracks?.items[0]) setPlayInfo({
          uri : tracks.items[0].track.uri,
          image : tracks.items[0].track.album.images[0].url,
          next : '',
          status : 'x'
        });
      } catch (e) {
        console.warn('error with saved tracks',e);
      }
      setSpotifyCall('')
    }
    async function getDevices(){
      const client = new SpotifyWebApi()
      client.setAccessToken(spotifyToken)
      setSpotifyCall('')
      try {
        const result = await client.getMyDevices()
        if(result){
          let devices = result.devices
          if(devices?.length == 0) {
            setPlaybackDevice()
          }
          devices.forEach((device, i) => {
            if(device.type == "Smartphone"){
              setPlaybackDevice(device.id)
              setSpotifyCall('getSaved')
            }
          });
        }
      } catch (e) {
        // console.log('response',e);
      }
    }
    if(spotifyToken&&spotifyCall) {
      client.setAccessToken(spotifyToken)
      switch (spotifyCall) {
        case 'play':
            play()
            setWakeListening(true)
          break;
        case 'getSaved':
            getSaved()
          break;
        case 'pause':
            pause()
            setWakeListening(true)
          break;
        case 'getDevices':
            getDevices()
          break;
      }
    }
    if(spotifyCall)checkTokenExpired()
  },[spotifyToken,spotifyCall])
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
      }
    }
  },[playbackInfo])


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
      <View style={styles.header}>
      </View>
      <View style={{flex:10}}>
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
              ):(isSending &&(
                  <View>
                    <ActivityIndicator style={{flex:2}}/>
                  </View>
                ))
              )}
            </View>
            <View style={{flex:2}}></View>
          </View>
        </View>
        <View>
          <View style={styles.horizontalView}>
            <View style={{flex:1}}></View>
            {spotifyAv? (
              playbackDevice? (
                  <View>
                    <Image style={{height:200, width:200}} source={{ uri:playbackInfo?.image }}/>
                  </View>
                ) : (
                  <View>
                    <Text>{playbackDevice}</Text>
                    <Text>Spotify app is not open, please open it and come back</Text>
                  </View>
                )
            ):(
              <View><Text>authroize spotify to share your music</Text></View>
            )}
            <View style={{flex:1}}></View>
          </View>
        </View>
        <View style={{flex:2}}></View>
      </View>
      <View style={{flex:1}}></View>
    </View>
  )
}
