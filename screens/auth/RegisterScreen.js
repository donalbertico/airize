import * as React from 'react'
import * as firebase from 'firebase'
import * as Linking from 'expo-linking'
import Toast from 'react-native-toast-message'
import 'firebase/firestore'
import {View,ImageBackground, SafeAreaView, TouchableOpacity} from 'react-native'
import { Input, Text , Button, Image} from 'react-native-elements'
import CheckBox from '@react-native-community/checkbox'
import {styles} from '../styles'
import useUserStore from '../../hooks/useUserStore'
import useAssetStore from '../../hooks/useAssetStore'

export default function RegisterScreen(props){
  const [assets,setAssets] = useAssetStore()
  const [setUser] = useUserStore()
  const [email,setEmail] = React.useState('')
  const [error,setError] = React.useState('')
  const [password,setPass] = React.useState('')
  const [repeat,setRepeat] = React.useState('')
  const [name,setName] = React.useState('')
  const [lastName,setLastName] = React.useState('')
  const [loading,setLoading] = React.useState(false)
  const [splashUrl,setSplash] = React.useState()
  const [logoUrl,setLogo] = React.useState()
  const [termsConditions,setTermsConditions] = React.useState()

  const handleRegister = ()=> {
    if(password != repeat) return Toast.show({
        text1: 'Passwords must match',
        position : 'bottom',
        type: 'error'})
    if(!termsConditions) return Toast.show({
        text1: 'You must accept terms and conditions',
        position : 'bottom',
        type: 'error'})
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
                      email: email
                    })
                    .then(()=>{
                      console.log('setting user',user);
                    })
                  })
                  .catch((e) => {
                    setLoading(false)
                    Toast.show({
                        text1: 'Error creating your profile',
                        text2: e.message,
                        position : 'bottom',
                        type: 'error'})
                  })
              },(e)=>{
                setLoading(false)
                Toast.show({
                    text1: 'Error creating your profile',
                    text2: e.message,
                    position : 'bottom',
                    type: 'error'})
              })
          .catch((e) => {
            setLoading(false)
            Toast.show({
                text1: 'Error creating your profile',
                text2: e.message,
                position : 'bottom',
                type: 'error'})
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
          <View style={styles.alignCentered}>
            <Image style={{width:170, height:175}} source={{uri:logoUrl}}/>
          </View>
        </View>
        <View style={{flex:4}}>
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
                        <View style={styles.horizontalView}>
                          <View >
                            <CheckBox tintColors={{true:'#EA6132',false:'#D9D9D9'}}
                              tintColor='#D9D9D9' onCheckColor='#EA6132' style={{marginTop : -5}} 
                              value={termsConditions} onValueChange={(val) => setTermsConditions(val)}/>
                          </View>
                          <Text style={{marginBottom:20,...styles.greyText}}>I accept </Text>
                          <TouchableOpacity onPress={()=>Linking.openURL('https://falmouthlaunchpad.co.uk/')}>
                            <Text style={styles.ligthText}>Terms and Conditions</Text>
                          </TouchableOpacity>
                        </View>
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
