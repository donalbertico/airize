import * as React from 'react'
import * as firebase from 'firebase'
import {styles} from '../styles'
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message'
import * as fb from 'expo-facebook'
import * as Google from 'expo-auth-session/providers/google'
import { View, TouchableOpacity, SafeAreaView, ActivityIndicator} from 'react-native'
import {Text, Image, Button, Input } from 'react-native-elements'
import useUserRead from '../../hooks/useUserRead'
import useAssetStore from '../../hooks/useAssetStore'

import NavBar from '../components/bottomNavComponent'

export default function DeleteScreen(props) {
  const [user] = useUserRead('get')
  const [assets, setAssets] = useAssetStore()
  const [password, setPassword] = React.useState()
  const [reason, setReason] = React.useState()
  const [loading, setLoading] = React.useState(false)
  const [authUser, setAuthUser] = React.useState()
  const [provider,setProvider] = React.useState()
  const [googleUri, setGoogleUri] = React.useState()
  const [fbUri, setFbUri] = React.useState()
  const [providerCredentials,setCredentials] = React.useState()
  const [request, googleResponse, promptAsync] = Google.useAuthRequest({
    androidClientId : "795853275646-ae8uvd3aq1h31pf5uflniq4o5mu3vhik.apps.googleusercontent.com",
    iosClientId : "795853275646-rt73098b5dt37oqt6nk7o8925d339iv9.apps.googleusercontent.com"
  })

  const deleteAccount = () => {
      let db = firebase.firestore()
      if(reason) {
        db.collection('feedbacks').add({
          user : user,
          subject : 'deleted',
          message : reason
        }).then(doc => {
           db.collection('sessions')
            .where('users', 'array-contains', user.uid)
            .get()
            .then( (snapshot) => {
              var batch = db.batch();
              snapshot.forEach((doc) => {
                batch.delete(doc.ref)
              });
              return batch.commit()
            })
            .then(() => {
              console.log('sessions deleted');
            })
           if(user.picture){
             if(user.picture.split('-profile')[1]){
               firebase.storage().ref(user.picture)
                  .delete()
                  .catch(e => console.log(e))
             }
           }
           db.collection('users').doc(user.uid)
              .delete().then(() => {
                const authUser = firebase.auth().currentUser;
                authUser.delete().then(() => {
                  setLoading(false)
                })
              })
              .catch((e) => {
                console.log('error',e);
              })
        })
      }else {
         db.collection('sessions')
          .where('users', 'array-contains', user.uid)
          .get()
          .then( (snapshot) => {
            var batch = db.batch();
            snapshot.forEach((doc) => {
              batch.delete(doc.ref)
            });
            return batch.commit()
          })
          .then(() => {
            console.log('sessions deleted');
          })
          if(user.picture){
            if(user.picture.split('-profile')[1]){
              firebase.storage().ref(user.picture)
                 .delete()
                 .catch(e => console.log(e))
            }
          }
         db.collection('users').doc(user.uid)
            .delete().then(() => {
              const authUser = firebase.auth().currentUser;
              authUser.delete()
            })
            .catch((e) => {
              console.log('error',e);
            })
      }
  }
  const getCredentials = () => {
    setLoading(true)
    const credentials = ''
    switch (provider) {
      case 'google.com':
        if(!providerCredentials) {
          Toast.show({text1: 'Error',
                  text2 : 'authorize with google to delete',
                  type : 'error',
                  position : 'bottom',
                  visibilityTime: 5000
                })
          setLoading(false)
        }else{
          reAuth(providerCredentials)
        }
        break;
      case 'facebook.com':
        if(!providerCredentials) {
          Toast.show({text1: 'Error',
                  text2 : 'authorize with faceook to delete',
                  type : 'error',
                  position : 'bottom',
                  visibilityTime: 5000
                })
          setLoading(false)
        }else{
          reAuth(providerCredentials)
        }
        break;
      case 'password':
        if(!password) {
          Toast.show({text1: 'Error',
                  text2 : 'enter password',
                  type : 'error',
                  position : 'bottom',
                  visibilityTime: 5000
                })
          setLoading(false)
          return;
        }
        const credentials = firebase.auth.EmailAuthProvider.credential(user.email,password)
        reAuth(credentials)
        break;
    }
  }
  const reAuth = (credentials) => {
    const authUser = firebase.auth().currentUser;
    authUser.reauthenticateWithCredential(credentials)
      .then(() => {
        deleteAccount()
      })
      .catch( (e) => {
        setLoading(false)
        Toast.show({text1: 'Error',
          text2 : e.message,
          type : 'error',
          position : 'bottom',
          visibilityTime: 5000
        })
      })
  }
  const handleFbLogin = () => {
    async function fblog(){
      try {
        await fb.initializeAsync({ appId: '426169569075169'})
        const {type, token} = await fb.logInWithReadPermissionsAsync({
          permissions: ['public_profile']
        })
        if(type == 'success'){
          const credential = firebase.auth.FacebookAuthProvider.credential(token)
          if (credential) {
            setCredentials(credential)
            setLoading(false)
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

  React.useState(() => {
    const auth = firebase.auth().currentUser
    setProvider(auth.providerData[0]?.providerId)
  },[])
  React.useEffect(() => {
    if(assets){
      setFbUri(assets.facebook)
      setGoogleUri(assets.google)
    }
  },[assets])
  React.useEffect(() => {
    if(googleResponse?.params?.access_token){
      const credential = firebase.auth.GoogleAuthProvider.credential(
        googleResponse.params.id_token,
        googleResponse.params.access_token
      )
      if(credential) {
        setCredentials(credential)
        setLoading(false)
      }
    }else {
      setLoading(false)
    }
  },[googleResponse])

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
          <Text style={styles.h2_ligth}>Delete Account</Text>
        </View>
        <View style={{flex:1}}></View>
        <View style={{flex:2, justifyContent:'center'}}>
          <Button title='DELETE'
            onPress={getCredentials}/>
        </View>
      </View>
      <View style={{flex:7, padding : 15}}>
        <View style={styles.verticalJump}></View>
        {loading ? (
          <View style={{alignItems : 'center'}}>
            <ActivityIndicator size='large' color='#EA6132'/>
          </View>
        ) : (
          <>
            { provider == 'google.com' && (
              <>
                { providerCredentials ? (
                  <TouchableOpacity  style={{flexDirection : 'row', marginBottom: 20, padding :10}}>
                    <View style={{flex:4}}>
                      <Text>Your account is ready to be deleted</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity  style={{flexDirection : 'row', marginBottom: 20, padding :10}}
                    onPress={ () => {setLoading(true);promptAsync()}}>
                    <View style={{flex:1}}>
                      <Image style={styles.authProviders} source={{uri:googleUri}}/>
                    </View>
                    <View style={{flex:4}}>
                      <Text>Log in on Google to delete your account</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
            { provider == 'facebook.com' && (
              <>
                { providerCredentials ? (
                  <TouchableOpacity  style={{flexDirection : 'row', marginBottom: 20, padding :10}}>
                    <View style={{flex:4}}>
                      <Text>Your account is ready to be deleted</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity  style={{flexDirection : 'row', marginBottom: 20, padding :10}}
                    onPress={ () => {handleFbLogin()}}>
                    <View style={{flex:1}}>
                      <Image style={styles.authProviders} source={{uri:fbUri}}/>
                    </View>
                    <View style={{flex:4}}>
                      <Text>Log in on Facebook to delete your account</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
            { provider == 'password' && (
              <Input placeholder='Enter your password' secureTextEntry value={password}
                onChangeText={(password) => setPassword(password)}></Input>
            )}
            <View style={{marginTop : -20, padding: 10}}>
              <Text style={styles.greyText}>
                Your personally identifiable data will be deleted as soon as possible.
              </Text>
            </View>
            <View style={{marginTop : 20}}></View>
            <Input placeholder='Why are you deleting the account ?' value={reason}
              numberOfLines= {2}
              onChangeText={(reason) => setReason(reason)}></Input>
            <View style={{marginTop : -20, padding: 10}}>
              <Text style={styles.greyText}>
                (optional)
              </Text>
            </View>
          </>
        )}
      </View>
      <NavBar navigation={props.navigation} route={4}/>
    </SafeAreaView>
  )
}
