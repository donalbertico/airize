import * as React from 'react'
import * as firebase from 'firebase'
import Toast from 'react-native-toast-message'
import {styles} from '../styles'
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, SafeAreaView} from 'react-native'
import {Text, Image, Button, Input } from 'react-native-elements'
import useUserRead from '../../hooks/useUserRead'

import NavBar from '../components/bottomNavComponent'

export default function FeedbackScreen(props) {
  const [user] = useUserRead('get')
  const [subject, setSubject] = React.useState()
  const [message, setMessage] = React.useState()
  const sendFeedback = () => {
    if(!subject || !message) return Toast.show({text1:'Incorrect data',
            text2: 'make sure you fill the feedback form' ,
            type : 'error',
            position : 'bottom',
            visibilityTime: 4000})
    let db = firebase.firestore()
    db.collection('feedbacks').add({
      user : user,
      subject : subject,
      message : message
    }).then(doc => {
      Toast.show({text1:'Thank you',
        text2: 'feedback sent' ,
        type : 'success',
        position : 'bottom',
        visibilityTime: 4000})
      props.navigation.navigate('edit')
    })
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{flex:1}}>
          <View style={styles.alignCentered}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Ionicons size={30} name="arrow-back-outline" color='#E8E8E8'/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{justifyContent : 'center'}}>
          <Text style={styles.h2_ligth}>Feedack</Text>
        </View>
        <View style={{flex:1}}></View>
        <View style={{flex:2, justifyContent:'center'}}>
          <Button title='SEND'
            onPress={sendFeedback}/>
        </View>
      </View>
      <View style={{flex:7, padding : 15}}>
        <View style={styles.verticalJump}></View>
        <Input placeholder='Subject' value={subject}
          onChangeText={(subject)=>setSubject(subject)}></Input>
        <Input placeholder='Message' value={message}
          numberOfLines= {4}
          onChangeText={(message)=>setMessage(message)}></Input>
      </View>
      <NavBar navigation={props.navigation} route={4}/>
    </SafeAreaView>
  )
}
