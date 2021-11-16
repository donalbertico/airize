import { useEffect, useState} from 'react'
import * as Contacts from 'expo-contacts';
import * as firebase from 'firebase'
import 'firebase/firestore'
import useUserRead from './useUserRead'

export default function useAirizers(){
  const [user] = useUserRead('get')
  const [contacts, setContacts] = useState()
  const [friends, setFriends] = useState()
  const [users, setUsers] = useState()

  useEffect(() => {
    async function getContacts(){
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if(status == 'granted'){
          const { data } = await Contacts.getContactsAsync();
          if (data.length > 0) setContacts(data)
        }
      } catch (e) {
        console.log('error in contacts',e);
      }
    }
    if(user?.uid){
      let db = firebase.firestore()
      db.collection('users')
        .get()
        .then((docs) => {
          let userArray = []
          docs.forEach((item, i) => {
            let userData = item.data()
            userData.uid = item.id
            if(userData.uid !== user.uid)userArray = [...userArray,userData]
          });
          setUsers(userArray)
        })
        getContacts()
    }
  },[user])
  useEffect(() => {
    if(contacts && users){
      let friends = []
      setFriends(friends)
      contacts.forEach((contact, i) => {
        contact.emails.forEach((email, j) => {
          users.forEach((userData, y) => {
            if(email.email == userData.email) friends = [...friends,
              {...contact,
                uid : userData.uid,
                picture : userData.picture,
                email : userData.email
               }]
          });
        });
      });
      setFriends(friends)
    }
  },[contacts,users])

  return [friends,contacts]
}
