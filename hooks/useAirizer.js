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
    for (var i = 0; i < num1.length; i++) {
      if (num2.includes( num1[i] )){
        count++
      }
    }
    if (count > 7) return true
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
      let friends = []
      setFriends(friends)
      contacts.forEach((contact, i) => {
        let added = false
        contact.emails?.forEach((email, j) => {
          users.forEach((userData, y) => {
            if(email.email == userData.email) {
              added = true
              friends = [...friends,
                          {...contact,
                            uid : userData.uid,
                            picture : userData.picture,
                            email : userData.email,
                            phone : userData.phone
                           }]
            }
          });
        });
        if(!added) contact.phoneNumbers?.forEach((phone, j) => {
          users.forEach((userData, y) => {
            if(userData.number && compareNumbers(phone.number, userData.number)) {
              friends = [...friends,
                          {...contact,
                            uid : userData.uid,
                            picture : userData.picture,
                            email : userData.email,
                            phone : userData.phone
                           }]
              }
            });
          });
      });
      setFriends(friends)
    }
  },[contacts,users])

  return [friends,contacts]
}
