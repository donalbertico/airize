import { useEffect, useState } from 'react'
import { useAuthRequest, makeRedirectUri, getRedirectUrl } from 'expo-auth-session'
import {encode as btoa} from 'base-64'
import apiKeys from '../constants/apiKeys'
import useKeyStore from './useKeyStore'

export default function useSpotifyAuth(askAuth){
  const [result,setResult] = useState()
  const [err,setErr] = useState()
  const [keys] = useKeyStore()
  const [ask,setAsk] = useState(askAuth)
  const [tokens,setTokens] = useState()
  const discovery = {
    authorizationEndpoint : 'https://accounts.spotify.com/authorize',
    tokenEndpoint : 'https://accounts.spotify.com/api/token'
  }
  const proxy = false
  const redirectUri = makeRedirectUri({useProxy:false,native:'airize://redirect'})
  const [authRequest, authResponse, promptAsync] = useAuthRequest({
    clientId: apiKeys.spotify.clientId,
    usePKCE: false,
    scopes: [
      'streaming',
      'user-library-read',
      'user-read-playback-state'
    ],
    redirectUri: redirectUri,
    extraParams: {
      show_dialog:'true'
    }
  },discovery)

  useEffect(()=>{
    if(authRequest&&ask)promptAsync()
  },[authRequest,ask])

  useEffect(()=>{
    async function getToken() {
      const creds = btoa(`${apiKeys.spotify.clientId}:${keys.spotify}`)
      try {
        const result = await fetch('https://accounts.spotify.com/api/token',{
          method: 'POST',
          headers: {
            Authorization: `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `grant_type=authorization_code&code=${authResponse.params.code}&redirect_uri=${redirectUri}`
        })
        const resultJson = await result.json()
        setResult(resultJson)
      } catch (e) {
        console.warn('error authenticating spotify',e);
      }
    }
    if(!authResponse) return;
    if(authResponse.params){
      getToken()
    }else{
      if(authResponse?.type)setErr(authResponse.type)
    }
  },[authResponse])

  useEffect(()=>{
    if(result){
      result.error? setErr(result.err) : setErr()
      if (result.access_token){
        setTokens({
          access : result.access_token,
          expires : new Date().getTime() + result.expires_in *1000,
          refresh : result.refresh_token
        })
      }
    }
  },[result])

  return [tokens,err,setAsk]
}
