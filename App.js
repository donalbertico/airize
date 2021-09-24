import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import { Text, View } from 'react-native';
import { ThemeProvider } from 'react-native-elements'
import {theme} from './screens/styles'

import useCachedResources from './hooks/useCachedResources'
import LoginScreen from './screens/auth/LoginScreen.js'
import EditScreen from './screens/profile/EditScreen.js'
import RegisterScreen from './screens/auth/RegisterScreen.js'
import HomeScreen from './screens/HomeScreen.js'
import WellcomeScreen from './screens/WellcomeScreen.js'
import LoadingScreen from './screens/LoadingScreen.js'
import Logout from './screens/auth/components/logoutComponent'

const Stack = createStackNavigator();


export default function App(props) {
  const [auth] = useCachedResources()
  const [showApp, setShowApp] = React.useState(false)

  React.useEffect(()=>{
    if(auth == true) setShowApp(true)
    if(!auth) setShowApp(false)
  },[auth])

  return (
    <ThemeProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown:false}}>

          {showApp? (
            <>
              <Stack.Screen name='home' component={HomeScreen}/>
              <Stack.Screen name='edit' component={EditScreen}/>
            </>
          ) : (
            <>
              <Stack.Screen name='wellcome' component={WellcomeScreen}/>
              <Stack.Screen name='register' component={RegisterScreen}/>
              <Stack.Screen name='login' component={LoginScreen}/>
              <Stack.Screen name='loading' component={LoadingScreen}/>
            </>
          )}


        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
