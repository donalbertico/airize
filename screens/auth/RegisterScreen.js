import * as React from 'react'
import * as firebase from 'firebase'
import 'firebase/firestore'
import {View, ActivityIndicator,ImageBackground} from 'react-native'
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
      displayName : name,
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
                displayName : name
              })
              .then(()=>{
                let db = firebase.firestore();
                db.collection('users').doc(user.uid).set({
                      description:'empty'
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
    <View style={styles.container}>
      <ImageBackground style={styles.image} source={{uri:splashUrl}}>
        <View style={{flex:2}}>
          <View style={styles.horizontalView}>
            <View style={{flex:1}}></View>
            <View style={{flex:6}}>
              <View style={styles.percentageFull}>
                <Image style={{width:'95%', height:'99%',justifyContent:'center'}}source={{uri:logoUrl}}/>
              </View>
            </View>
            <View style={{flex:1}}></View>
          </View>
        </View>
        <View style={{flex:2}}>
          {!loading? (
            <View style={{flex:5}}>
                <View style={styles.horizontalView}>
                  <View style={{flex:1}}></View>
                  <View style={{flex:8}}>
                    <View style={styles.blackContainer}>
                      <View style={{margin:10}}>
                        <Text>{error}</Text>
                        <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='name'onChangeText={(name)=>setName(name)}></Input>
                        <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='email'onChangeText={(email)=>setEmail(email)}></Input>
                        <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='password' value={password} secureTextEntry={true} onChangeText={(password)=>setPass(password)}></Input>
                        <Input style={styles.ligthText} inputContainerStyle={styles.inputContainer} placeholder='repeat password' value={repeat} secureTextEntry={true} onChangeText={(repeat)=>setRepeat(repeat)}></Input>
                        <Button title='register'onPress={handleRegister}/>
                      </View>
                    </View>
                  </View>
                  <View style={{flex:1}}></View>
                </View>
            </View>
          ):(
            <ActivityIndicator />
          )}
        </View>
        <View style={{flex:1}}></View>
      </ImageBackground>
    </View>
  )
}
