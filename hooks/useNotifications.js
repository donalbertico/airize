import React, {useState, useEffect, useRef} from 'react'
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants'

export default function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState()
  const [notifications, setNotification] = useState(false)
  const [message, setMessage] = useState()
  const [user,setUser] = useState(false)

  useEffect(() => {
    async function registerForNotifications() {
      let token;
      const { status: existingStatus} = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus
      if(existingStatus !== 'granted') console.log('Notifications failed');
      try {
        token = (await Notifications.getExpoPushTokenAsync({ experienceId:'@donalbertico/airize' })).data;
        Notifications.setNotificationHandler({
          handleNotification: async() => ({
            shouldShowAlert : true,
            shouldPlaySound: true
          })
        })

        if (Platform.OS === 'android'){
          Notifications.setNotificationChannelAsync('default', {
            name : 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            ligthColor: '#EA6132'
          })
        }
        return token
      } catch (e) {
        console.log('error noti',e);
      }
    }
    if(user) registerForNotifications().then(token => setExpoPushToken(token))

  },[user])

  useEffect(() => {
    let newNotification = {
      to: expoPushToken,
      sound: 'default'
    }
    switch (message?.title) {
      case 'invited':
        newNotification.title = 'New invitation to Airize'
        newNotification.body = `you have been invited to Airize`
        break;
      case 'starting':
        newNotification.title = `Your friend is ready to Airize`
        newNotification.body = 'Start Airizing now!'
        break;
      default:
    }
    async function sendNotification(){
      await fetch('https://exp.host/--/api/v2/push/send',{
                              method: 'POST',
                              headers: {
                                Accept: 'application/json',
                                'Accept-encoding': 'gzip, deflate',
                                'Content-Type': 'application/json'
                              },
                              body: JSON.stringify(newNotification)
                            })
    }
    if(newNotification?.body && expoPushToken) sendNotification()
  },[message,expoPushToken])

  return [message,setMessage,setUser]
}
