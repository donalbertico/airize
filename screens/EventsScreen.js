import * as React from 'react'
import * as firebase from 'firebase'
import * as Analytics from 'expo-firebase-analytics';
import { View, TouchableOpacity, SafeAreaView } from 'react-native'
import { Button, Text, FlatList } from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message'
import {styles} from './styles'
import useUserRead from '../hooks/useUserRead'
import SessionList from './components/sessionListComponent'

import NavBar from './components/bottomNavComponent'
import SessionsListenerComponent from './components/sessionsListenerComponent'

export default function EventsScreen(props) {
  const [sessionsReference,setSessionsReference] = React.useState()
  const [usersReference,setUsersReference] = React.useState()
  const [sessions,setSessions] = React.useState()
  const [user,setUser] = useUserRead('get')

  const handleSessionSelected = (session) => {
    if(session.host == user.uid){
        let today = new Date()
        let sessDate = new firebase.firestore.Timestamp(session.dueDate.seconds,session.dueDate.nanoseconds)
        sessDate = sessDate.toDate()
      if(today.getMonth() == sessDate.getMonth() &&
          today.getDate() == sessDate.getDate()) {
            sessionsReference.doc(session.id)
                              .update({
                                status : 'r'
                              })
                              .then(() => props.navigation.navigate('home'))
        }else{
          Toast.show({text1:'Not today',
             text2: 'Workout is not planning for today' ,
             type : 'error', position : 'bottom', visibilityTime: 4000})
        }
    } else {
     Toast.show({text1:'Not the Host',
        text2: 'Just Hosts can start the workout' ,
        type : 'error', position : 'bottom', visibilityTime: 4000})
    }
  }
  const setNewReferenceQuery = () => {
    return sessionsReference
      .where('users', 'array-contains', user.uid)
      .where('status', '==', 'a')
      .get()
      .then((snapshot) => {
        let sessArray = []
        let sameMonth = true
        let lastMonth = ''
        setSessions('')
        snapshot.forEach((sess, i) => {
          let session = sess.data()
          let sessDate = new firebase.firestore.Timestamp(session.dueDate.seconds,session.dueDate.nanoseconds)
          sessDate = sessDate.toDate()
          session.id = sess.id
          session.dueTime = `${sessDate.getHours()} : ${sessDate.getMinutes()}`
          let formated = sessDate.toLocaleString('default', {month: 'long', day: 'numeric'}).split(' ')
          console.log(formated);
          if (formated[3]){
            session.day = formated[2]=="" ? formated[3] : formated[2]
            session.Nday = formated[0]
            session.month = formated[1]
          }else {
            let formated = sessDate.toLocaleString('default', {month: 'short', weekday: 'short', day: 'numeric'}).split(' ')
            session.day = formated[1]
            session.Nday = formated[0]
            session.month = formated[2]
          }
          if(session.month != lastMonth) session.dateLabel = true
          lastMonth = session.month
          if(session.host != user.uid) {
            usersReference.doc(session.host)
              .get()
              .then((doc) => {
                session.host = doc.data()
                setSessions( sessions => [...sessions,session])
              })
          }else {
            let sessUsers = session.users
            sessUsers.splice(sessUsers.indexOf(user.uid))
            usersReference.doc(sessUsers[0])
              .get()
              .then((doc) => {
                session.partner = doc.data()
                setSessions( sessions => [...sessions,session])
              })
          }
        });
        setSessions(sessArray)
      })
  }

  React.useEffect(() => {
    let that = this
    let db = firebase.firestore()
    setSessionsReference(db.collection('sessions'))
    setUsersReference(db.collection('users'))
    Analytics.setCurrentScreen('events');
    return () => {
      that.sessionsReference = null
    }
  },[])

  React.useEffect(() => {
    let that = this
    if(user?.uid && sessionsReference ) that.sessionsReference = setNewReferenceQuery()
  },[user,sessionsReference])

  React.useEffect( () => {
    let that = this
    if(props.route.name == 'events' && !that.sessionsReference && sessionsReference){
      that.sessionsReference = setNewReferenceQuery()
    }
  },[props.route])

  return (
    <View style={styles.container}>
      <SessionsListenerComponent navigation={props.navigation}/>
      <View style={styles.header}>
        <View style={{flex:1}}>
          <View style={styles.alignCentered}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Ionicons size={30} name="arrow-back-outline" color='#E8E8E8'/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{justifyContent : 'center'}}>
          <Text style={styles.h2_ligth}>Plan</Text>
        </View>
        <View style={{flex:3}}></View>
      </View>
      <TouchableOpacity
        onPress = {() => props.navigation.navigate('newSession', {guests : []})}
        style={styles.flatFullButton}>
          <View style={{flex:1}}></View>
          <View style={styles.alignCentered}>
            <Ionicons size={30} name="add" color='#343F4B'/>
          </View>
          <View style={{justifyContent : 'center'}}>
            <Text> New event</Text>
          </View>
          <View style={{flex:6}}></View>
      </TouchableOpacity>
      <View style={{flex:8}}>
        <SessionList sessions={sessions} handleSessionSelected={handleSessionSelected}/>
      </View>
      <NavBar navigation={props.navigation} route={2}/>
    </View>
  )
}
