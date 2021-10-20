import * as React from 'react'
import { View, FlatList, Text, TouchableOpacity} from 'react-native'
import * as firebase from 'firebase'
import {styles} from './styles'
import 'firebase/firestore'
import useUserRead from '../hooks/useUserRead'

import NavBar from './components/bottomNavComponent'

export default function FriendsScreen(props){
  const [friends,setFriends] = React.useState()
  const [user,readUser] = useUserRead('get')
  const [sessionsReference,setSessionsReference] = React.useState()

  const createSession = (friendId) => {
    console.log(friendId);
    sessionsReference.add({
        users: [user.uid,friendId],
        status: 'c',
        dueDate : firebase.firestore.FieldValue.serverTimestamp()
      })
      .then((doc)=>{
        console.log('created');
      })
      .catch((e)=>{console.log(e);})
  }

  React.useEffect(()=>{
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
        })
    }
  },[user,])

  return (
    <View style={styles.container}>
      <View style={{flex:1}}>
      </View>
      <View style={{flex:5}}>
        <FlatList data={friends} renderItem={
            ({item}) =>
            <View style={styles.sessionItem}>
              <TouchableOpacity onPress={()=>createSession(item.id)}>
                <Text>{item.description}</Text>
              </TouchableOpacity>
            </View>
          }/>
      </View>
      <View style={{flex:1}}>
        <NavBar/>
      </View>
    </View>
  )
}
