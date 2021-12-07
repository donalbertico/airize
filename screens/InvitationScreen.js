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
import SessionsListenerComponent from './components/sessionsListenerComponent'

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
            console.log(formated);
            if (formated[3]) {
              session.day = formated[2]=="" ? formated[3] : formated[2]
              session.Nday = formated[0]
              session.month = formated[1]
            } else {
              let formated = sessDate.toLocaleString('default', {month: 'short', weekday: 'short', day: 'numeric'}).split(' ')
              session.day = formated[1]
              session.Nday = formated[0]
              session.month = formated[2]
            }
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
      setSessions([])
      setSent([])
      setSessionsReference()
    }
  },[])
  React.useEffect(() => {
    let that = this
    if(user?.uid && sessionsReference) that.sessionsReference = setNewReferenceQuery()
  }, [user,sessionsReference])
  React.useEffect(() => {
    let that = this
    switch (updateSess) {
      case 'accept':
        setSessions([])
        sessionsReference.doc(candidate.id)
            .update({status : 'a'})
            .then(() => {
              setUpdateSess('')
              setShowDialog(false)
              Toast.show({text1:'Invitation acepted',
                type : 'success',
                position : 'bottom',
                visibilityTime: 4000})
              setTimeout(() =>
                props.navigation.navigate('events')
              ,1000)
            })
        break;
      case 'decline':
        setSessions([])
        sessionsReference.doc(candidate.id)
            .update({status : 'd'})
            .then(() => {
              setUpdateSess('')
              setShowDialog(false)
              Toast.show({text1:'Invitation declined',
                type : 'info',
                position : 'bottom',
                visibilityTime: 4000})
              that.sessionsReference = setNewReferenceQuery()
            })
        break;
    }
  },[updateSess])

  return (
    <SafeAreaView style={styles.container}>
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
          <Text style={styles.h2_ligth}>Invitations</Text>
        </View>
        <View style={{flex:3}}></View>
      </View>
      <Modal transparent={true} visible={showDialog}>
        <View style = {styles.alignCentered}>
          <View style={styles.modalView}>
            <View style={{marginBottom : 10}}>
              <Text>New invitation</Text>
            </View>
            <View style={styles.horizontalView}>
              <View style={{ justifyContent:'center',width : 220}}>
                <View style={styles.line}></View>
              </View>
            </View>
            <View style={styles.horizontalView}>
              <View style={{marginRight: 30}}>
                <Text style={styles.h2}>{candidate.day}</Text>
                <Text>{candidate.Nday}</Text>
              </View>
              <View>
                <Text>{candidate.dueTime}</Text>
                <Text style={styles.subtext}>with {candidate.host?.firstName} {candidate.host?.lastName}</Text>
              </View>
            </View>
            <View style={{marginBottom:15}}></View>
            <View style={styles.horizontalView}>
              <Button title='Decline' type='clear'
                titleStyle= {styles.secondaryButton}
                onPress={() => setUpdateSess('decline')}/>
              <View style={{width : 20}}></View>
              <Button title='Accept' type='clear'
                onPress={() => setUpdateSess('accept')}/>
            </View>
          </View>
        </View>
      </Modal>
      <View style={{flex:8}}>
        <View style={styles.separator}>
          <Text style={styles.subtext}>Invitations</Text>
        </View>
        { (!sessions || !sessions[0]) && (
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
        { (!sent || !sent[0]) && (
          <View style={{height : 50}}>
            <View style={styles.alignCentered}>
              <Text style={styles.subtext}>no pendent invitations</Text>
            </View>
          </View>
        )}
        <SessionList sessions={sent} handleSessionSelected={() => {}}/>
      </View>
      <NavBar navigation={props.navigation} route={3}/>
    </SafeAreaView>
  )
}
