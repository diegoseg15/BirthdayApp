import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {validateEmail} from '../utils/validation';
import firebase from '../utils/firebase';

export default function LoginForm(props) {
  const {changeForm} = props;
  const [formData, setFormData] = useState(defaultVaule());
  const [formError, setFormError] = useState({});

  const login = () => {
    let errors = {};
    if (!formData.email || !formData.password) {
      if (!formData.email) errors.email = true;
      if (!formData.password) errors.password = true;
    } else if (!validateEmail(formData.email)) {
      errors.email = true;
    } else {
      firebase
        .auth()
        .signInWithEmailAndPassword(formData.email, formData.password)
        .catch(() =>
          setFormError({
            email: true,
            password: true,
          }),
        );
    }
    setFormError(errors);
  };

  const onChange = (e, type) => {
    // console.log('data:', e.nativeEvent.text);
    // console.log('type', type);
    setFormData({...formData, [type]: e.nativeEvent.text});
  };

  return (
    <>
      <TextInput
        style={[styles.input, formError.email && styles.error]}
        placeholder="Correo Electronico"
        placeholderTextColor="#969696"
        onChange={e => onChange(e, 'email')}
      />

      <TextInput
        style={[styles.input, formError.password && styles.error]}
        placeholder="Contraseña"
        placeholderTextColor="#969696"
        secureTextEntry={true}
        onChange={e => onChange(e, 'password')}
      />

      <TouchableOpacity onPress={login}>
        <Text style={StyleSheet.btnText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.register}>
        <TouchableOpacity onPress={changeForm}>
          <Text style={StyleSheet.btnText}>Registrate</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

function defaultVaule() {
  return {
    email: '',
    password: '',
  };
}

const styles = StyleSheet.create({
  btnText: {
    color: '#fff',
    fontSize: 18,
  },
  input: {
    height: 50,
    color: '#fff',
    width: '80%',
    marginBottom: 25,
    backgroundColor: '#1e3040',
    paddingHorizontal: 20,
    borderRadius: 50,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#1e3040',
  },
  register: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 35,
  },
  error: {
    borderColor: '#940c0c',
  },
});
