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
import useAirizers from '../hooks/useAirizer'

import NavBar from './components/bottomNavComponent'
import UserItem from './components/userItemComponent'

export default function FriendsScreen(props){
  const [friends,contacts] = useAirizers()
  const [showCalendar,setShowCalendar] = React.useState(false)
  const [candidate,setCandidate] = React.useState()
  const [date,setDate] = React.useState(new Date())
  const [searchVal, setSearchVal] = React.useState()
  const [searchResult, setSearchResult] = React.useState()
  const [receiver, setReceiver] = React.useState()
  const [receiverNumber, setReceiverNumber] = React.useState()

  React.useEffect(() => {
    if(searchVal) {
      if (contacts) {
        const match = contacts.filter(element => {
          if (element.name.includes(searchVal)) return true
          if (element.emails && element.emails[0]?.email.includes(searchVal)) return true
        })
        if (match) setSearchResult(match)
        else setSearchResult([])
      }
    }
  },[searchVal])
  React.useEffect(() => {
    async function sendSMS(number){
      const { result } = await SMS.sendSMSAsync(
        [number],
        "Hey I'am using Airize,\n\n  I would like to exersize with you, donwload the app here:\n\n airize.com"
      )
      if(result) console.log('result?');
    }
    if(receiver?.id && receiver.phoneNumbers[0]){
      receiver.phoneNumbers[0].number
      sendSMS(receiver.phoneNumbers[0].number)
    }
  },[receiver])

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
              <TouchableOpacity
                style= {{ marginLeft: -5 }}
                onPress={()=>{ setReceiver(item) }}>
                <UserItem user={
                    {...item,
                      email:item.emails? (item.emails[0]?.email) : (' '),
                      picture: item.imageAvailable? item.image.uri : null
                    }}/>
              </TouchableOpacity>
            }/>
      </View>
      <View style={styles.separator}>
        <Text style={styles.subtext}>Airizers</Text>
      </View>
      <View style={{flex:3}}>
        <FlatList data={friends} renderItem={
            ({item}) =>
              <TouchableOpacity
                style= {{ marginLeft: -5 }}
                onPress={() => { props.navigation.navigate('newSession',{guests : [item] }) }}>
                <UserItem user={item}/>
              </TouchableOpacity>
          }/>
      </View>
      <NavBar navigation={props.navigation} route={1}/>
    </View>
  )
}
