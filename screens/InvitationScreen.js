import * as React from 'react'
import { View, Modal } from 'react-native'
import { Button, Text } from 'react-native-elements'
import {styles} from './styles'
import * as firebase from 'firebase'
import 'firebase/firestore'
import useUserRead from '../hooks/useUserRead'
import SessionList from './components/sessionListComponent'

import NavBar from './components/bottomNavComponent'

export default function InvitationScreen(props) {
  const [user,setUser] = useUserRead('get')
  const [sessions, setSessions] = React.useState([])
  const [showDialog, setShowDialog] = React.useState(false)
  const [candidate, setCandidate] = React.useState(false)
  const [updateSess, setUpdateSess] = React.useState()
  const [sessionsReference,setSessionsReference] = React.useState()
  const [usersReference,setUsersReference] = React.useState()

  const handleSessionSelected = (session) => {
    setCandidate(session)
    setShowDialog(true)
  }

  React.useEffect(() => {
    let db = firebase.firestore()
    setSessionsReference(db.collection('sessions'))
    setUsersReference(db.collection('users'))
  },[])
  React.useEffect(() => {
    let that = this
    if(user?.uid && sessionsReference){
      sessionsReference
          .where('users', 'array-contains', user.uid)
          .where('status', '==', 'c')
          .onSnapshot((snapshot) => {
            setSessions([])
            snapshot.forEach((sess, i) => {
              let session = sess.data()
              let sessDate = new firebase.firestore.Timestamp(session.dueDate.seconds,session.dueDate.nanoseconds)
              sessDate = sessDate.toDate()
              session.id = sess.id
              session.dueTime = `${sessDate.getHours()} : ${sessDate.getMinutes()}`
              let formated = sessDate.toLocaleString('default', {month: 'long'}).split(' ')
              if (formated[1]){
                session.dueDate = `${formated[0]} ${formated[1]} ${formated[2]}`
              }else {
                session.dueDate = `${formated[0]} ${sessDate.getDate()}`
              }
              usersReference.doc(session.host)
                .get()
                .then((doc) => {
                  session.host = doc.data()
                  setSessions( sessions => [...sessions,session])
                })
            });
          })
    }
  }, [user,sessionsReference])
  React.useEffect(() => {
    if(sessions){
      let newSessions = []
      sessions.forEach((item, i) => {

      });
    }
  },[sessions])
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
    <View style={styles.container}>
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
      <View style={{flex:1}}>
        <Text h3>Invitations</Text>
      </View>
      <View style={{flex:5}}>
        <SessionList sessions={sessions} handleSessionSelected={handleSessionSelected} />
      </View>
      <View style={{flex:1}}>
        <NavBar navigation={props.navigation}/>
      </View>
    </View>
  )
}
