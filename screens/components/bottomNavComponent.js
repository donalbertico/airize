import React from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import {styles} from '../styles'
import useAssetStore from '../../hooks/useAssetStore'
import Logout from '../auth/components/logoutComponent'

export default function NavBar(props){
  const [assets,setAssets] = useAssetStore()
  const [menuUris,setMenuUris] = React.useState({home:'/'})

  React.useEffect(()=>{
    if(assets)setMenuUris(assets.menu)
  },[assets])
  return (
    <View style={styles.bottomMenu}>
      <View style={styles.horizontalView}>
        <View style={{flex:1}}></View>
        <TouchableOpacity onPress={()=> props.navigation.navigate('home')}>
          <Image style={styles.menuOption} source={{uri:menuUris.home}}/>
        </TouchableOpacity>
        <View style={{flex:1}}></View>
        <TouchableOpacity onPress={()=> props.navigation.navigate('invitations')}>
          <Image style={styles.menuOption} source={{uri:menuUris.search}}/>
        </TouchableOpacity>
        <View style={{flex:1}}></View>
        <TouchableOpacity onPress={() => props.navigation.navigate('friends')}>
          <Image style={styles.menuOption} source={{uri:menuUris.friends}}/>
        </TouchableOpacity>
        <View style={{flex:1}}></View>
        <TouchableOpacity onPress={() => props.handleSession()}>
          <Image style={styles.menuOption} source={{uri:menuUris.link}}/>
        </TouchableOpacity>
        <View style={{flex:1}}></View>
        <TouchableOpacity>
          <Image style={styles.menuOption} source={{uri:menuUris.set}}/>
      </TouchableOpacity>
        <View style={{flex:1}}></View>
      </View>
    </View>
  )
}
