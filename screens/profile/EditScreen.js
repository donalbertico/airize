import * as React from 'react'
import * as firebase from 'firebase'
import { View, ActivityIndicator, TouchableOpacity} from 'react-native'
import { Input, Text, Button, Image} from 'react-native-elements'
import {styles} from '../styles'
import useUserStore from '../../hooks/useUserStore'
import useUserRead from '../../hooks/useUserRead'
import useAssetStore from '../../hooks/useAssetStore'

import NavBar from '../components/bottomNavComponent'
import Logout from '../auth/components/logoutComponent'

export default function EditScreen(props){
  const [email,setEmail] = React.useState('')
  const [name,setName] = React.useState('')
  const [assets,setAssets] = useAssetStore()
  const [avatarUri,setAvatar] = React.useState()
  const [loading,setLoading] = React.useState(false)
  const [user] = useUserRead('get')
  const [setUser] = useUserStore()

  handleEdit = ()=> {
    setLoading(true)
    let db = firebase.firestore();
    let ref = db.collection('users').doc(user.uid)
    const authUser = firebase.auth().currentUser
    let newInfo = {description : 'ploplo'}
    ref.update(newInfo)
      .then(()=>{
        authUser.updateProfile({
              displayName : name
            })
            .then(()=>{
              let update = {
                displayName : name
              }
              setUser(Object.assign(user,update,newInfo))
              props.navigation.navigate('home',{userUpdate : true})
              setLoading(false)
            },(e)=>{
              setLoading(false)
            })
      })
  }

  React.useEffect(() => {
    setName(user.displayName)
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
                  <Image style={styles.roundImage} source={{uri: user.picture? user.picture : avatarUri}}/>
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
                  <Input placeholder='name' value={name} onChangeText={(name)=>setName(name)}></Input>
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
