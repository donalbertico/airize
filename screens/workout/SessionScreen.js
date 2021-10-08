import * as React from 'react'
import * as firebase from 'firebase'
import { Audio } from 'expo-av'
import 'firebase/firestore'
import Voice from '@react-native-voice/voice'
import {View,TouchableOpacity,Modal,ActivityIndicator} from 'react-native'
import {Text} from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import {styles} from '../styles'
import Timer from './components/timerComponent'
import useUserRead from '../../hooks/useUserRead'

export default function SessionScreen(props){
  const [isRecording,setIsRecording] = React.useState(false)
  const [pause,setPause] = React.useState(true)
  const [listening,setListening] = React.useState(true)
  const [status,setStatus] = React.useState('w') //[w:work,r:record,s:stopping,p:playing]
  const [check,setCheck] = React.useState(0)
  const [recordTime,setRecordTime] = React.useState(0)
  const [showModal,setModal] = React.useState(false)
  const [user] = useUserRead('get')
  const [time,setWorkTime] = React.useState()
  const [recording,setRecording] = React.useState()
  const [isReproducing,setIsReproducing] = React.useState(false)
  const [message,setMessage] = React.useState()
  const [messageDuration,setMessageDuration] = React.useState(0)
  const [isSending,setSending] = React.useState(false)
  const sessId = '3npzsgvRcjqObSfJ8UJD'
  const [sessRef,setRf] = React.useState()
  const [recordUri,setRecordUri] = React.useState()
  const [storeMessageName,setMessageName] = React.useState()

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
  const setSession = () =>{
  }

  React.useEffect(()=>{
    //onMount hook
    props.navigation.addListener('beforeRemove',(e)=>{
      e.preventDefault()
    })
    setListening(true)
    async function askPermit(){
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
    askPermit()
    let db = firebase.firestore();
    setRf(db.collection('sessions').doc(sessId).collection('messages'))
    setPause(false)
  },[])
  React.useEffect(()=>{
    //status
    //changes speech handlers
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
  },[listening,props.route.name])
  React.useEffect(()=>{
    //recordTime
    //handle record command for (S) seconds
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
      setRecordTime(0)
      setIsRecording(false)
    }
  },[recordTime])
  React.useEffect(()=>{
    //isSending
    //upload message and creates playback object
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
        console.log('topien?');
        if(blob!=null){
          const uriParts = recordUri.split(".");
          const fileType = uriParts[uriParts.length - 1];
          console.log('file',fileType);
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
  React.useEffect(()=>{
    //storeMessageName
    //creates plaback object with uri
    async function playMessage(){
      setIsReproducing(true)
      const uri = await firebase.storage().ref(storeMessageName).getDownloadURL();
      const soundObj = new Audio.Sound()
      console.log('cuantas cuentas',uri);
      try {
        await soundObj.loadAsync({uri})
        setMessageDuration(1)
        await soundObj.playAsync()
      } catch (e) {
        console.log('error playing',e);
      }
    }
    if(storeMessageName&&!isSending)playMessage()
  },[isSending])
  React.useEffect(()=>{
    //messageDuration
    //count for message duration
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

  handleOnTime = (e)=>{
    setWorkTime(e)
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
        <View style={{flex:2}}></View>
      </View>
      <View style={{flex:1}}></View>
    </View>
  )
}
