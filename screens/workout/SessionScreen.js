import * as React from 'react'
import * as firebase from 'firebase'
import { Audio } from 'expo-av'
import 'firebase/firestore'
import Voice from '@react-native-voice/voice'
import {View,TouchableOpacity,Modal} from 'react-native'
import {Text} from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import {styles} from '../styles'
import Timer from './components/timerComponent'
import useUserRead from '../../hooks/useUserRead'

export default function SessionScreen(props){
  const [recording,setRecording] = React.useState(false)
  const [pause,setPause] = React.useState(false)
  const [listening,setListening] = React.useState(true)
  const [status,setStatus] = React.useState('w') //[w:work,r:record,s:stopping]
  const [check,setCheck] = React.useState(0)
  const [showModal,setModal] = React.useState(false)
  const [user] = useUserRead('get')
  const [time,setWorkTime] = React.useState()

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
            }
          }
      }
  }
  const confirmationSpeechResultHandler = (results)=>{
    let options = results.value
    if(options){
      console.log('aca?',options);
      for(var i in options){
        if(options[i]=='stop'||options[i]=='yes'){
          setListening(false)
          Voice.destroy()
          setStatus('f')
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
    props.navigation.addListener('beforeRemove',(e)=>{
      e.preventDefault()
    })
    setListening(true)
  },[])

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
        db.settings({ experimentalForceLongPolling: true })
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

  handleOnTime = (e)=>{
    console.log('time',e);
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
              {recording?(
                <View>
                  <Ionicons name="mic" size={70} color='black' onPress={handleListen}/>
                </View>
              ):(
                 <View></View>
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
