import * as React from 'react'
import * as firebase from 'firebase'

export default function useProfilePicture(){
  const [url,setUrl] = React.useState()
  const [resolved, setResolved] = React.useState()

  React.useEffect(() => {
    if(!url) setResolved(false)
    if(url?.split('-profile')[1]){
      firebase.storage().ref(url)
      .getDownloadURL()
      .then( fsUrl => {
        setResolved(fsUrl)
      })
      .catch(e => {console.log('error',e)})
    }else {
      setResolved(url)
    }
  },[url])

  return [resolved,setUrl]
}
