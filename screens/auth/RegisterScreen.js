import * as React from 'react'
import * as firebase from 'firebase'
import 'firebase/firestore'
import {View,ImageBackground, SafeAreaView} from 'react-native'
import { Input, Text , Button, Image} from 'react-native-elements'
import {styles} from '../styles'
import useUserStore from '../../hooks/useUserStore'
import useAssetStore from '../../hooks/useAssetStore'


export default function RegisterScreen(props){
  const [email,setEmail] = React.useState('')
  const [error,setError] = React.useState('')
  const [password,setPass] = React.useState('')
  const [repeat,setRepeat] = React.useState('')
  const [name,setName] = React.useState('')
  const [lastName,setLastName] = React.useState('')
  const [loading,setLoading] = React.useState(false)
  const [setUser] = useUserStore()
  const [splashUrl,setSplash] = React.useState()
  const [logoUrl,setLogo] = React.useState()
  const [assets,setAssets] = useAssetStore()

  handleRegister = ()=> {
    if(password != repeat){
      setError('passwords must match')
      return;
    }
    setLoading(true)
    const user = {
      uid : '00cheat00',
      email : email,
      firstName : name,
      lastName : lastName,
      description : 'provisional'
    }
    firebase
        .auth()
        .createUserWithEmailAndPassword(email,password)
        .then(credentials => {
          setLoading(false)
          user.uid = credentials.user.uid
          setUser(user)
          credentials.user.updateProfile({
                displayName : `${name} ${lastName}`
              })
              .then(()=>{
                let db = firebase.firestore();
                db.collection('users').doc(user.uid).set({
                      firstName: name,
                      lastName: lastName,
                    })
                    .then(()=>{
                      console.log('setting user',user);
                    })
                  })
                  .catch((e) => {
                    console.warn(e);
                    setLoading(false)
                  })
              },(e)=>{
                console.warn(e)
                setLoading(false)
                setError(e.message)
              })
  }

  React.useEffect(()=>{
    if(assets){
      setSplash(assets.splash)
      setLogo(assets.logo)
    }
  },[assets])

  return(
    <SafeAreaView style={styles.container}>
      <ImageBackground style={styles.image} source={{uri:splashUrl}}>
        <View style={{flex:2}}>
          <View style={styles.horizontalView}>
            <View style={{flex:2}}></View>
            <View style={{flex:6}}>
              <View >
                <Image style={{width:210, height:215,justifyContent:'center'}}source={{uri:logoUrl}}/>
              </View>
            </View>
            <View style={{flex:2}}></View>
          </View>
        </View>
        <View style={{flex:3}}>
          <View style={{flex:5}}>
              <View style={styles.horizontalView}>
                <View style={{flex:1}}></View>
                <View style={{flex:10}}>
                  <View style={styles.blackContainer}>
                    <View style={{margin:10}}>
                      <Text>{error}</Text>
                      <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer}
                        placeholder='first name' onChangeText={(name)=>setName(name)}></Input>
                      <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer}
                        placeholder='last name' onChangeText={(lastName)=>setLastName(lastName)}></Input>
                      <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer}
                        placeholder='email' onChangeText={(email)=>setEmail(email)}></Input>
                      <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer}
                        placeholder='password' value={password} secureTextEntry={true} onChangeText={(password)=>setPass(password)}></Input>
                      <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer}
                        placeholder='repeat password' value={repeat} secureTextEntry={true} onChangeText={(repeat)=>setRepeat(repeat)}></Input>
                      <Button buttonStyle={styles.buttonStyle} title='register'onPress={handleRegister} loading={loading}/>
                    </View>
                  </View>
                </View>
                <View style={{flex:1}}></View>
              </View>
          </View>
        </View>
        <View style={{flex:1}}></View>
      </ImageBackground>
    </SafeAreaView>
  )
}
