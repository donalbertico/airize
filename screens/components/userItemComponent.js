import React from 'react'
import { View } from 'react-native'
import { Text, Image } from 'react-native-elements'
import { styles } from '../styles'
import useAssetStore from '../../hooks/useAssetStore'
import useProfilePicture from '../../hooks/useProfilePicture'

export default function UserItem(props){
    const [assets, setAssets] = useAssetStore()
    const [picture, setPicture] = useProfilePicture()
    const [avatar, setAvatar] = React.useState()
    const [user, setUser] = React.useState()

    React.useEffect(() => {
      if(props.user){
        setUser(props.user)
        setPicture(props.user.picture)
      }
    },[props.user])
    React.useEffect(() => {
      if(assets) setAvatar(assets.avatar)
    }, [assets])

    return (
      <View style={styles.listItemContainer}>
        <Image style={styles.smallRoundImage} source={{uri: picture? picture : avatar}}/>
        <View>
          <Text>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.subtext}>{user?.email}</Text>
        </View>
      </View>
    )
}
