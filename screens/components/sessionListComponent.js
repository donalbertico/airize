import React from 'react'
import { View, Image, FlatList, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-elements'
import { styles } from '../styles'
import useAssetStore from '../../hooks/useAssetStore'
import useProfilePicture from '../../hooks/useProfilePicture'

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
            { item.dateLabel && (
              <>
                <View style={{marginTop : 18, marginBottom : 10}}>
                  <View style={styles.horizontalView}>
                    <View style={{ justifyContent:'center',flex:1}}>
                      <View style={styles.line}></View>
                    </View>
                    <Text>{item.month}</Text>
                    <View style={{flex:1}}>
                      <View style={styles.line}></View>
                    </View>
                  </View>
                </View>
              </>
            )}
            {item.host?.firstName ? (
              <TouchableOpacity onPress={() => props.handleSessionSelected(item)}>
                <SessionItem item={{...item, user:item.host}}/>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity >
                <SessionItem item={{...item, user:item.partner}}/>
              </TouchableOpacity>
            )}
          </View>
        }/>
    </View>
  )
}

function SessionItem (props) {
  const [assets, setAssets] = useAssetStore()
  const [picture, setPicture] = useProfilePicture()
  const [avatar, setAvatar] = React.useState()

  React.useEffect(() => {
    if(assets) setAvatar(assets.avatar)
  }, [assets])
  React.useEffect(() => {
    if(props.item.user){
      setPicture(props.item.user.picture)
    }
  },[props.item.user])

  return (
    <>
      <View style={styles.horizontalView}>
        <View style={styles.alignCentered}>
          <Text style={styles.h2}>{props.item.day}</Text>
          <Text>{props.item.Nday}</Text>
        </View>
        <View >
          <Text>{props.item.dueTime}</Text>
          <Text style={styles.subtext}>with {props.item.user.firstName} {props.item.user.lastName}</Text>
        </View>
        <View style={{flex:1}}></View>
        <View style={styles.alignCentered}>
        <Image style={styles.smallRoundImage}
          source={{uri: picture? picture : avatar}}/>
        </View>
      </View>
      <View style={{marginBottom : 10}}></View>
    </>
  )
}
