import React from 'react'
import * as firebase from 'firebase'
import 'firebase/firestore'
import {styles} from '../../styles'
import * as fb from 'expo-facebook'
import * as Google from 'expo-auth-session/providers/google'
import useAssetStore from '../../../hooks/useAssetStore'
import useUserStore from '../../../hooks/useUserStore'
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
  const [setUser] = useUserStore()
  const [request, googleResponse, promptAsync] = Google.useAuthRequest({
    androidClientId : "420079497855-u10gcttur504uconei9b163mn3pvnast.apps.googleusercontent.com"
  })

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
  const handleGoogle = () => {
    setLoading(true)
    promptAsync()
  }
  const handleFbLogin = () => {
    async function fblog(){
      try {
        await fb.initializeAsync({ appId: '447773566952295'})
        const {type, token} = await fb.logInWithReadPermissionsAsync({
          permissions: ['public_profile']
        })
        if(type == 'success'){
          const credential = firebase.auth.FacebookAuthProvider.credential(token)
          if (credential) {
            console.log(credential);
            firebase.auth().signInWithCredential(credential)
            .then((doc) => {
              saveUser(doc.user)
            })
            .catch((e) => {
              console.log(e);
              setError(e.message)
              setLoading(false)
            })
          }
        }else {
          setLoading(false)
        }
      } catch (e) {
        console.log(e);
        setLoading(false)
      }
    }
    fblog()
    setLoading(true)
  }
  const saveUser = (newUser) => {
    let db = firebase.firestore();
    let displayName = newUser.displayName.split(' ')
    let user = {
      uid : newUser.uid,
      firstName : displayName[0],
      email : newUser.email
    }
    if(displayName[1]) user.lastName = displayName[1]
    if(newUser.photoURL) user.picture = newUser.photoURL
    setUser(user)
    let ref = db.collection('users').doc(newUser.uid)
    ref.get().then((doc) => {
      if (!doc.exists) ref.set(user).catch((e) => {console.log(e)})
    })
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
  React.useEffect(() => {
    if(googleResponse?.params?.access_token){
      const credential = firebase.auth.GoogleAuthProvider.credential(
        googleResponse.params.id_token,
        googleResponse.params.access_token
      )
      if(credential) {
        let auth = firebase.auth().signInWithCredential(credential)
            .then((doc) => {
              saveUser(doc.user)
            })
            .catch((e) => {
              console.log(e);
              setError(e.message)
              setLoading(false)
            })
      }
    }
  },[googleResponse])

  return (
    <View>
        {loading?(
          <ActivityIndicator size='large' color='#EA6132'/>
        ):(
          <>
            <Text style={styles.ligthText}>{error}</Text>
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
