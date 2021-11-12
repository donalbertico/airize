import * as React from 'react'
import * as Contacts from 'expo-contacts';
import * as SMS from 'expo-sms'
import { View, FlatList, Text, TouchableOpacity, Modal} from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from 'react-native-elements'
import * as firebase from 'firebase'
import { styles} from './styles'
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
  const [searchVal, setSearchVal] = React.useState()
  const [searchResult, setSearchResult] = React.useState()
  const [receiver, setReceiver] = React.useState()
  const [receiverNumber, setReceiverNumber] = React.useState()

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
        if(status == 'granted'){
          const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.Emails],
          });
          if (data.length > 0) setContacts(data)
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
      setFriends(friends)
      contacts.forEach((contact, i) => {
        contact.emails.forEach((email, i) => {
          users.forEach((user, i) => {
            if(email.email == user.email) friends = [...friends, {...contact, uid : user.uid}]
          });
        });
      });
      setFriends(friends)
    }
  },[contacts,users])
  React.useEffect(() => {
    if(searchVal) {
      const match = contacts.filter(element => {
        if (element.name.includes(searchVal)) return true
        if (element.emails[0]?.email.includes(searchVal)) return true
      })
      if (match) setSearchResult(match)
      else setSearchResult([])
    }
  },[searchVal])
  React.useEffect(() => {
    async function getContact(){
      const contact = await Contacts.getContactByIdAsync(receiver.id)
      if(contact) setReceiverNumber(contact.phoneNumbers[0]?.number)
    }
    if(receiver?.id){
      getContact()
    }
  },[receiver])
  React.useEffect(() => {
    async function sendSMS(){
      const { result } = await SMS.sendSMSAsync(
        [receiverNumber],
        "Hey I'am using Airize,\n\n  I would like to exersize with you, donwload the app here:\n\n airize.com"
      )
      if(result) console.log('result?');
    }
    if(receiverNumber){
      sendSMS()
    }
  },[receiverNumber])

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{flex:1}}>
          <View style={styles.alignCentered}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Ionicons size={30} name="arrow-back-outline" color='#E8E8E8'/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{justifyContent : 'center'}}>
          <Text style={styles.h2_ligth}>Invite</Text>
        </View>
        <View style={{flex:3}}></View>
      </View>
      <View style={{flex:4}}>
        <SearchBar lightTheme containerStyle={styles.searchBar}
          inputContainerStyle={styles.searchBar}
          placeholder="Search for contacts"
          value={searchVal}
          onChangeText={(val) => setSearchVal(val)}/>
        <View style={styles.verticalJump}></View>
        <FlatList data={searchResult} renderItem={
              ({item}) =>
              <View style={styles.sessionItem}>
                <TouchableOpacity
                  onPress={() => {setReceiver(item)}}>
                  <Text>{item.firstName} {item.lastName}</Text>
                </TouchableOpacity>
              </View>
            }/>
      </View>
      <View style={{flex:3}}>
        <View><Text>Friends :</Text></View>
        <View style={styles.verticalJump}></View>
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
      <NavBar navigation={props.navigation} route={1}/>
    </View>
  )
}
