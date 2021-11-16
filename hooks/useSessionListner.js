import * as React from 'react'
import * as firebase from 'firebase'
import 'firebase/firestore'

import useUserRead from './useUserRead'


export default function useSessionListner() {
  const [sessionsReference,setSessionsReference] = React.useState()
  const [sessStarting,setSessStarting] = React.useState(false)
  const [latentSession,setLatentSession] = React.useState()
  

  const setNewReferenceListener = () => {
    let start = new Date()
    let end = new Date()
    start.setUTCHours(0,0,0,0)
    end.setUTCHours(23,59,59,999)
    return sessionsReference
      .where('users', 'array-contains', user.uid)
      .where('dueDate' ,'>=', start)
      .where('dueDate' ,'<', end)
      .onSnapshot((snapshot) => {
        let sessArray = []
        setLatentSession('')
        snapshot.forEach((sess, i) => {
          let session = sess.data()
          let sessDate = new firebase.firestore.Timestamp(session.dueDate.seconds,session.dueDate.nanoseconds)
          sessDate = sessDate.toDate()
          session.id = sess.id
          session.dueDate = `${sessDate.getHours()} : ${sessDate.getMinutes()}`
          setLatentSession(session)
          if(session.status == 'a') sessArray = [...sessArray,session]
          if(session.status == 'r') setSessStarting(true)
        });
      })
  }


}
