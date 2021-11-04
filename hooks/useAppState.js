import React, { useRef, useState, useEffect } from 'react'
import { AppState } from 'react-native'

export default function useAppState() {
  const appState = useRef(AppState.currentState)
  const [nextState,setNextState] = useState()

  const _handleAppStateChange = nextAppState => {
    setNextState(nextAppState)
  }

  useEffect(() => {
    AppState.addEventListener('change',_handleAppStateChange)
    return () => {
      AppState.removeEventListener('change',_handleAppStateChange)
    }
  },[])

  return [nextState]
}
