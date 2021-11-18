import * as React from 'react'
import { View} from 'react-native'
import {styles} from '../styles'
import { Text, Image} from 'react-native-elements'
import { ImageBackground, SafeAreaView, TouchableOpacity } from 'react-native'
import Login from "./components/loginComponent"
import useAssetStore from '../../hooks/useAssetStore'

export default function LoginScreen(props){
  const [splashUrl,setSplash] = React.useState()
  const [logoUrl,setLogo] = React.useState()
  const [reload,setReload] = React.useState(false)
  const [assets,setAssets] = useAssetStore()

  React.useEffect(() => {
    if(assets){
      setSplash(assets.splash)
      setLogo(assets.logo)
      setReload(false)
    }else{
      setReload(true)
      setAssets(true)
    }
  },[assets])
  React.useEffect(() => {
    if(reload){
      setTimeout(()=>setAssets('get'),100)
    }
  },[reload])

  return(
    <SafeAreaView style={styles.coloredContainer}>
      <View style={{flex:2}}>
          <View style={styles.alignCentered}>
              <Image style={{width:195, height:200, justifyContent:'center'}}
                 source={{uri:logoUrl}}/>
          </View>
      </View>
      <View style={{flex:3}}>
        <View style={styles.horizontalView}>
          <View style={{flex:1}}></View>
          <View style={{flex:12}}>
            <View style={styles.blackContainer}>
              <View style={{margin:10}}>
                <Login handleRecoverPassword={()=>props.navigation.navigate('password')}/>
              </View>
            </View>
          </View>
          <View style={{flex:1}}></View>
        </View>
      </View>
      <View style={{marginBottom : 20, alignItems : 'center'}}>
        <View style={styles.horizontalView}>
          <Text style={styles.ligthText}>Don't have an account? </Text>
          <TouchableOpacity onPress={()=>props.navigation.navigate('register')}>
            <Text style={styles.underlined}>Create new</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
