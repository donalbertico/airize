import * as React from 'react'
import { View, Modal } from 'react-native'
import { Text, Button } from 'react-native-elements'
import { styles } from '../styles'
import * as firebase from 'firebase'
import 'firebase/firestore'
import useNotifications from '../../hooks/useNotifications'
import * as Notifications from 'expo-notifications';
import useUserRead from '../../hooks/useUserRead'
import useAppState from '../../hooks/useAppState'

export default function SessionsListenerComponent(props) {
  const [sessStarting, setSessStarting] = React.useState(false)
  const [latentSession,setLatentSession] = React.useState()
  const [notified, setNotified] = React.useState(false)
  const [sessions,setSessions] = React.useState()
  const [isHost,setIsHost] = React.useState(false)
  const [checkingSession, setCheckingSession] = React.useState()
  const [news, setNews] = React.useState(0)
  const [lastNews, setLastNews] = React.useState()
  const [fromNotification, setFromNotification] = React.useState(false)
  const [notification, setNotification, setNotificationService] = useNotifications()
  const responseListener = React.useRef()
  const [user,setUser] = useUserRead('get')
  const [nextState] = useAppState()
  const setNewReferenceListener = (that) => {
    if(user?.uid){
      let db = firebase.firestore()
      setNotificationService(true)
      that.listener =  db.collection('sessions')
      .where('users', 'array-contains', user.uid)
      .where('status', 'in', ['c','r','s','p','ap','al','a'])
      .onSnapshot((snapshot) => {
        let sessArray = []
        snapshot.forEach((sess, i) => {
          let session = sess.data()
          let sessDate = new firebase.firestore.Timestamp(session.dueDate.seconds,session.dueDate.nanoseconds)
          sessDate = sessDate.toDate()
          session.id = sess.id
          session.dueDate = `${sessDate.getHours()} : ${sessDate.getMinutes()}`
          if(session.status == 'c') sessArray = [...sessArray,session]
          if(session.status == 'r')  {
            if(session.host == user.uid) setIsHost(true)
            setSessStarting(true)
            setNotified(false)
            setLatentSession(session)
          }
          setCheckingSession(session)
        });
      });
    }
  }
  const startSession = () => {
    let db = firebase.firestore()
    db.collection('sessions').doc(latentSession.id)
      .update({status : 's'})
  }
  const deleySession = () => {
    let db = firebase.firestore()
    db.collection('sessions').doc(latentSession.id)
      .update({status : 'a'})
  }
  React.useEffect(() => {
    let that = this
    if(user?.uid){
      let db = firebase.firestore()
      setNotificationService(true)
      that.listener =  db.collection('sessions')
      .where('users', 'array-contains', user.uid)
      .where('status', 'in', ['c','r','s','p','ap','al','a'])
      .onSnapshot((snapshot) => {
        let sessArray = []
        snapshot.forEach((sess, i) => {
          let session = sess.data()
          let sessDate = new firebase.firestore.Timestamp(session.dueDate.seconds,session.dueDate.nanoseconds)
          sessDate = sessDate.toDate()
          session.id = sess.id
          session.dueDate = `${sessDate.getHours()} : ${sessDate.getMinutes()}`
          if(session.status == 'c') sessArray = [...sessArray,session]
          if(session.status == 'r')  {
            if(session.host == user.uid) setIsHost(true)
            setSessStarting(true)
            setNotified(false)
            setLatentSession(session)
          }
          setCheckingSession(session)
        });
      });
    }
  },[user])
  React.useState(() => {
    let that = this;
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      setFromNotification(true)
    })
    return () => {
      if(that?.listener) that.listener()
    }
  },[])
  // checkingSession
  // redirect to session if latent status 'started'
  React.useEffect(() => {
    if(checkingSession){
      if(checkingSession.status != 'f' && checkingSession.status != 'r'
          && checkingSession.status != 'a' &&  checkingSession.status != 'c'
          &&  checkingSession.status != 'd'){
        setFromNotification(false)
        setSessStarting(false)
        props.navigation.navigate('session',{ session : checkingSession})
      }
      if(news != lastNews){
        if(checkingSession.status == 'c' && checkingSession.host != user.uid) {
          setNotification({title : 'invited'})
        }
        if(news > 0) setLastNews(news)
      }
      if(!fromNotification){
        if(checkingSession.status == 'r' && checkingSession.host != user.uid)
          setNotification({title : 'starting'})
      }
      if(checkingSession.status == 'a') {
        if(latentSession?.id == checkingSession.id) {
          setLatentSession()
          setSessStarting(false)
          if(checkingSession.host == user.uid) Toast.show({text1:'Partner not ready',
                  text2: 'go to events and start again later',
                  type : 'info', position : 'bottom', visibilityTime: 4000})
        }
      }
    }
  },[checkingSession])
  //sessions
  //set news for notification control
  React.useEffect(() => {
    if(sessions) {
      setNews(sessions.length)
      if(firstLoad)  {
        setLastNews(sessions.length)
        setFirstLoad(false)
      }
    }
  },[sessions])
  // nextState
  React.useEffect(() => {
    let that = this;
    if(nextState == 'active'){
      if(!that?.listener){
        that.listener = setNewReferenceListener(that)
      }
    }else if(nextState == 'background'){
      if(that?.listener){
        setNotified(false)
        that.listener = null
        that.listener = setNewReferenceListener(that)
      }
    }
  },[nextState])

  return (
    <View>
      <Modal transparent={true} visible={sessStarting}>
        <View style={styles.alignCentered}>
          <View style={styles.modalView}>
            {isHost? (
              <View>
                <Text>
                  Waiting for your partner to start
                </Text>
                <View></View>
              </View>
            ): (
              <View>
                <View style={{marginBottom:20}}>
                  <Text>
                    Your friend is ready to start
                  </Text>
                </View>
                <View style={styles.horizontalView}>
                  <View>
                    <Button type='clear'
                      titleStyle= {styles.secondaryButton}
                      title='Not yet' onPress={() => deleySession()}/>
                  </View>
                    <View style={{width : 30}}></View>
                  <View>
                    <Button type='clear' title='Start' onPress={() => startSession()}/>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )
}
