import React from 'react'
import { View, Image, FlatList, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-elements'
import { styles } from '../styles'
import useAssetStore from '../../hooks/useAssetStore'

export default function SessionList(props){
  const [sessions, setSessions] = React.useState()
  const [assets,setAssets] = useAssetStore()
  const [avatarUri,setAvatar] = React.useState()

  React.useEffect(() => {
    if(props.sessions) setSessions(props.sessions)
  },[props.sessions])
  React.useEffect(()=>{
    if(assets){
      setAvatar(assets.avatar)
    }
  },[assets])

  return (
    <View>
      <FlatList data={sessions} renderItem= {
          ({item}) =>
          <View style={styles.sessionItem}>
            <TouchableOpacity onPress={() => props.handleSessionSelected(item)}>
              <View style={styles.horizontalView}>
                  <View style={{margin: 5}}>
                    <Image style={{height:50,width:50,borderRadius: 100}} source={{uri:avatarUri}}/>
                  </View>
                  <View style={{flex:1}}></View>
                  <View style={styles.alignCentered}>
                    <Text h4>{item.dueDate}</Text>
                  </View>
              </View>
            </TouchableOpacity>
          </View>
        }/>
    </View>
  )
}
