import * as React from 'react'
import {View} from 'react-native'
import {styles} from '../styles'
import {Text,Image} from 'react-native-elements'
import {ImageBackground} from 'react-native'
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
    <View style={styles.container}>
      <ImageBackground style={styles.image} source={{uri:splashUrl}}>
        <View style={{flex:2}}>
          <View style={styles.horizontalView}>
            <View style={{flex:1}}></View>
            <View style={{flex:6}}>
              <View style={styles.percentageFull}>
                <Image style={{width:'95%', height:'99%',justifyContent:'center'}}
                   source={{uri:logoUrl}}/>
              </View>
            </View>
            <View style={{flex:1}}></View>
          </View>
        </View>
        <View style={{flex:2}}>
          <View style={styles.horizontalView}>
            <View style={{flex:1}}></View>
            <View style={{flex:8}}>
              <View style={styles.blackContainer}>
                <View style={{margin:10}}>
                  <Login handleToRegister={()=>props.navigation.navigate('register')}
                      handleRecoverPassword={()=>props.navigation.navigate('password')}/>
                </View>
              </View>
            </View>
            <View style={{flex:1}}></View>
          </View>
        </View>
        <View style={{flex:1}}></View>
      </ImageBackground>
    </View>
  )
}
