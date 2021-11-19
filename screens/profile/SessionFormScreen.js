import * as React from 'react'
import * as firebase from 'firebase'
import DateTimePicker from '@react-native-community/datetimepicker'
import Toast from 'react-native-toast-message'
import {View, TouchableOpacity,Platform, SafeAreaView } from 'react-native'
import {Text, Button, Input} from 'react-native-elements'
import { Dropdown } from 'react-native-element-dropdown';
import { Ionicons } from '@expo/vector-icons'
import {styles} from '../styles'
import useUserRead from '../../hooks/useUserRead'
import useAirizers from '../../hooks/useAirizer'
import useProfilePicture from '../../hooks/useProfilePicture'

import NavBar from '../components/bottomNavComponent'
import UserItem from '../components/userItemComponent'


export default function SessionFormScreen(props) {
  const [host,readUser] = useUserRead('get')
  const [friends,contacts] = useAirizers()
  const [showCalendar,setShowCalendar] = React.useState(false)
  const [showTimer,setShowTimer] = React.useState(false)
  const [pickDate,setPickDate] = React.useState(false)
  const [guests,setGuests] = React.useState([])
  const [date,setDate] = React.useState(new Date())
  const [stringDate,setStringDate] = React.useState()
  const [formated,setFormated] = React.useState()
  const [selected,setSelected] = React.useState()
  const [location,setLocation] = React.useState()
  const [selectedId,setSelectedI] = React.useState()
  const [platformIOS,setPlatformIOS] = React.useState(Platform.OS == 'ios' ? true : false)

  const handleDateChanged = (date) => {
    if(date){
      setDate(date)
      setShowCalendar(false)
      setShowTimer(true)
    }else{
      setShowCalendar(false)
    }
  }
  const handleTimeChanged = (date) => {
    if(date){
      setDate(date)
      setShowTimer(false)
      setPickDate(false)
    }else{
      setPickDate(false)
      setShowTimer(false)
    }
  }
  const createSession = () => {
    let db = firebase.firestore()
    let ref = db.collection('sessions')
    if (!selected) return Toast.show({
      text1:'No Airizer selected',
      type : 'error',
      position : 'bottom',
      visibilityTime: 4000
    })
    let sess = {
        users: [selected.uid,host.uid],
        status: 'c',
        dueDate : firebase.firestore.Timestamp.fromDate(date),
        host : host.uid,
      }
    if(location) sess.hostLocation = location
    ref.add(sess)
      .then((doc)=>{
        Toast.show({text1:'Invitation sent',
          type : 'success',
          position : 'bottom',
          visibilityTime: 4000})
        setTimeout(() =>
          props.navigation.navigate('invitations')
        ,2000)
      })
      .catch((e)=>{console.log(e);})
  }

  React.useEffect(() => {
    if(props.route.params.guests) {
      setGuests(props.route.params.guests)
      setSelected(props.route.params.guests[0])
    }
  },[props.route.params])
  React.useEffect(() => {
    let formated = date.toLocaleString('default', {month: 'long'}).split(' ')
    console.log(formated);
    if (formated[1]) {
      setFormated(`${formated[0]} ${formated[1]} ${formated[2]}`)
      setStringDate(`${formated[0]} ${formated[1]} ${formated[2]} - ${date.getHours()} : ${date.getMinutes()}`)
    }
    else {
      setFormated(`${formated[0]} ${date.getDate()}`)
      setStringDate(`${date.getDate()}  ${formated[0]} - ${date.getHours()} : ${date.getMinutes()}`)
    }
  },[date])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{flex:1}}>
          <View style={styles.alignCentered}>
            <TouchableOpacity onPress={() => props.navigation.goBack()}>
              <Ionicons size={30} name="arrow-back-outline" color='#E8E8E8'/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{justifyContent : 'center'}}>
          <Text style={styles.h2_ligth}>New Event</Text>
        </View>
        <View style={{flex:1}}></View>
        <View style={{flex:2, justifyContent:'center'}}>
          <Button title='SAVE'
            onPress={() => createSession()}/>
        </View>
      </View>
      <View style = {{flex:1,backgroundColor : '#D9D9D9', justifyContent: 'center'}}>
          <Dropdown
              data = {friends}
              placeholder = {friends? !selected&&('Select Airizer') : ('no contacts')}
              valueField = 'uid'
              selected = {selected?.uid}
              renderLeftIcon = {() => (
                <View style={{marginLeft: 10}}>
                  <Text style={styles.subtext}>{selected && ('with')}</Text>
                  <Text>{selected?.firstName} {selected?.lastName}</Text>
                </View>
              )}
              renderRightIcon={() => (
                <View style={{marginRight:20}}>
                  <Ionicons size={30} name="chevron-down" color='#343F4B'/>
                </View>
              )}
              onChange = {item => {setSelected(item)}}
              renderItem = { (item) => { return (
                  <UserItem user={item}/>
              )}}/>
      </View>
      <View style={{flex:7, padding:15}}>
        <View style={styles.verticalJump}></View>
        <Input placeholder='Location (optional)'
          inputContainerStyle={{marginBottom : -10}}
          value= {location}
          onChangeText= {(value) => setLocation(value)}/>
          <Text style={styles.subtext}>Time</Text>
          { !pickDate ? (
            <Input
              value= {stringDate}
              onFocus= {() => {
                setPickDate(true)
                setShowCalendar(true)
              }}/>
          ) : (
            platformIOS ? (
              <DateTimePicker mode="datetime" value={date}
                onChange={(e,date) => {
                  setDate(date)
                  setPickDate(false)
                }}/>
            ) : (
              <>
                {showCalendar && (
                  <DateTimePicker mode="datetime" value={date}
                    onChange={(e,date) => {handleDateChanged(date)}}/>
                )}
                {showTimer && (
                  <DateTimePicker mode="time" value={date}
                    onChange={(e,time) => {
                      handleTimeChanged(time)
                    }}/>
                )}
              </>
            )
          )}
      </View>
      <View>
        <NavBar navigation={props.navigation}/>
      </View>
    </SafeAreaView>
  )
}
