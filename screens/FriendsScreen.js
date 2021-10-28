import * as React from 'react'
import * as Contacts from 'expo-contacts';
import { View, FlatList, Text, TouchableOpacity, Modal} from 'react-native'
import * as firebase from 'firebase'
import {styles} from './styles'
import 'firebase/firestore'
import useUserRead from '../hooks/useUserRead'

import NavBar from './components/bottomNavComponent'

export default function FriendsScreen(props){
  const [users,setUsers] = React.useState()
  const [friends,setFriends] = React.useState()
  const [user,readUser] = useUserRead('get')
  const [sessionsReference,setSessionsReference] = React.useState()
  const [showCalendar,setShowCalendar] = React.useState(false)
  const [candidate,setCandidate] = React.useState()
  const [date,setDate] = React.useState(new Date())
  const [contacts, setContacts] = React.useState()

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
        const { status } = await Contacts.requestPermissionsAsync();
        console.log('?',status);

        if(status == 'granted'){
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.Emails],
          });

          if (data.length > 0) {
            setContacts(data)
          }
        }
      } catch (e) {
        console.log('error in contacts',e);
      }
    }
    if(user.uid){
      let db = firebase.firestore()
      setSessionsReference(db.collection('sessions'))
      db.collection('users').get()
        .then((docs) => {
          let userArray = []
          docs.forEach((item, i) => {
            let user = item.data()
            user.uid = item.id
            userArray = [...userArray,user]
          });
          setUsers(userArray)
        })
        getContacts()
    }
  },[user])
  React.useEffect(() => {
    if(contacts && users){
      let friends = []
      contacts.forEach((contact, i) => {
        contact.emails.forEach((email, i) => {
          users.forEach((user, i) => {
            if(email.email == user.email) friends = [...friends, {...contact, uid : user.uid}]
          });
        });
      });
      setFriends(friends)
      console.log(friends);
    }
  },[contacts,users])


  return (
    <View style={styles.container}>
      <View style={{flex:1}}>
      </View>
      <View style={{flex:5}}>
        <FlatList data={friends} renderItem={
            ({item}) =>
            <View style={styles.sessionItem}>
              <TouchableOpacity
                onPress={()=>{ props.navigation.navigate('newSession',{guests : [item] }) }}>
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
