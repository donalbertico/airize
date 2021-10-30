import React, { useRef, useState, useEffect } from 'react'
import { AppState } from 'react-native'

export default function useAppState() {
  const appState = useRef(AppState.currentState)
  const [foreground,setForeground] = useState(false)

  const _handleAppStateChange = nextAppState => {
    if (appState.current.match(/inactive|background/) && nextAppState == 'active') {
      setForeground(true)
    }else{
      setForeground(false)
    }
    appState.current = nextAppState
  }

  useEffect(() => {
    AppState.addEventListener('change',_handleAppStateChange)
    return () => {
      AppState.removeEventListener('change',_handleAppStateChange)
    }
  },[])

  return [foreground]
}
