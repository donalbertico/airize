import * as React from 'react'
import * as firebase from 'firebase'
import {styles} from '../styles'
import {Asset} from 'expo-asset'
import Toast from 'react-native-toast-message'
import {Text, Input, Button, Image} from 'react-native-elements'
import { View,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView
} from 'react-native'
import { Ionicons } from '@expo/vector-icons';
import useAssetStore from '../../hooks/useAssetStore'

import NavBar from '../components/bottomNavComponent'

export default function PasswordScreen(props){
  const [change,setChange] = React.useState(false)
  const [email,setEmail] = React.useState('')
  const [current,setCurrent] = React.useState('')
  const [password,setPass] = React.useState('')
  const [repeat,setRepeat] = React.useState('')
  const [loading,setLoading] = React.useState(false)
  const [msg,setMsg] = React.useState('')
  const [splashUrl,setSplash] = React.useState()
  const [logoUrl,setLogo] = React.useState()
  const [icons,setIcons] = React.useState()
  const [assets,setAssets] = useAssetStore()

  handleSendMail = () => {
    setLoading(true)
    firebase.auth()
      .sendPasswordResetEmail(email)
      .then(()=>{
        setLoading(false)
        Toast.show({ text1: 'Recovery sent',
          text2 : 'check your inbox and come back to login',
          type : 'success',
          position : 'bottom',
          visibilityTime: 5000
        })
      })
      .catch((e)=>{
        Toast.show({text1: 'Error',
          text2 : e.message,
          type : 'error',
          position : 'bottom',
          visibilityTime: 5000
        })
        setLoading(false)
      })
  }
  handleReset = () => {
    if(password != repeat){
      return Toast.show(
        {text1: 'Error',
        text2 : 'password dont match',
        type : 'error',
        position : 'bottom',
        visibilityTime: 5000
      })
    }
    setLoading(true)
    const user = firebase.auth().currentUser
    const credentials = firebase.auth.EmailAuthProvider.credential(user.email,current)
    user.reauthenticateWithCredential(credentials)
        .then(()=>{
          user.updatePassword(password)
            .then(()=>{
              setLoading(false)
              props.navigation.navigate('home')
              console.warn('password changed')
            }).catch((e)=>{
              Toast.show({text1: 'Error',
                text2 : e.message,
                type : 'error',
                position : 'bottom',
                visibilityTime: 5000
              })
              setLoading(false)
            })
        })
        .catch((e)=>{
          Toast.show({text1: 'Error',
            text2 : e.message,
            type : 'error',
            position : 'bottom',
            visibilityTime: 5000
          })
          setLoading(false)
        })
  }

  React.useEffect(()=>{
    setChange(props.route.params?.change? (true):(false))
  },[props.route.params])

  React.useEffect(()=>{
    if(assets){
      setSplash(assets.splash)
      setLogo(assets.logo)
      setIcons(assets.login)
    }
  },[assets])

  return(
    <SafeAreaView style={change? (styles.container) : (styles.coloredContainer)}>
      {loading?(
        <ActivityIndicator size='large' color='#EA6132'/>
        ):(change? (
          <>
            <View style={styles.header}>
              <View style={{flex:1}}>
                <View style={styles.alignCentered}>
                  <TouchableOpacity onPress={() => props.navigation.goBack()}>
                    <Ionicons size={30} name="arrow-back-outline" color='#E8E8E8'/>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{justifyContent : 'center'}}>
                <Text style={styles.h2_ligth}>Personal Info</Text>
              </View>
              <View style={{flex:1}}></View>
              <View style={{flex:2, justifyContent:'center'}}>
                <Button title='RESET'
                  onPress={handleReset}/>
              </View>
            </View>
            <View style={styles.verticalJump}></View>
            <View style={{flex:7, padding : 15}}>
                <Input placeholder='current' value={current} onChangeText={(current)=>setCurrent(current)}></Input>
                <Input placeholder='password' value={password} secureTextEntry={true} onChangeText={(password)=>setPass(password)}></Input>
                <Input placeholder='repeat password' value={repeat} secureTextEntry={true} onChangeText={(repeat)=>setRepeat(repeat)}></Input>
            </View>
            <NavBar navigation={props.navigation} route={4}/>
          </>
        ):(
          <>
            <View style={{flex:2}}>
              <View style={styles.alignCentered}>
                      <Image
                        style={{width:170, height:175,justifyContent:'center'}}
                        source={{uri:logoUrl}}/>
              </View>
            </View>
            <View style={{flex:2}}>
              <View style={styles.horizontalView}>
                <View style={{flex:1}}></View>
                <View style={{flex:12}}>
                  <View style={styles.blackContainer}>
                    <Text>{msg}</Text>
                    <View style={styles.horizontalView}>
                      <View style={{flex:1}}></View>
                      <View style={{flex:12}}>
                          <Input style={styles.ligthText}
                            inputContainerStyle={styles.inputContainer}
                            placeholder='Email' value={email}
                            rightIcon = {
                              <Image style={styles.inputIcon} source={{uri: icons?.email}} />
                            }
                            onChangeText={(email)=>setEmail(email)}/>
                          <Button title='Reset Password' buttonStyle= {styles.buttonStyle} onPress={handleSendMail}/>
                          <View style={styles.verticalDiv}></View>
                      </View>
                      <View style={{flex:1}}></View>
                    </View>
                  </View>
                </View>
                <View style={{flex:1}}></View>
              </View>
            </View>
            <View style={{flex:1}}></View>
          </>
        ))}

    </SafeAreaView>
  )
}
