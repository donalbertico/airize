import * as React from 'react'
import { PermissionsAndroid } from 'react-native';
import Contacts from 'react-native-contacts';
import DateTimePicker from '@react-native-community/datetimepicker'
import { View, FlatList, Text, TouchableOpacity, Modal} from 'react-native'
import * as firebase from 'firebase'
import {styles} from './styles'
import 'firebase/firestore'
import useUserRead from '../hooks/useUserRead'

import NavBar from './components/bottomNavComponent'

export default function FriendsScreen(props){
  const [friends,setFriends] = React.useState()
  const [user,readUser] = useUserRead('get')
  const [sessionsReference,setSessionsReference] = React.useState()
  const [showCalendar,setShowCalendar] = React.useState(false)
  const [candidate,setCandidate] = React.useState()
  const [date,setDate] = React.useState(new Date())

  const createSession = (date) => {
    setShowCalendar(false)
    if(!date) return;
    sessionsReference.add({
        users: [candidate,user.uid],
        status: 'c',
        dueDate : firebase.firestore.Timestamp.fromDate(date),
        host : user.uid
      })
      .then((doc)=>{
        console.log('created');
      })
      .catch((e)=>{console.log(e);})
  }

  React.useEffect(() => {
    async function getContacts(){
      try {
        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            'title': 'Contacts',
            'message': 'This app would like to view your contacts.',
            'buttonPositive': 'Please accept bare mortal'
          }
        )

      } catch (e) {
        console.log('error in contacts',e);
      }
    }
    if(user.uid){
      let db = firebase.firestore()
      setSessionsReference(db.collection('sessions'))
      db.collection('users').get()
        .then((docs) => {
          let friendsArr = []
          docs.forEach((item, i) => {
            let friend = item.data()
            friend.id = item.id
            friendsArr = [...friendsArr,friend]
          });
          setFriends(friendsArr)
          getContacts()

        })
    }
  },[user])

  return (
    <View style={styles.container}>
      <Modal transparent={true} visible={showCalendar}>
        <View style={styles.alignCentered}>
          <View style={styles.modalView}>
            <Text h4>Please choose a date</Text>
          </View>
        </View>
      </Modal>
      {showCalendar && (
        <DateTimePicker value={date}
          onChange={(e,date) => {createSession(date)}}/>
      )}
      <View style={{flex:1}}>
      </View>
      <View style={{flex:5}}>
        <FlatList data={friends} renderItem={
            ({item}) =>
            <View style={styles.sessionItem}>
              <TouchableOpacity
                onPress={()=>{ setCandidate(item.id);setShowCalendar(!showCalendar)}}>
                <Text>{item.firstName} {item.lastName}</Text>
              </TouchableOpacity>
            </View>
          }/>
      </View>
      <View style={{flex:1}}>
        <NavBar navigation={props.navigation}/>
      </View>
    </View>
  )
}
