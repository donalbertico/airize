import React from 'react'
import * as firebase from 'firebase'
import 'firebase/firestore'
import {styles} from '../../styles'
import * as fb from 'expo-facebook'
import * as Google from 'expo-auth-session/providers/google'
import useAssetStore from '../../../hooks/useAssetStore'
import useUserStore from '../../../hooks/useUserStore'
import {Input,Text,Button,Image} from 'react-native-elements'
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView} from 'react-native'

export default function Login({handleRecoverPassword}) {
  const [email, setEmail] = React.useState('')
  const [password, setPass] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error,setError] = React.useState('')
  const [assets, setAssets] = useAssetStore()
  const [googleUri, setGoogleUri] = React.useState()
  const [fbUri, setFbUri] = React.useState()
  const [icons, setIcons] = React.useState()
  const [reload,setReload] = React.useState(false)
  const [setUser] = useUserStore()
  const [request, googleResponse, promptAsync] = Google.useAuthRequest({
    androidClientId : "795853275646-ae8uvd3aq1h31pf5uflniq4o5mu3vhik.apps.googleusercontent.com",
    iosClientId : "795853275646-rt73098b5dt37oqt6nk7o8925d339iv9.apps.googleusercontent.com"
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
        await fb.initializeAsync({ appId: '426169569075169'})
        const {type, token} = await fb.logInWithReadPermissionsAsync()
        if(type == 'success'){
          const credential = firebase.auth.FacebookAuthProvider.credential(token)
          if (credential) {
            console.log(credential);
            firebase.auth().signInWithCredential(credential)
            .then((doc) => {
              doc.user.provider = 'fb'
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
      setIcons(assets.login)
      setReload(false)
    }else{
      setReload(true)
      setAssets(true)
    }
  },[assets])
  React.useEffect(() => {
    if(reload) setTimeout(()=>setAssets('get'),200)
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
              doc.user.provider = 'google'
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
  },[googleResponse])

  return (
    <View>
        {loading?(
          <ActivityIndicator size='large' color='#EA6132'/>
        ):(
          <>
            <Text style={styles.ligthText}>{error}</Text>
            <Input style={styles.ligthText}
              inputContainerStyle={styles.inputContainer}
              placeholder='Email' value={email}
              rightIcon = {
                <Image style={styles.inputIcon} source={{uri: icons?.email}} />
              }
              onChangeText={email => setEmail(email)}/>
            <Input style={styles.ligthText}
              inputContainerStyle={styles.inputContainer}
              placeholder='Password' value={password} secureTextEntry={true}
              rightIcon = {
                <Image style={styles.largeInputIcon} source={{uri: icons?.password}} />
              }
              onChangeText={password => setPass(password)}/>
            <Button title='Sign In' buttonStyle={styles.buttonStyle} onPress={handleLogin}/>
            <View style={{marginTop:10}}>
                <View style={{marginTop :10}}>
                  <View style={styles.horizontalView}>
                    <View style={{flex:1}}></View>
                    <TouchableOpacity onPress={handleGoogle}>
                      <Image style={styles.authProviders} source={{uri:googleUri}}/>
                    </TouchableOpacity>
                    <View style={{flex:2}}></View>
                    <TouchableOpacity onPress={handleFbLogin}>
                      <Image style={styles.authProviders} source={{uri:fbUri}}/>
                    </TouchableOpacity>
                    <View style={{flex:3}}></View>
                    <View style={{alignItems : 'center'}}>
                      <TouchableOpacity onPress={()=>handleRecoverPassword()}>
                        <Text style={styles.underlined}>forgot password?</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
            </View>
          </>
        )}
    </View>
  )
}
