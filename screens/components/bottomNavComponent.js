import React from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import {styles} from '../styles'
import useAssetStore from '../../hooks/useAssetStore'
import Logout from '../auth/components/logoutComponent'

export default function NavBar(props){
  const [assets,setAssets] = useAssetStore()
  const [menuUris,setMenuUris] = React.useState({home:'/'})

  React.useEffect(()=>{
    if(assets) setMenuUris(assets.menu)
  },[assets])

  return (
    <View style={styles.bottomMenu}>
      <View style={styles.horizontalView}>
        <View style={{flex:2}}>
          <TouchableOpacity onPress={()=> props.navigation.navigate('home')}>
            <Image style={styles.menuOption}
              source={{ uri: props.route==0? menuUris.homeSe: menuUris.home}}/>
          </TouchableOpacity>
        </View>
        <View style={{flex:2}}>
          <TouchableOpacity onPress={()=> props.navigation.navigate('friends')}>
            <Image style={styles.menuOption}
              source={{ uri: props.route==1? menuUris.searchSe: menuUris.search}}/>
          </TouchableOpacity>
        </View>
        <View style={{flex:2}}>
          <TouchableOpacity onPress={() => props.navigation.navigate('friends')}>
            <Image style={styles.menuOption}
              source={{ uri: props.route==2? menuUris.friendSe: menuUris.friends}}/>
          </TouchableOpacity>
        </View>
        <View style={{flex:2}}>
          <TouchableOpacity onPress={() => props.handleSession()}>
            <Image style={styles.menuOption}
              source={{ uri: props.route==3? menuUris.linkSe: menuUris.link}}/>
          </TouchableOpacity>
        </View>
        <View style={{flex:2}}>
          <TouchableOpacity onPress={() => props.navigation.navigate('edit')}>
            <Image style={styles.menuOption}
              source={{ uri: props.route==4? menuUris.setSe: menuUris.set}}/>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
