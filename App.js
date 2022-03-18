import React, { Component } from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert,
  Vibration
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import Boundary, {Events} from 'react-native-boundary';

export default class App extends Component<Props> {
state = {
    barcodes: []
  }

 barcodeRecognized = ({ barcodes }) => {
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
         'QR Code found',
         data,
         [
           {
             text: 'Check in',
             onPress: () => Alert.alert('Success', 'You are now checked-in'),
             style: 'cancel'
           }
         ],
         { cancelable: true }
       )


 render() {
 return (
   <View style={styles.container}>
   <RNCamera
   ref={ref => {
              this.camera = ref
             }}
             style={{
               flex: 1,
               width: '100%',
             }}
             onGoogleVisionBarcodesDetected={this.barcodeRecognized}
           >
            {this.renderBarcodes}
             </RNCamera>
          </View>
                            )
        }

     /* // Geolocation
        UNSAFE_componentWillMount() {
            Boundary.add({
              lat: 48.762099,
              lng: 9.177237,
              radius: 50, // in meters
              id: "Office",
            })
              .then(() => console.log("success!"))
              .catch(e => console.error("error :(", e));

            Boundary.on(Events.ENTER, id => {
              console.log(`You are getting close to your ${id}!!`);
            });

            Boundary.on(Events.EXIT, id => {
              console.log(`You just left your ${id}!`)
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
          */
        }

// Style
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black'
      },
      scanner: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
      }
    })