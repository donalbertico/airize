import React from 'react'
import * as firebase from 'firebase'
import {styles} from '../../styles'
import {Input,Text,Button} from 'react-native-elements'
import {View, TouchableOpacity,ActivityIndicator} from 'react-native'

export default function Login({handleToRegister,handleRecoverPassword}) {
  const [email, setEmail] = React.useState('')
  const [password, setPass] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error,setError] = React.useState('')

  handleLogin = () => {
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

    return (
      <View>
          {loading?(
            <ActivityIndicator/>
          ):(
            <>
              <Text>{error}</Text>
              <Input placeholder = 'Email' value={email} onChangeText={email => setEmail(email)}/>
              <Input placeholder = 'Password' value={password} secureTextEntry={true} onChangeText={password => setPass(password)}/>
              <Button title='login' onPress={handleLogin}/>
              <View style={styles.horizontalView}>
                <View style={{flex:1}}></View>
                <TouchableOpacity onPress={()=>handleRecoverPassword()}>
                  <Text style={{marginTop:10}}>forgot my password</Text>
                </TouchableOpacity>
              </View>
             <View style={styles.topMarginCentered}>
                <Text>Or</Text>
              </View>
              <View style={styles.topMarginCentered}>
                  <TouchableOpacity onPress={()=>handleToRegister()}>
                    <Text h4>Register</Text>
                  </TouchableOpacity>
              </View>
            </>
          )}
      </View>
    )

}
