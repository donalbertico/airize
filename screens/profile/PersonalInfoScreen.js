import * as React from 'react'
import * as firebase from 'firebase'
import Toast from 'react-native-toast-message'
import * as ImagePicker from 'expo-image-picker'
import { View, ActivityIndicator, TouchableOpacity, SafeAreaView} from 'react-native'
import { Input, Text, Button, Image} from 'react-native-elements'
import { Ionicons } from '@expo/vector-icons';
import {styles} from '../styles'
import useUserStore from '../../hooks/useUserStore'
import useUserRead from '../../hooks/useUserRead'
import useAssetStore from '../../hooks/useAssetStore'
import useProfilePicture from '../../hooks/useProfilePicture'

import NavBar from '../components/bottomNavComponent'

export default function PersonalInfoScreen(props) {
  const [email,setEmail] = React.useState('')
  const [firstName,setFirstName] = React.useState('')
  const [lastName,setLastName] = React.useState('')
  const [num,setNum] = React.useState('')
  const [avatarUri,setAvatar] = React.useState()
  const [loading,setLoading] = React.useState(false)
  const [userRef,setUserRef] = React.useState()
  const [profilePicture,setUrl] = useProfilePicture()
  const [assets,setAssets] = useAssetStore()
  const [user] = useUserRead('get')
  const [setUser] = useUserStore()


  const uploadPicture = () => {
    async function pickImage() {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if ( status == 'granted') {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          aspect: [4, 3],
          quality: 1
        })
        setUrl()
        if(!result.cancelled) {
          let picture = `profiles/${user.uid}-profile.jpg`
          let file = await fetch(result.uri)
          let blob = await file.blob()
          firebase.storage()
              .ref(picture)
              .put(blob)
              .then(() => {
                userRef.update({picture : picture})
                  .then(()=>{
                    setUser({...user,picture : picture})
                    setUrl(picture)
                    setLoading(false)
                  })
                  .catch((e) => {
                    setLoading(false)
                    Toast.show({text1:'Error',
                      text2: e.message ,
                      type : 'error',
                      position : 'bottom',
                      visibilityTime: 4000})
                  })
              })
        }else{
          setLoading(false)
        }
      }
    }
    setLoading(true)
    pickImage()
  }
  const handleEdit = ()=> {
    setLoading(true)
    let newInfo = {firstName : firstName, lastName : lastName, number : num}
    if(firstName == '' || lastName == '' || num != '') {
      Toast.show({text1:'Info required',
        text2: 'please fill all inputs' ,
        type : 'error',
        position : 'bottom',
        visibilityTime: 4000})
    }
    userRef.update(newInfo)
      .then(()=>{
        setUser({...user,...newInfo})
        setLoading(false)
        Toast.show({text1:'Updated',
          text2: 'data updated' ,
          type : 'success',
          position : 'bottom',
          visibilityTime: 4000})
      })
      .catch((e) => {
        setLoading(false)
        Toast.show({text1:'Error',
          text2: e.message ,
          type : 'error',
          position : 'bottom',
          visibilityTime: 4000})
      })
  }

  React.useEffect(() => {
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setNum(user.number)
    if(user.uid) {
      let db = firebase.firestore();
      setUserRef(db.collection('users').doc(user.uid))
    }
    if(user.picture){
      setUrl(user.picture)
    }
  },[user])
  React.useEffect(() => {
    if(assets){
     setAvatar(assets.avatar)
   }
  },[assets])
  return (
    <SafeAreaView style={styles.container}>
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
          <Button title='UPDATE'
            onPress={handleEdit}/>
        </View>
      </View>
      <View style={{flex:7, padding : 15}}>
      {!loading? (
        <View style={{flex:8}}>
          <View style={styles.horizontalView}>
            <View style={{flex:1}}></View>
            <TouchableOpacity onPress={uploadPicture}>
              <Image style={styles.roundImage} source={{uri: profilePicture? profilePicture: avatarUri}}/>
              <Text style={styles.subtext}>Change picture</Text>
            </TouchableOpacity>
            <View style={{flex:1}}></View>
          </View>
          <View style={styles.ligthContainer}>
            <View style={styles.horizontalView}>
              <View style={{flex:1,marginBottom:50}}></View>
            </View>
            <Input placeholder='first name' value={firstName} onChangeText={(name)=>setFirstName(name)}></Input>
            <Input placeholder='last name' value={lastName} onChangeText={(lastname)=>setLastName(lastname)}></Input>
            <Input placeholder='phone number (avoid country code)' keyboardType="numeric" value={num} onChangeText={(num)=>setNum(num)}></Input>
          </View>
        </View>
      ):(
        <ActivityIndicator size='large' color='#EA6132'/>
      )}
      </View>
      <NavBar navigation={props.navigation} route={4}/>
    </SafeAreaView>
  )
}
