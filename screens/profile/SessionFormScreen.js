import * as React from 'react'
import * as firebase from 'firebase'
import DateTimePicker from '@react-native-community/datetimepicker'
import Toast from 'react-native-toast-message'
import {View, TouchableOpacity,Platform } from 'react-native'
import {Text, Button} from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons'
import {styles} from '../styles'
import useUserRead from '../../hooks/useUserRead'
import useProfilePicture from '../../hooks/useProfilePicture'

import NavBar from '../components/bottomNavComponent'

export default function SessionFormScreen(props) {
  const [host,readUser] = useUserRead('get')
  const [showCalendar,setShowCalendar] = React.useState(false)
  const [showTimer,setShowTimer] = React.useState(false)
  const [guests,setGuests] = React.useState([])
  const [date,setDate] = React.useState(new Date())
  const [formated,setFormated] = React.useState()
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
    }else{
      setShowTimer(false)
    }
  }
  const createSession = () => {
    let db = firebase.firestore()
    let ref = db.collection('sessions')
    ref.add({
        users: [guests[0].uid,host.uid],
        status: 'c',
        dueDate : firebase.firestore.Timestamp.fromDate(date),
        host : host.uid
      })
      .then((doc)=>{
        Toast.show({text1:'Invitation sent',
          type : 'success',
          position : 'bottom',
          visibilityTime: 4000})
        props.navigation.navigate('home',{refresh : true})
      })
      .catch((e)=>{console.log(e);})
  }

  React.useEffect(() => {
    if(props.route.params.guests) setGuests(props.route.params.guests)
  },[props.route.params])
  React.useEffect(() => {
    let formated = date.toLocaleString('default', {month: 'long'}).split(' ')
    if (formated[1]) setFormated(`${formated[0]} ${formated[1]} ${formated[2]}`)
    else setFormated(`${formated[0]} ${date.getDate()}`)
  },[date])

  return (
    <View style={styles.container}>
      <View style={styles.verticalJump}></View>
      <View style={{flex:6}}>
        <View style={styles.horizontalView}>
          <View style={{flex:1}}></View>
          <View style={{flex:8}}>
            <Text h4>new workout with</Text>
            {guests && (<Text h3>{guests[0]?.firstName} {guests[0]?.lastName}</Text>)}
            <View style={styles.verticalSpace}></View>
            {platformIOS ? (
              <DateTimePicker mode="datetime" value={date}
                onChange={(e,date) => {setDate(date)}}/>
            ) : (
              <>
                <TouchableOpacity onPress={()=>setShowCalendar(!showCalendar)}>
                  <View><Text><Ionicons name="ios-calendar" size={20}/> Date : {formated}</Text></View>
                  <View><Text><Ionicons name="time-outline" size={20}/> Time : {date.getHours()} : {date.getMinutes()}</Text></View>
                </TouchableOpacity>
                {showCalendar ? (
                  <DateTimePicker mode="datetime" value={date}
                    onChange={(e,date) => {handleDateChanged(date)}}/>
                ) : (
                  <>
                  <View style={styles.verticalSpace}></View>
                  <View style={styles.verticalSpace}></View>
                  </>
                )}
                {showTimer && (
                  <DateTimePicker mode="time" value={date}
                    onChange={(e,time) => {handleTimeChanged(time)}}/>
                )}
              </>
            )}
            <Button buttonStyle={styles.buttonStyle} title='submit' onPress={() => createSession()}></Button>
          </View>
          <View style={{flex:1}}></View>
        </View>
      </View>
      <View style={{flex:1}}>
        <NavBar navigation={props.navigation}/>
      </View>
    </View>
  )
}
