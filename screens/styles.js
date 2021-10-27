import { StyleSheet } from 'react-native'

const theme = {
  colors : {
    primary : '#EA6132',
    secondary : '#999999',
    dark : '#343F4B',
    ligth : '#D9D9D9'
  }
}

const styles = StyleSheet.create({
  container :{
    flex : 1
  },
  centered : {
    flex : 5
  },
  homeLigthBox :{
    backgroundColor : theme.colors.ligth,
    height:'100%',
    borderTopStartRadius: 10,
    justifyContent : 'center'
  },
  alignCentered:{
    alignItems : 'center',
    justifyContent : 'center',
    flex : 1
  },
  horizontalView:{
    flexDirection : 'row'
  },
  header:{
    backgroundColor: theme.colors.primary,
    justifyContent : 'center',
    flex:3
  },
  topMarginCentered:{
    marginTop : 20,
    alignItems : 'center'
  },
  bottomMenu:{
    backgroundColor : theme.colors.dark,
    flex :1 ,
    justifyContent : 'center'
  },
  image:{
    flex:1,
    resizeMode:'cover',
    justifyContent: 'center'
  },
  blackContainer:{
    backgroundColor:theme.colors.dark,
    borderColor : theme.colors.dark,
    borderRadius : 10,
    borderWidth : 10
  },
  inputContainer:{
    borderBottomWidth:3,
    borderWidth:3,
    borderRadius:10,
    marginBottom: -10
  },
  percentageFull:{
    height:'100%',
    width:'100%'
  },
  verticalSpace:{
    marginBottom : 5
  },
  timer:{
    backgroundColor:theme.colors.dark
  },
  ligthText:{
    color : theme.colors.ligth
  },
  menuOption:{
    height : 70,
    width : 50
  },
  sessionItem: {
    backgroundColor: theme.colors.ligth,
    borderRadius: 5,
    margin : 5
  },
  modalView: {
    alignItems: 'center',
    shadowOffset : {
      width: 0,
      height: 2
    },
    elevation : 5,
    backgroundColor : theme.colors.ligth,
    margin : 20,
    padding : 30
  },
  buttonOpen: {
    backgroundColor : theme.colors.secondary
  },
  buttonStyle: {
    borderRadius: 10
  },
  roundImage: {
    height:100,
    width:100,
    borderRadius: 100
  },
  verticalJump:{
    height: '5%'
  },
  verticalSpace:{
    height: '20%'
  }
})


export {styles, theme}
