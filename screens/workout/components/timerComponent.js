import React from 'react'
import {View} from 'react-native'
import {Text} from 'react-native-elements'
import {styles} from '../../styles'

export default function Timer(props){
  const [ms, setMs] = React.useState(0)
  const [s, setS] = React.useState(0)
  const [m, setM] = React.useState(0)
  const [h, setH] = React.useState(0)

  React.useEffect(()=>{
    let that = this
    if(!props.pause){
      that.timer = setInterval(()=>{
        setMs(ms=>ms+1)
      },1)
    }else{
      clearInterval(that.timer)
      props.handleOnTime({ms:ms,s:s,m:m,h:h})
    }
  },[props.pause])

  React.useEffect(()=>{
    if(ms== 99){
      if(s !== 59){
        setMs(0)
        setS(s=>s+1)
      }else if(m !== 59){
        setS(0)
        setMs(0)
        setM(m=>m+1)
      }else{
        setMs(0)
        setS(0)
        setM(0)
        setH(h=>h+1)
      }
    }
  },[ms])

  return(
    <View style={styles.timer}>
      <Text h2 style={styles.ligthText}>{h}:{m}:{s}:{ms}</Text>
    </View>
  )
}
