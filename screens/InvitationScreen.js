import * as React from 'react'
import { View, Modal, SafeAreaView, TouchableOpacity } from 'react-native'
import { Button, Text } from 'react-native-elements'
import {styles} from './styles'
import Toast from 'react-native-toast-message'
import * as firebase from 'firebase'
import * as Analytics from 'expo-firebase-analytics';
import 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons';
import useUserRead from '../hooks/useUserRead'
import SessionList from './components/sessionListComponent'

import NavBar from './components/bottomNavComponent'

export default function InvitationScreen(props) {
  const [user,setUser] = useUserRead('get')
  const [sessions, setSessions] = React.useState([])
  const [sent, setSent] = React.useState([])
  const [showDialog, setShowDialog] = React.useState(false)
  const [candidate, setCandidate] = React.useState(false)
  const [updateSess, setUpdateSess] = React.useState()
  const [sessionsReference,setSessionsReference] = React.useState()
  const [usersReference,setUsersReference] = React.useState()
  const handleSessionSelected = (session) => {
    setCandidate(session)
    setShowDialog(true)
  }
  const setNewReferenceQuery = () => {
    return sessionsReference
        .where('users', 'array-contains', user.uid)
        .where('status', '==', 'c')
        .get()
        .then((snapshot) => {
          setSessions(sessions => [])
          setSent(sent => [])
          let sameMonth = true
          let lastMonth = ''
          snapshot.forEach((sess, i) => {
            let session = sess.data()
            let sessDate = new firebase.firestore.Timestamp(session.dueDate.seconds,session.dueDate.nanoseconds)
            sessDate = sessDate.toDate()
            session.id = sess.id
            session.dueTime = `${sessDate.getHours()} : ${sessDate.getMinutes()}`
            let formated = sessDate.toLocaleString('default', {month: 'long', day :'numeric'}).split(' ')
            if (formated[1]) {
              session.day = formated[2]
              session.Nday = formated[0]
              session.month = formated[1]
            }
            else session.dueDate = `${formated[0]} ${sessDate.getDate()}`
            if(session.host != user.uid) {
              if(session.month != lastMonth) session.dateLabel = true
              usersReference.doc(session.host)
                .get()
                .then((doc) => {
                  session.host = doc.data()
                  setSessions( sessions => [...sessions,session])
                })
            }else {
              let sessUsers = session.users
              sessUsers.splice(sessUsers.indexOf(user.uid))
              if(session.month != lastMonth) session.dateLabel = true
              usersReference.doc(sessUsers[0])
                .get()
                .then((doc) => {
                  session.partner = doc.data()
                  setSent( sent => [...sent,session])
                })
            }
            lastMonth = session.month
          });
        })
  }

  React.useEffect(() => {
    let that = this
    let db = firebase.firestore()
    setSessionsReference(db.collection('sessions'))
    setUsersReference(db.collection('users'))
    Analytics.setCurrentScreen('invitations');
    return () => {
      if(that?.sessionsReference) that.sessionsReference = null
      setSessions()
      setSent()
    }
  },[])
  React.useEffect(() => {
    let that = this
    if(user?.uid && sessionsReference && that) that.sessionsReference = setNewReferenceQuery()
  }, [user,sessionsReference])
  React.useEffect(() => {
    switch (updateSess) {
      case 'accept':
        setSessions([])
        sessionsReference.doc(candidate.id)
            .update({status : 'a'})
            .then(() => {
              setUpdateSess('')
              setShowDialog(false)
              props.navigation.navigate('home',{refresh : true})
            })
        break;
      case 'decline':
        setSessions([])
        sessionsReference.doc(candidate.id)
            .update({status : 'd'})
            .then(() => {
              setUpdateSess('')
              setShowDialog(false)
              props.navigation.navigate('home')
            })
        break;
    }
  },[updateSess])

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
          <Text style={styles.h2_ligth}>Invitations</Text>
        </View>
        <View style={{flex:3}}></View>
      </View>
      <Modal transparent={true} visible={showDialog}>
        <View style = {styles.alignCentered}>
          <View style={styles.modalView}>
            <View style={styles.horizontalView}>
              <Button title='Accept' onPress={() => setUpdateSess('accept')}/>
              <View></View>
              <Button title='Decline' type='clear' onPress={() => setUpdateSess('decline')}/>
            </View>
          </View>
        </View>
      </Modal>
      <View style={{flex:8}}>
        <View style={styles.separator}>
          <Text style={styles.subtext}>Invitations</Text>
        </View>
        { !sessions[0] && (
          <View style={{height : 50}}>
            <View style={styles.alignCentered}>
              <Text style={styles.subtext}>no invitations</Text>
            </View>
          </View>
        )}
        <SessionList sessions={sessions} handleSessionSelected={handleSessionSelected}/>
        <View style={styles.separator}>
          <Text style={styles.subtext}>Sent invitations</Text>
        </View>
        { !sent[0] && (
          <View style={{height : 50}}>
            <View style={styles.alignCentered}>
              <Text style={styles.subtext}>no sent invitations</Text>
            </View>
          </View>
        )}
        <SessionList sessions={sent}/>
      </View>
      <NavBar navigation={props.navigation} route={3}/>
    </SafeAreaView>
  )
}
