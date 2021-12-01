import React from 'react'
import {View} from 'react-native'
import {Text} from 'react-native-elements'
import {styles} from '../../styles'

export default function Timer(props){
  const [ms, setMs] = React.useState(0)
  const [s, setS] = React.useState(0)
  const [m, setM] = React.useState(0)
  const [h, setH] = React.useState(0)
  const [hidden,setHidden] = React.useState()

  React.useEffect(()=>{
    let that = this
    if(props.pause == false){
      that.timer = setInterval(()=>{
        setMs(ms=>ms+1)
      },1)
    }else{
      clearInterval(that.timer)
      let time = 0
      time = time + (h/60)/60 + m/60 + s
      props.handleOnTime(time)
    }
    setHidden(props.pause)
    return () => {
      clearInterval(that.timer)
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
    <View >
      <Text style={styles.h1_ligth}>{h}:{m}:{s}</Text>
    </View>
  )
}
