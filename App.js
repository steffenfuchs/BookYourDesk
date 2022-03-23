import React, { Component, useCallback } from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  Vibration,
  Linking,
  PermissionsAndroid,
  TouchableOpacity,
  Button} from 'react-native';
import {RNCamera}from'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import Boundary, {Events} from 'react-native-boundary';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import PushNotification, {Importance} from 'react-native-push-notification';

//Location Permissions

const OpenSettingsButton = ({ children }) => {
  const handlePress = useCallback(async () => {
    // Open the custom settings if available
    await Linking.openSettings();
  }, []);

  return <Button title={children} onPress={handlePress} />;
};

// Push-Notifications

PushNotification.createChannel(
  {
    channelId: '1', //obligatory
    channelName: 'Geofence Channel', //obligatory
    channelDescription: 'A channel to categorise your notifications',
    playSound: true,
    soundName: 'default',
    importance: Importance.HIGH,
  },
  created => {
    if (created) console.log('Notification channel created: Geofence Channel');
    else console.log('Notification channel already exist: Geofence Channel');
  },
);

PushNotification.channelExists('1', function (exists) {
  console.log(exists); // true/false
});


// Check-in button

    const checkInText = [
    {text: 'You are not yet checked in.', hint: 'Please scan the QR code on your desk to do so.'},
    {text: 'You successfully checked in to your desk.', hint: 'Do not forget to check out before leaving.'}
    ];


//App

export default class App extends Component<Props> {

state = {
    barcodes: [],
    isBarcodeRead: false, // default to false,
    barcodeType: '',
    barcodeValue: '',
    checkInStatus: 0,
    isVisible: false,
  }

// Barcode

 barcodeRecognized = ({ barcodes, isBarcodeRead }) => {
     barcodes.forEach(barcode => console.log(barcode.data))
     this.setState({ barcodes })
   }

 renderBarcodes = () => (
     <View>
       {this.state.barcodes.map(this.renderBarcode)}
     </View>
   )

 renderBarcode = ({ data }) =>
       Alert.alert(
          'QR code found',
          data,
          [
            {text: 'Cancel', onPress: () => console.log('Check in cancelled'), style: 'cancel'},
            {text: 'Scan again', onPress: () => console.log('Another scan triggered')},
            {text: 'Check in', onPress: () => console.log('Okay Pressed')},
          ],
          { cancelable: true }
        )

  renderCheckIn=() =>{
  this.setState({ isVisible: true})}

 render() {
 let checkInStatus = this.state.checkInStatus;
 const checkIn = checkInText[checkInStatus];
 let nextCheckInStatus = checkInStatus + 1;
 if(nextCheckInStatus === checkInText.length) nextCheckInStatus = 0;
 return (
 <>
   <SafeAreaView style={styles.container}>
   <RNCamera
   ref={ref => {
              this.camera = ref
             }}
             style={styles.camera}
             onGoogleVisionBarcodesDetected={this.barcodeRecognized}
                        >
            <BarcodeMask />
            {this.renderBarcodes ()}
                         </RNCamera>
          </SafeAreaView>

          <OpenSettingsButton>If not yet done, please enable background location permission</OpenSettingsButton>
          <SafeAreaView style={styles.container}>
          <Button title='Check-in' onPress={() => this.setState({ checkInStatus: nextCheckInStatus })}/>
          {this.state.isVisible?<Text style={styles.textChecked}>{checkIn.text}{"\n"}<Text style={styles.textChecked}>{checkIn.hint}</Text></Text>:null}
          <Button onPress={ this.renderCheckIn}
                      title="Render check in text"
                      color="#841584" />
          </SafeAreaView>
        </>

                               )
        }

     // Geolocation
        componentDidMount() {
            Boundary.add({
              lat: 48.762099,
              lng: 9.177237,
              radius: 80, // in meters
              id: "Office",
            })
              .then(() => console.log("Geofence added!"))
              .catch(e => console.error("error :(", e));

            Boundary.on(Events.ENTER, id => {
              console.log(`You are getting close to your ${id}!`);
              //Alert.alert('Welcome!','You are getting closer to your office.\nPlease do not forget to check in.');
              PushNotification.localNotification({
              channelId: '1',
              autoCancel: true,
              bigText: 'You are getting closer to your office',
              subText: 'Welcome!',
              title: 'Welcome!',
              message: 'Tap here to check in.',
              vibrate: true,
              vibration: 300,
              playSound: true,
              soundName: 'default',
              invokeApp: true
                  })
            });

            Boundary.on(Events.EXIT, id => {
              console.log(`You just left your ${id}!`);
              // Alert.alert('Goodbye!','You just left your office. Please do not forget to check out.');
              PushNotification.localNotification({
              channelId: '1',
                          autoCancel: true,
                          bigText:'Open the app with one tap to check out.',
                          subText: 'You just left your office',
                          title: 'Goodbye!',
                          message: 'Tap here to check out.',
                          vibrate: true,
                          vibration: 300,
                          playSound: true,
                          soundName: 'default',
                          invokeApp: true
                        })
            })
          }

          componentWillUnmount() {
            // Remove the events
            Boundary.off(Events.ENTER)
            Boundary.off(Events.EXIT)

            // Remove the boundary from native API´s
            Boundary.remove('Office')
              .then(() => console.log('Goodbye Office'))
              .catch(e => console.log('Failed to delete Office', e))
          }

        }

// Style
    const styles = StyleSheet.create({
      container: {
        flex: 3,
        flexDirection: 'column',
        backgroundColor: 'black',
                    },

      textChecked: {
              textAlign: 'center',
              textAlignVertical: 'center',
              fontWeight: 'bold',
              fontSize: 20,
              backgroundColor: '#7cb48f',
              flex: 2
                                        },
      textNotChecked:      {
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    fontWeight: 'bold',
                    fontSize: 20,
                    marginTop: 10,
                    backgroundColor: '#FE7676',
                    flex: 2
                                              },
    camera: {
              flex: 2,
              width: '100%',
                              },

          })