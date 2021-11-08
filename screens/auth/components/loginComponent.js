import React from 'react'
import * as firebase from 'firebase'
import {styles} from '../../styles'
import useAssetStore from '../../../hooks/useAssetStore'
import {Input,Text,Button,Image} from 'react-native-elements'
import {View, TouchableOpacity,ActivityIndicator,ImageBackground} from 'react-native'

export default function Login({handleToRegister,handleRecoverPassword}) {
  const [email, setEmail] = React.useState('')
  const [password, setPass] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error,setError] = React.useState('')
  const [assets, setAssets] = useAssetStore()
  const [googleUri, setGoogleUri] = React.useState()
  const [fbUri, setFbUri] = React.useState()

  handleLogin = () => {
    setLoading(true)
    firebase
        .auth()
        .signInWithEmailAndPassword(email,password)
        .then(() => {
          setLoading(false)
        })
        .catch((e) => {
          console.warn(e);
          setError(e.message)
          setLoading(false)
        })
  }
  React.useEffect(() => {
    if(assets){
      setFbUri(assets.facebook)
      setGoogleUri(assets.google)
    }
  },[assets])

  return (
    <View>
        {loading?(
          <ActivityIndicator/>
        ):(
          <>
            <Text>{error}</Text>
            <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='Email' value={email} onChangeText={email => setEmail(email)}/>
            <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='Password' value={password} secureTextEntry={true} onChangeText={password => setPass(password)}/>
            <Button title='Sign In' onPress={handleLogin}/>
            <View style={{marginTop:10}}>
              <View style={styles.horizontalView}>
                <TouchableOpacity onPress={()=>handleToRegister()}>
                  <Text style={styles.ligthText}>Register</Text>
                </TouchableOpacity>
                <View style={{flex:1}}></View>
                <TouchableOpacity onPress={()=>handleRecoverPassword()}>
                  <Text style={styles.ligthText}>forgot my password</Text>
                </TouchableOpacity>
              </View>
              <View style={{marginTop :10}}>
                <View style={styles.horizontalView}>
                  <View style={{flex:3}}></View>
                  <Image style={styles.authProviders} source={{uri:googleUri}}/>
                  <View style={{flex:1}}></View>
                  <Image style={styles.authProviders} source={{uri:fbUri}}/>
                  <View style={{flex:3}}></View>
                </View>
              </View>
            </View>
          </>
        )}
    </View>
  )
}
