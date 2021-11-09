import * as React from 'react'
import * as firebase from 'firebase'
import {View,ActivityIndicator,TouchableOpacity} from 'react-native'
import {Input,Text,Button} from 'react-native-elements'
import {styles} from '../styles'
import useUserStore from '../../hooks/useUserStore'
import useUserRead from '../../hooks/useUserRead'

import NavBar from '../components/bottomNavComponent'
import Logout from '../auth/components/logoutComponent'

export default function EditScreen(props){
  const [email,setEmail] = React.useState('')
  const [name,setName] = React.useState('')
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

  React.useEffect(()=>{
    setName(user.displayName)
  },[user])

  return(
    <View style={styles.container}>
      <View style={{flex:1}}></View>
      <View style={{flex:7}}>
        {!loading? (
            <View style={styles.horizontalView}>
              <View style={{flex:1}}></View>
              <View style={{flex:8}}>
                <View style={styles.blackContainer}>
                  <View style={styles.horizontalView}>
                    <View style={{flex:1,marginBottom:50}}></View>
                    <TouchableOpacity onPress={()=>{props.navigation.navigate('password',{change:true})}}>
                      <Text>Change password</Text>
                    </TouchableOpacity>
                  </View>
                  <Input placeholder='name' value={name} onChangeText={(name)=>setName(name)}></Input>
                  <Button title='edit' onPress={handleEdit}/>
                  <View style={styles.horizontalView}>
                    <View style={{flex:1}}></View>
                    <Logout/>
                  </View>
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
