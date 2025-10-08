import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, View, Alert} from 'react-native';
import AddBirthday from './AddBirthday';
import ActionBar from './ActionBar';
import firebase from '../utils/firebase';
import moment from 'moment';
import Birthday from './Birthday';

firebase.firestore().settings({experimentalForceLongPolling: true});
const db = firebase.firestore(firebase);

export default function ListBithday(props) {
  const {user} = props;
  const [showList, setShowList] = useState(true);
  const [birthday, setBirthday] = useState([]);
  const [pastBirthday, setPastBirthday] = useState([]);
  const [reloadData, setReloadData] = useState(false);

  //   console.log(birthday);

  useEffect(() => {
    setBirthday([]);
    db.collection(user.uid)
      .orderBy('dateBirth', 'asc')
      .get()
      .then(response => {
        const itemsArray = [];
        response.forEach(doc => {
          const data = doc.data();
          data.id = doc.id;
          itemsArray.push(data);
        });
        formatData(itemsArray);
      });
    setReloadData(false);
  }, [reloadData]);

  const formatData = items => {
    const currentDate = moment().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    const birthdayTempArray = [];
    const pastBirthdayTempArray = [];

    items.forEach(item => {
      const dateBirth = new Date(item.dateBirth.seconds * 1000);
      const dateBirthday = moment(dateBirth);
      const currentYear = moment().get('year');
      dateBirthday.set({year: currentYear});

      const diffDate = currentDate.diff(dateBirthday, 'days');
      //   console.log(diffDate);
      const itemTemp = item;
      itemTemp.dateBirthday = dateBirthday;
      itemTemp.days = diffDate;

      if (diffDate <= 0) {
        // if (diffDate === 0) {
        //   alert(`Es el cumpleaños de ${item.name} ${item.lastname}`);
        // }
        birthdayTempArray.push(itemTemp);
      } else {
        pastBirthdayTempArray.push(itemTemp);
      }
    });
    setBirthday(birthdayTempArray);
    setPastBirthday(pastBirthdayTempArray);
  };

  const deleteBirthday = birthday => {
    Alert.alert(
      'Eliminar Cumpleaños',
      `¿Estas seguro de eliminar el cumpleaños de ${birthday.name} ${birthday.lastname}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            db.collection(user.uid)
              .doc(birthday.id)
              .delete()
              .then(() => {
                setReloadData();
              });
          },
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.container}>
      {showList ? (
        <ScrollView style={styles.scrollView}>
          {birthday.map((item, index) => (
            <Birthday
              key={index}
              birthday={item}
              deleteBirthday={deleteBirthday}
            />
          ))}
          {pastBirthday.map((item, index) => (
            <Birthday
              key={index}
              birthday={item}
              deleteBirthday={deleteBirthday}
            />
          ))}
        </ScrollView>
      ) : (
        <AddBirthday
          user={user}
          setShowList={setShowList}
          showList={showList}
          setReloadData={setReloadData}
        />
      )}

      <ActionBar showList={showList} setShowList={setShowList} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: '100%',
  },
  scrollView: {
    marginBottom: 50,
    width: '100%',
  },
});
