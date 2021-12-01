import React from 'react'
import { View, FlatList, Text, TouchableOpacity } from 'react-native'
import { styles } from '../../styles'
import { Ionicons } from '@expo/vector-icons';
import useUserRead from '../../../hooks/useUserRead'

export default function Chat({sessMessages, playAudioMessage}) {
  const [messages, setMessages] = React.useState([])
  const [user] = useUserRead('get')
  const listRef = React.useRef()

  React.useEffect(() => {
    if(sessMessages) {
      setMessages(sessMessages)
    }
  },[sessMessages])

  React.useEffect(() => {
    if(messages?.length > 0) {
      setTimeout(() => {
        listRef.current.scrollToEnd({ animated: true})
      },200)
    }
  },[messages])

  return (
    <View>
      <FlatList ref ={listRef} data={messages} renderItem = {
            ({item}) => (
              <View style={styles.horizontalView}>
                { item.user == user?.uid ? (
                  <>
                    <View style={{flex:1}}></View>
                    {item.text ? (
                      <View style={styles.messageBox}>
                        <Text>{item.text}</Text>
                      </View>
                    ) :(
                      <TouchableOpacity onPress={() => playAudioMessage(item.id)} style={styles.messageBox}>
                        <Ionicons name="mic" size={40} color='black'/>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <>
                    {item.text ? (
                      <View style={styles.othersMessageBox}>
                        <Text style={{color:'white'}}>{item.text}</Text>
                      </View>
                    ) :(
                      <TouchableOpacity onPress={() => playAudioMessage(item.id)} style={styles.othersMessageBox}>
                        <Ionicons name="mic" size={40} color='black'/>
                      </TouchableOpacity>
                    )}
                    <View style={{flex:1}}></View>
                  </>
                )}
              </View>
            )
        }/>
    </View>
  )
}
