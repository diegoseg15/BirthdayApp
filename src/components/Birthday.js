import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';

export default function Birthday(props) {
  const {birthday, deleteBirthday} = props;
  const past = birthday.days > 0 ? true : false;
  const infoDay = () => {
    if (birthday.days === 0) {
      return <Text style={{color: '#fff'}}>Es hoy</Text>;
    } else {
      const days = birthday.days;
      return (
        <View style={{flexDirection: 'row'}}>
          <Text style={{color: '#fff', paddingHorizontal: 3}}>
            {-days === 1 ? '' : -days}
          </Text>
          <Text style={{color: '#fff'}}>
            {days === -1 ? 'Es Mañana' : 'días'}
          </Text>
        </View>
      );
    }
  };
  return (
    <TouchableOpacity
      style={[
        styles.card,
        past
          ? styles.past
          : birthday.days === 0
          ? styles.actual
          : styles.current,
      ]}
      onPress={() => deleteBirthday(birthday)}>
      <Text style={styles.userName}>
        {birthday.name} {birthday.lastname}
      </Text>
      {past ? <Text style={{color: '#fff'}}>Pasado</Text> : infoDay()}
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 60,
    alignItems: 'center',
    paddingHorizontal: 25, //paddingHorizontal: 10
    margin: 10,
    borderRadius: 15,
  },
  actual: {
    backgroundColor: '#3F6D02',
  },
  current: {
    backgroundColor: '#013561',
  },
  past: {
    backgroundColor: '#630101',
  },
  userName: {
    color: '#fff',
    fontSize: 16,
  },
});
