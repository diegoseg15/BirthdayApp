import React, {useState, useEffect} from 'react';
import {StyleSheet, SafeAreaView, StatusBar, LogBox} from 'react-native';
import {decode, encode} from 'base-64';
import Auth from './src/components/Auth';
import firebase from './src/utils/firebase';
import 'firebase/auth';
import ListBithday from './src/components/ListBithday';

if (!global.btoa) global.btoa = encode;
if (!global.atob) global.atob = decode;
LogBox.ignoreLogs([
  `AsyncStorage has been extracted from react-native core and will be removed in a future release.`,
]);

export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(response => {
      setUser(response);
    });
  }, []);

  if (user === undefined) return null;
  return (
    <>
      <StatusBar
        barStyle="black-content"
        backgroundColor="#15212b" //color extra que no esta en el video
      />
      <SafeAreaView style={styles.background}>
        {user ? <ListBithday user={user} /> : <Auth />}
      </SafeAreaView>
    </>
  );
}

// function Logout() {
//   const logout = () => {
//     firebase.auth().signOut();
//   };

//   return (
//     <View>
//       <Text>Estas logedo</Text>
//       <Button title="Cerrar Sesión" onPress={logout} />
//     </View>
//   );
// }

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#15212b',
    height: '100%',
  },
});
