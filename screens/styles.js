import { StyleSheet } from 'react-native'

const theme = {
  colors : {
    primary : '#EA6132',
    secondary : '#999999',
    dark : '#343F4B',
    ligth : '#D9D9D9',
    background: '#E5E5E5',
    white: '#E8E8E8'
  },
  Text: {
    style: {
      fontFamily: 'ubuntu',
      fontSize : 16
    }
  },
  Button: {
    titleStyle :{
      fontFamily: 'ubuntu',
      fontSize : 20
    }
  },
  Input: {
    fontFamily : 'ubuntu'
  }
}

const styles = StyleSheet.create({
  container :{
    flex : 1,
    backgroundColor : theme.colors.background
  },
  coloredContainer : {
    flex : 1,
    backgroundColor :theme.colors.primary
  },
  centered : {
    flex : 5
  },
  homeLigthBox :{
    backgroundColor : theme.colors.ligth,
    borderTopStartRadius: 10,
    paddingLeft : 10,
    justifyContent : 'center',
    padding : 17
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
    flexDirection : 'row',
    flex:1
  },
  mainHeader:{
    backgroundColor: theme.colors.primary,
    justifyContent : 'center',
    flex:2
  },
  topMarginCentered:{
    marginTop : 20,
    alignItems : 'center'
  },
  bottomMenu:{
    backgroundColor : theme.colors.dark,
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
  greyContainer:{
    backgroundColor: theme.colors.ligth,
    borderColor : theme.colors.ligth,
    borderRadius : 10,
    borderWidth : 10
  },
  inputContainer:{
    borderBottomWidth: 3,
    borderWidth: 3,
    borderRadius: 50,
    marginBottom: -15,
    marginLeft : -10,
    marginRight : -10,
    paddingLeft : 15,
    paddingRight: 15
  },
  searchBar: {
    backgroundColor : theme.colors.ligth,
  },
  percentageFull:{
    height:'100%',
    width:'100%'
  },
  verticalSpace:{
    marginBottom : 5
  },
  ligthText:{
    color : theme.colors.ligth
  },
  greyText: {
    color: '#999999'
  },
  menuOption:{
    height : 55,
    width : 75,
    backgroundColor: '#E5E5E5'
  },
  sessionItem: {
    borderRadius: 5,
    margin : 5,
    borderBottomWidth : 1,
    borderColor : theme.colors.ligth
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
    padding : 30,
    minHeight : 150,
    minWidth : 250,
  },
  buttonOpen: {
    backgroundColor : theme.colors.secondary
  },
  buttonStyle: {
    borderRadius: 50,
    height : 50
  },
  roundImage: {
    height:100,
    width:100,
    borderRadius: 100
  },
  smallRoundImage: {
    height: 40,
    width: 40,
    borderRadius: 100,
    marginRight: 10
  },
  verticalJump:{
    height: '5%'
  },
  verticalSpace:{
    height: '20%'
  },
  verticalDiv:{
    height: '10%'
  },
  authProviders:{
    height:30,
    width:30,
  },
  underlined:{
    textDecorationLine: 'underline',
    color : theme.colors.ligth
  },
  inputIcon: {
    height : 20,
    width : 25
  },
  largeInputIcon: {
    height : 32,
    width : 25
  },
  listItemContainer: {
    flexDirection : 'row',
    alignItems : 'center',
    padding : 16,
    marginLeft : 20,
    marginRight : 20,
    borderBottomWidth : 1,
    borderColor : theme.colors.ligth
  },
  h2:{
    fontSize : 25,
    fontFamily : 'ubuntu'

  },
  h2_ligth:{
    fontSize : 25,
    color : theme.colors.white,
    fontFamily : 'ubuntu'
  },
  subtext:{
    fontSize : 13,
    color : theme.colors.secondary
  },
  separator: {
    height : 25,
    backgroundColor : theme.colors.ligth,
    alignItems : 'center',
    justifyContent : 'center'
  },
  line: {
    height : 1,
    margin : 10,
    backgroundColor : theme.colors.secondary
  },
  flatFullButton: {
    backgroundColor : theme.colors.ligth,
    flex: 1,
    justifyContent : 'center',
    flexDirection : 'row'
  }
})


export {styles, theme}
