import React from 'react'
import { View, FlatList, Text } from 'react-native'
import { styles } from '../../styles'
import { Ionicons } from '@expo/vector-icons';
import useUserRead from '../../../hooks/useUserRead'
export default function Chat({sessMessages}) {
  const [messages, setMessages] = React.useState([])
  const [user] = useUserRead('get')

  React.useEffect(() => {
    if(sessMessages) setMessages(sessMessages)
  },[sessMessages])

  return (
    <View>
      <FlatList inverted data={messages} renderItem = {
            ({item}) => (
              <View style={styles.horizontalView}>
                { item.user == user?.uid && (
                  <View style={{flex:1}}></View>
                )}
                <View style={{flex:3, alignItems: 'stretch'}}>
                  {item.text ? (
                    <View style={styles.messageBox}>
                      <Text>{item.text}</Text>
                    </View>
                  ) :(
                    <View style={styles.messageBox}>
                      <Ionicons name="mic" size={40} color='black'/>
                    </View>
                  )}
                </View>
                { item.user != user?.uid && (
                  <View style={{flex:1}}></View>
                )}
              </View>
            )
        }/>
    </View>
  )
}
