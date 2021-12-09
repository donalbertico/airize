import React from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import {styles} from '../styles'
import useAssetStore from '../../hooks/useAssetStore'

export default function NavBar(props){
  const [assets,setAssets] = useAssetStore()
  const [menuUris,setMenuUris] = React.useState({home:'/'})

  React.useEffect(()=>{
    if(assets) setMenuUris(assets.menu)
  },[assets])

  return (
    <View style={styles.bottomMenu}>
      <View style={styles.horizontalView}>
        <View style={{flex:1}}>
          <TouchableOpacity onPress={()=> props.navigation.navigate('home')}>
            <Image style={styles.menuOption}
              source={{ uri: props.route==0? menuUris.homeSe: menuUris.home}}/>
          </TouchableOpacity>
        </View>
        <View style={{flex:1}}>
          <TouchableOpacity onPress={()=> props.navigation.navigate('friends')}>
            <View style={{backgroundColor : '#E5E5E5', marginRight : 5}}>
              <Image
                style={props.route==1? styles.menuOption: styles.menuOptionWeird}
                source={{ uri: props.route==1? menuUris.searchSe: menuUris.search}}/>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{flex:1}}>
          <TouchableOpacity onPress={() => props.navigation.navigate('events')}>
            <Image style={styles.menuOption}
              source={{ uri: props.route==2? menuUris.planSe: menuUris.plan}}/>
          </TouchableOpacity>
        </View>
        <View style={{flex:1}}>
          <TouchableOpacity onPress={() => props.navigation.navigate('invitations')}>
            <Image style={styles.menuOption}
              source={{ uri: props.route==3? menuUris.chatSe: menuUris.chat}}/>
          </TouchableOpacity>
        </View>
        <View style={{flex:1}}>
          <TouchableOpacity onPress={() => props.navigation.navigate('edit')}>
            <View style={{backgroundColor : '#E5E5E5', marginRight : 5}}>
              <Image
                style={props.route==4? styles.menuOption: styles.menuOptionWeird}
                source={{ uri: props.route==4? menuUris.setSe: menuUris.set}}/>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}
