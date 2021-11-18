import { useEffect, useState} from 'react'
import * as Contacts from 'expo-contacts';
import * as firebase from 'firebase'
import Toast from 'react-native-toast-message'
import 'firebase/firestore'
import useUserRead from './useUserRead'

export default function useAirizers(){
  const [user] = useUserRead('get')
  const [contacts, setContacts] = useState()
  const [friends, setFriends] = useState()
  const [users, setUsers] = useState()
  const compareNumbers = (num1 , num2) => {
    let count = 0
      if (num2.includes( num1.substring(3) )) return true
      else return false
  }

  useEffect(() => {
    async function getContacts(){
      try {
        const { status } = await Contacts.requestPermissionsAsync();
        if(status == 'granted'){
          const { data } = await Contacts.getContactsAsync();
          if (data?.length > 0) setContacts(data)
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
            if(userData.uid !== user.uid) userArray = [...userArray,userData]
          });
          setUsers(userArray)
        })
        .catch((e) => {
          Toast.show({text1:'Error reading users',
            text2: 'Firebase error' ,
            type : 'info', position : 'bottom', visibilityTime: 4000})
        })
        getContacts()
    }
  },[user])
  useEffect(() => {
    if(contacts && users){
      setFriends([])
      users.forEach((userData, u) => {
        contacts.forEach((contact, i) => {
          let added = false
          contact.emails?.forEach((email, j) => {
            if(userData.email == email.email){
              // friends.push({...userData, ... contact})
              setFriends( friends => [...friends,{...userData, ... contact}])
            }
          });
          if(!added) contact.phoneNumbers?.forEach((phone, j) => {
            if(userData.number && compareNumbers(userData.number, phone.number)){
              // friends.push({...userData, ... contact})
              setFriends( friends => [...friends,{...userData, ... contact}])
            }
            });
        });
      });
    }
  },[contacts,users])

  return [friends,contacts]
}
