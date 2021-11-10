import * as React from 'react'
import * as firebase from 'firebase'
import Toast from 'react-native-toast-message'
import * as ImagePicker from 'expo-image-picker'
import { View, ActivityIndicator, TouchableOpacity} from 'react-native'
import { Input, Text, Button, Image} from 'react-native-elements'
import {styles} from '../styles'
import useUserStore from '../../hooks/useUserStore'
import useUserRead from '../../hooks/useUserRead'
import useAssetStore from '../../hooks/useAssetStore'
import useProfilePicture from '../../hooks/useProfilePicture'

import NavBar from '../components/bottomNavComponent'
import Logout from '../auth/components/logoutComponent'

export default function EditScreen(props){
  const [email,setEmail] = React.useState('')
  const [profilePicture,setUrl] = useProfilePicture()
  const [firstName,setFirstName] = React.useState('')
  const [lastName,setLastName] = React.useState('')
  const [assets,setAssets] = useAssetStore()
  const [avatarUri,setAvatar] = React.useState()
  const [loading,setLoading] = React.useState(false)
  const [userRef,setUserRef] = React.useState()
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
        }
      }
    }
    setLoading(true)
    pickImage()
  }
  const handleEdit = ()=> {
    setLoading(true)
    let newInfo = {firstName : firstName, lastName : lastName}
    userRef.update(newInfo)
      .then(()=>{
        setUser({...user,...newInfo})
        props.navigation.navigate('home',{userUpdate : true})
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
    if(user.uid) {
      let db = firebase.firestore();
      setUserRef(db.collection('users').doc(user.uid))
    }
    if(user.picture){
      console.log('cambia?');
      setUrl(user.picture)
    }
  },[user])
  React.useEffect(() => {
    if(assets) setAvatar(assets.avatar)
  },[assets])

  return(
    <View style={styles.container}>
      <View style={{flex:1}}></View>
      <View style={{flex:7}}>
        {!loading? (
            <View style={styles.horizontalView}>
              <View style={{flex:1}}></View>
              <View style={{flex:8}}>
                <View style={styles.horizontalView}>
                  <TouchableOpacity onPress={uploadPicture}>
                    <Image style={styles.roundImage} source={{uri: profilePicture? profilePicture: avatarUri}}/>
                  </TouchableOpacity>
                  <View style={{flex:1}}></View>
                  <View>
                    {!user.provider && (
                      <TouchableOpacity onPress={()=>{props.navigation.navigate('password',{change:true})}}>
                        <Text>Change password</Text>
                      </TouchableOpacity>
                    )}
                    <Logout/>
                  </View>
                </View>
                <View style={styles.ligthContainer}>
                  <View style={styles.horizontalView}>
                    <View style={{flex:1,marginBottom:50}}></View>
                  </View>
                  <Input placeholder='first name' value={firstName} onChangeText={(name)=>setFirstName(name)}></Input>
                  <Input placeholder='last name' value={lastName} onChangeText={(lastname)=>setLastName(lastname)}></Input>
                  <Button title='edit' onPress={handleEdit}/>
                </View>
              </View>
              <View style={{flex:1}}></View>
            </View>
        ):(
          <ActivityIndicator size='large' color='#EA6132'/>
        )}
      </View>
      <View style={{flex:1}}>
        <NavBar navigation={props.navigation}/>
      </View>
    </View>
  )
}
