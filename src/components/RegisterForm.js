import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {validateEmail} from '../utils/validation';
import firebase from '../utils/firebase';

export default function RegisterForm(props) {
  const {changeForm} = props;
  const [formData, setFormData] = useState(defaultVaule());
  const [formError, setFormError] = useState({});

  const register = () => {
    let errors = {};
    if (!formData.email || !formData.password || !formData.repeatpassword) {
      if (!formData.email) errors.email = true;
      if (!formData.password) errors.password = true;
      if (!formData.repeatpassword) errors.repeatpassword = true;
    } else if (!validateEmail(formData.email)) {
      errors.email = true;
    } else if (formData.password !== formData.repeatpassword) {
      errors.password = true;
      errors.repeatpassword = true;
    } else if (formData.password.length < 6) {
      errors.password = true;
      errors.repeatpassword = true;
      alert('La contraseña debe tener más de 6 caracteres');
    } else {
      firebase
        .auth()
        .createUserWithEmailAndPassword(formData.email, formData.password)
        .then(() => {
          console.log('cuenta creada');
        })
        .catch(() => {
          setFormError({
            email: true,
            password: true,
            repeatpassword: true,
          });
        });
    }

    setFormError(errors);

    console.log(errors);
  };

  return (
    <>
      <TextInput
        style={[styles.input, formError.email && styles.error]}
        placeholder="Correo electronico"
        placeholderTextColor="#969696"
        onChange={event =>
          setFormData({...formData, email: event.nativeEvent.text})
        }
      />

      <TextInput
        style={[styles.input, formError.password && styles.error]}
        placeholder="Contraseña"
        placeholderTextColor="#969696"
        secureTextEntry={true}
        onChange={event =>
          setFormData({...formData, password: event.nativeEvent.text})
        }
      />

      <TextInput
        style={[styles.input, formError.repeatpassword && styles.error]}
        placeholder="Repetir Contraseña"
        placeholderTextColor="#969696"
        secureTextEntry={true}
        onChange={event =>
          setFormData({...formData, repeatpassword: event.nativeEvent.text})
        }
      />

      <TouchableOpacity onPress={register}>
        <Text style={StyleSheet.btnText}>Registrate</Text>
      </TouchableOpacity>

      <View style={styles.login}>
        <TouchableOpacity onPress={changeForm}>
          <Text style={StyleSheet.btnText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

function defaultVaule() {
  return {
    email: '',
    password: '',
    repeatpassword: '',
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
  login: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 35,
  },
  error: {
    borderColor: '#940c0c',
  },
});
