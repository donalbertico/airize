import * as React from 'react'
import {styles} from '../styles'
import {Asset} from 'expo-asset'
import {Text, Input, Button, Image} from 'react-native-elements'
import {View,ActivityIndicator,TouchableOpacity,ImageBackground} from 'react-native'
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
    }
  },[assets])

  return(
    <View style={styles.container}>
      <ImageBackground style={styles.image} source={{uri:splashUrl}}>
        <View style={{flex:2}}>
          <View style={styles.horizontalView}>
            <View style={{flex:1}}></View>
            <View style={{flex:6}}>
              <View style={styles.percentageFull}>
                  <Image style={{width:'95%', height:'99%',justifyContent:'center'}}source={{uri:logoUrl}}></Image>
              </View>
            </View>
            <View style={{flex:1}}></View>
          </View>
        </View>
        <View style={{flex:2}}>
          <View style={styles.horizontalView}>
            <View style={{flex:1}}></View>
            <View style={{flex:8}}>
              <View style={styles.blackContainer}>
                <Text>{msg}</Text>
                <View style={styles.horizontalView}>
                  <View style={{flex:1}}></View>
                  <View style={{flex:8}}>
                    {loading?(
                      <ActivityIndicator/>
                      ):(change? (
                        <View>
                          <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='current' value={current} onChangeText={(current)=>setCurrent(current)}></Input>
                          <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='password' value={password} secureTextEntry={true} onChangeText={(password)=>setPass(password)}></Input>
                          <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='repeat password' value={repeat} secureTextEntry={true} onChangeText={(repeat)=>setRepeat(repeat)}></Input>
                          <Button title='change password' onPress={handleReset}/>
                        </View>
                      ):(
                        <View>
                          <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='Email' value={email} onChangeText={(email)=>setEmail(email)}/>
                          <Button title='send ecovery link' onPress={handleSendMail}/>
                          <View style={styles.horizontalView}>
                            <View style={{flex:1}}></View>
                            <TouchableOpacity onPress={()=>{props.navigation.navigate('login')}}>
                              <Text style={{marginTop:20}}>Login</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                  </View>
                  <View style={{flex:1}}></View>
                </View>
              </View>
            </View>
            <View style={{flex:1}}></View>
          </View>
        </View>
        <View style={{flex:1}}></View>
      </ImageBackground>
    </View>
  )
}
