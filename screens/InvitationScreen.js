import * as React from 'react'
import { View, Modal } from 'react-native'
import { Button } from 'react-native-elements'
import {styles} from './styles'
import * as firebase from 'firebase'
import 'firebase/firestore'
import useUserRead from '../hooks/useUserRead'
import SessionList from './components/sessionListComponent'

export default function InvitationScreen(props) {
  const [user,setUser] = useUserRead('get')
  const [sessions, setSessions] = React.useState()
  const [showDialog, setShowDialog] = React.useState(false)
  const [candidate, setCandidate] = React.useState(false)
  const [updateSess, setUpdateSess] = React.useState()
  const [sessionsReference,setSessionsReference] = React.useState()

  const handleSessionSelected = (session) => {
    setCandidate(session)
    setShowDialog(true)
  }

  React.useEffect(() => {
    let db = firebase.firestore()
    setSessionsReference(db.collection('sessions'))
  },[])
  React.useEffect(() => {
    let that = this
    if(user?.uid && sessionsReference){
      sessionsReference
          .where('users', 'array-contains', user.uid)
          .where('status', '==', 'c')
          .onSnapshot((snapshot) => {
            let invitations = []
            setSessions()
            snapshot.forEach((sess, i) => {
              let session = sess.data()
              let sessDate = new firebase.firestore.Timestamp(session.dueDate.seconds,session.dueDate.nanosecond)
              sessDate = sessDate.toDate()
              session.id = sess.id
              session.dueDate = `${sessDate.getHours()} : ${sessDate.getMinutes()}`
              invitations = [...invitations,sess]
            });
            setSessions(invitations)
          })
    }
    return () => {
      if(sessionsReference){
        // setSessionsReference()
      }
    }
  }, [user,sessionsReference])
  React.useEffect(() => {
    switch (updateSess) {
      case 'accept':
        sessionsReference.doc(candidate.id)
            .update({status : 'a'})
            .then(() => {
              setUpdateSess('')
              setShowDialog(false)
              props.navigation.navigate('home',{refresh : true})
            })
        break;
      case 'decline':
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
    <View>
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
      <SessionList sessions={sessions} handleSessionSelected={handleSessionSelected} />
    </View>
  )
}
