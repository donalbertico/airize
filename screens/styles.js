import { StyleSheet } from 'react-native'

const theme = {
  colors : {
    primary : '#EA6132',
    secondary : '#999999',
    dark : '#343F4B'
  }
}

const styles = StyleSheet.create({
  container :{
    flex : 1
  },
  centered : {
    flex : 5
  },
  alignCentered:{
    alignItems : 'center',
    justifyContent : 'center'
  },
  horizontalView:{
    flexDirection : 'row'
  },
  header:{
    backgroundColor: theme.colors.primary,
    justifyContent : 'center',
    flex:1
  },
  topMarginCentered:{
    marginTop : 20,
    alignItems : 'center'
  },
  darkBackground:{
    backgroundColor : theme.colors.dark,
    flex:1
  }
})


export {styles, theme}
