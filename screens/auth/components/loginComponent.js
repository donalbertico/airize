import React from 'react'
import * as firebase from 'firebase'
import {styles} from '../../styles'
import * as Facebook from 'expo-facebook'
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
  const [reload,setReload] = React.useState(false)

  const handleLogin = () => {
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
  const handleFbLogin = () => {
    async function fbLogin() {
      // try {
        await Facebook.initializeAsync({
          appId: '447773566952295'
        })
        const {type, token} = await Facebook.logInWithReadPermissionsAsync({
          permissions: ['email']
        })
        if(type == 'success'){
          // const credential = firebase.auth.FacebookAuthProvider.credential(token)
          if (credential) {
            console.log(credential);
            // firebase.auth().signInWithCredential(credential).catch((e) => {
            //   console.log(e);
            //   if(e) throw e
            // })
          }
        }
      // } catch (e) {
      //   console.warn(e);
      // }
    }
    fbLogin()
  }
  const handleGoogle = () => {

  }
  React.useEffect(() => {
    if(assets){
      setFbUri(assets.facebook)
      setGoogleUri(assets.google)
      setReload(false)
    }else{
      setReload(true)
      setAssets(true)
    }
  },[assets])
  React.useEffect(() => {
    if(reload){
      setTimeout(()=>setAssets('get'),200)
    }
  },[reload])
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
                  <TouchableOpacity onPress={handleGoogle}>
                    <Image style={styles.authProviders} source={{uri:googleUri}}/>
                  </TouchableOpacity>
                  <View style={{flex:1}}></View>
                  <TouchableOpacity onPress={handleFbLogin}>
                    <Image style={styles.authProviders} source={{uri:fbUri}}/>
                  </TouchableOpacity>
                  <View style={{flex:3}}></View>
                </View>
              </View>
            </View>
          </>
        )}
    </View>
  )
}
