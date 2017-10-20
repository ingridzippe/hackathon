import React from 'react';
import {
  AsyncStorage,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ListView,
  Alert,
  Button
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Location, Permissions, MapView } from 'expo';

//Screens
class LoginScreen extends React.Component {
  static navigationOptions = {
    title: 'Login',
  };
  press() {
    this.props.navigation.navigate('RealLogin');
  }
  register() {
    this.props.navigation.navigate('Register');
  }
  componentDidMount() {
      AsyncStorage.getItem('user')
        .then((result) => {
          console.log(result);
          if(result) {
            this.props.navigation.navigate('Users')
          } else {
            console.log('no user loser');
          }
        })
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.textBig}>Login to HoHoHo!</Text>
        <TouchableOpacity onPress={ () => {this.press()} } style={[styles.button, styles.buttonGreen]}>
          <Text style={styles.buttonLabel}>Tap to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={ () => {this.register()} }>
          <Text style={styles.buttonLabel}>Tap to Register</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

class RegisterScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: ''
    }
  }
  static navigationOptions = {
    title: 'Register'
  };
  postLogin() {
  console.log('hhhhhhhh');
    return fetch('https://hohoho-backend.herokuapp.com/register', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        /* do something with responseJson and go back to the Login view but
         * make sure to check for responseJson.success! */
        if (responseJson.success === true) {
          this.props.navigation.goBack()
        } else {
          alert('invalid')
        }
        console.log(responseJson)
      })
      .catch((err) => {
        /* do something if there was an error with fetching */
        console.log('it errored')
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder = "Username"
          onChangeText={(text) => this.setState({username: text})} />
        <TextInput
          style={styles.input}
          placeholder = "Password"
          secureTextEntry={true}
          onChangeText={(text) => this.setState({password: text})} />
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={ () => {this.postLogin()} }>
          <Text style={styles.buttonLabel}>Register</Text>
        </TouchableOpacity>
      </View>
    )
  }
}


class RealLoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      message: ''
    }
  }
  static navigationOptions = {
    title: 'RealLogin'
  };
  postSignin() {
  console.log('signing in');
    return fetch('https://hohoho-backend.herokuapp.com/login', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        /* do something with responseJson and go back to the Login view but
         * make sure to check for responseJson.success! */
        if (responseJson.success === true) {
          AsyncStorage.setItem('user', JSON.stringify({
            username: this.state.username,
            password: this.state.password}
          ))
          this.props.navigation.navigate('Users')
        } else {
          alert('invalid')
          this.setState({message: 'invalid login'})
        }
      })
      .catch((err) => {
        /* do something if there was an error with fetching */
        console.log('it errored')
      });
  }

  render() {
    return (
        <View style={styles.container}>
          <Text>{this.state.message}</Text>
          <TextInput
            style={styles.input}
            placeholder = "Username"
            onChangeText={(text) => this.setState({username: text})} />
          <TextInput
            style={styles.input}
            placeholder = "Password"
            secureTextEntry={true}
            onChangeText={(text) => this.setState({password: text})} />
          <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={ () => {this.postSignin()} }>
            <Text style={styles.buttonLabel}>Login</Text>
          </TouchableOpacity>
        </View>
    )
  }
}


class UsersScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Users',
      headerRight: (<Button title='Messages' onPress={() => navigation.navigate('Messages')} />),
    }
  };
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([])
    };
    fetch('https://hohoho-backend.herokuapp.com/users')
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.success === true) {
          console.log('ds', ds)
          this.setState({dataSource: ds.cloneWithRows(responseJson.users)})
        } else {
          alert('invalid')
        }
        console.log(responseJson)
      })
      .catch((err) => {
        console.log('it errored')
      });
  }
  touchUser(user) {
  console.log('touch user');
    return fetch('https://hohoho-backend.herokuapp.com/messages', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: user._id,
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.success === true) {
          Alert.alert(
           'Success',
           'Your HO HO HO ' + user.username + ' has been sent',
           [{text: 'Dismiss Button'}] // Button
          )
        } else {
          alert('did not send')
        }
        console.log(responseJson)
      })
      .catch((err) => {
        /* do something if there was an error with fetching */
        console.log('it errored')
      });
  }
  longTouchUser(user, lat, long) {
  console.log('long touch user');
    return fetch('https://hohoho-backend.herokuapp.com/messages', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: user._id,
          location: {
            longitude: long,
            latitude: lat
          }
        })
      })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.success === true) {
          console.log('respone', responseJson)
          console.log('LOCATION', location)
          Alert.alert(
           'Success',
           'Your HO HO HO ' + user.username + ' has been sent',
           [{text: 'Dismiss Button'}] // Button
          )
        } else {
          alert('did not send')
        }
        console.log(responseJson)
      })
      .catch((err) => {
        /* do something if there was an error with fetching */
        console.log('it errored')
      });
  }
  sendLocation = async(user) => {

    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      //handle failure
      alert('Sorry this app cannot do cool things now.')
    }
    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true});
    this.longTouchUser(user, location.coords.latitude, location.coords.longitude);
    console.log('kasdfksjf;slf')
  }
  render() {
    return (
      <View style={styles.container}>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) =>
            <TouchableOpacity
              onPress={this.touchUser.bind(this, rowData)}
              onLongPress={this.sendLocation.bind(this, rowData)}
              delayLongPress={100} >
              <Text>{rowData.username}</Text>
            </TouchableOpacity>
          }
        />
      </View>
    )
  }
}

class MessagesScreen extends React.Component {
  static navigationOptions = {
    title: 'Messages' //you put the title you want to be displayed here
  };
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows([])
    };
    fetch('https://hohoho-backend.herokuapp.com/messages')
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.success === true) {
          console.log('RESPONSE JSON MESSAAGES', responseJson)
          console.log('ds', ds)
          this.setState({dataSource: ds.cloneWithRows(responseJson.messages)})
        } else {
          alert('invalid')
        }
        console.log(responseJson)
      })
      .catch((err) => {
        console.log(err)
        console.log('it errored MMMMM')
      });
  }
  // componentDidMount() {
  //   this.props.navigation.setParams({
  //     onRightPress: yourHandlerFunctionGoesHere
  //   })
  // }
  render() {
    return (
      <View style={styles.container}>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={(rowData) =>
            <TouchableOpacity>
              <Text>{rowData.from.username}</Text>
              <Text>{rowData.to.username}</Text>
              <Text>{rowData.timestamp}</Text>
            </TouchableOpacity>
          }
        />

      </View>
    )
  }
}


//Navigator
export default StackNavigator({
  Login: {
    screen: LoginScreen,
  },
  Register: {
    screen: RegisterScreen,
  },
  RealLogin: {
    screen: RealLoginScreen,
  },
  Users: {
    screen: UsersScreen,
  },
  Messages: {
    screen: MessagesScreen,
  },
}, {initialRouteName: 'Login'});


//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  containerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  input: {
    margin: 15,
    height: 40,
    borderColor: '#7a42f4',
    borderWidth: 1
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  textBig: {
    fontSize: 36,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5
  },
  buttonRed: {
    backgroundColor: '#FF585B',
  },
  buttonBlue: {
    backgroundColor: '#0074D9',
  },
  buttonGreen: {
    backgroundColor: '#2ECC40'
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  }
});
