import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { ThemeProvider } from 'react-native-elements'
import {theme} from './screens/styles'
import Toast from 'react-native-toast-message'

import useCachedResources from './hooks/useCachedResources'
import LoginScreen from './screens/auth/LoginScreen.js'
import EditScreen from './screens/profile/EditScreen.js'
import DeleteScreen from './screens/profile/DeleteScreen.js'
import FeedbackScreen from './screens/profile/FeedbackScreen.js'
import PersonalInfoScreen from './screens/profile/PersonalInfoScreen.js'
import RegisterScreen from './screens/auth/RegisterScreen.js'
import SessionScreen from './screens/workout/SessionScreen.js'
import HomeScreen from './screens/HomeScreen.js'
import FriendsScreen from './screens/FriendsScreen.js'
import InvitationScreen from './screens/InvitationScreen.js'
import EventsScreen from './screens/EventsScreen.js'
import LoadingScreen from './screens/LoadingScreen.js'
import SessionFormScreen from './screens/profile/SessionFormScreen.js'
import PasswordScreen from './screens/auth/PasswordScreen.js'

const Stack = createStackNavigator();

export default function App(props) {
  const [auth, ready] = useCachedResources()
  const [showApp, setShowApp] = React.useState(false)
  const [myTheme, setTheme] = React.useState({})

  React.useEffect(()=>{
    if(ready) setTheme(theme)
    if(auth == true && ready) setShowApp(true)
    if(!auth) setShowApp(false)
  },[auth, ready])

  return (
    <ThemeProvider theme={myTheme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown:false}}>
            {showApp? (
              <>
                <Stack.Screen name='home' component={HomeScreen}/>
                <Stack.Screen name='session' component={SessionScreen}/>
                <Stack.Screen name='newSession' component={SessionFormScreen}/>
                <Stack.Screen name='friends' component={FriendsScreen}/>
                <Stack.Screen name='invitations' component={InvitationScreen}/>
                <Stack.Screen name='events' component={EventsScreen}/>
                <Stack.Screen name='personalinfo' component={PersonalInfoScreen}/>
                <Stack.Screen name='edit' component={EditScreen}/>
                <Stack.Screen name='delete' component={DeleteScreen}/>
                <Stack.Screen name='feedback' component={FeedbackScreen}/>
            </>
            ) : (
              <>
                <Stack.Screen name='login' component={LoginScreen}/>
                <Stack.Screen name='register' component={RegisterScreen}/>
              </>
            )}
            <Stack.Screen name='password' component={PasswordScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
      <Toast ref={(ref) => Toast.setRef(ref)}/>
    </ThemeProvider>
  );
}
