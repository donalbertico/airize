import { useEffect, useState } from 'react'
import { encode as btoa } from 'base-64'
import apiKeys from '../constants/apiKeys'
import useKeyStore from './useKeyStore'
import useSpotifyTokenStore from './useSpotifyTokenStore'

export default function useSpotifyTokenRefresh(refresh){
  const [refreshed,setRefresh] = useState(refresh)
  const [error,setError] = useState(false)
  const [result,setResult] = useState()
  const [tokens,storeTokens] = useSpotifyTokenStore()
  const [refreshedTokens,setRefreshedTokens] = useState()
  const [keys] = useKeyStore()

  useEffect(()=>{
    async function refreshTokens(){
      const creds = btoa(`${apiKeys.spotify.clientId}:${keys.spotify}`)
      console.log(tokens);
      try {
        const result = await fetch('https://accounts.spotify.com/api/token',{
          method: 'POST',
          headers: {
            Authorization: `Basic ${creds}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `grant_type=refresh_token&refresh_token=${tokens.refresh}`
        })
        const resultJson = await result.json()
        setResult(resultJson)
      } catch (e) {
        console.warn('error refreshing token',e);
        setError(e)
      }
    }
    if(refreshed)refreshTokens()
  },[refreshed])

  useEffect(()=>{
    if(result){
      console.log(result);
      if(result.error)setError(error)
      if(result.access_token){
        let newTokens = {
          access : result.access_token,
          expires : new Date().getTime() + result.expires_in *1000,
          refresh : tokens.refresh
        }
        storeTokens(newTokens)
        setRefreshedTokens(newTokens)
        setRefresh(false)
      }
    }
  },[result])

  return [error,refreshedTokens,setRefresh]
}
