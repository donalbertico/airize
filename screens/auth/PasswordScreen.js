import * as React from 'react'
import {styles} from '../styles'
import {Asset} from 'expo-asset'
import {Text, Input, Button, Image} from 'react-native-elements'
import { View,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView
} from 'react-native'
import useAssetStore from '../../hooks/useAssetStore'

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
        setMsg('check your inbox and come back to login')
      })
      .catch((e)=>{
        setMsg(e.message)
        setLoading(false)
      })
  }
  handleReset = () => {
    if(password != repeat){
      setMsg('passwords must match')
      return;
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
              setMsg(e.message)
              setLoading(false)
            })
        })
        .catch((e)=>{
          setMsg(e.message)
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
                  {loading?(
                    <ActivityIndicator size='large' color='#EA6132'/>
                    ):(change? (
                      <View>
                        <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='current' value={current} onChangeText={(current)=>setCurrent(current)}></Input>
                        <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='password' value={password} secureTextEntry={true} onChangeText={(password)=>setPass(password)}></Input>
                        <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='repeat password' value={repeat} secureTextEntry={true} onChangeText={(repeat)=>setRepeat(repeat)}></Input>
                        <Button title='change password' onPress={handleReset}/>
                      </View>
                    ):(
                      <View>
                        <Input style={styles.ligthText}
                          inputContainerStyle={styles.inputContainer}
                          placeholder='Email' value={email}
                          rightIcon = {
                            <Image style={styles.inputIcon} source={{uri: icons?.email}} />
                          }
                          onChangeText={(email)=>setEmail(email)}/>
                        <Button title='Reset Password' buttonStyle= {styles.buttonStyle} onPress={handleSendMail}/>
                      </View>
                    ))}
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
    </SafeAreaView>
  )
}
