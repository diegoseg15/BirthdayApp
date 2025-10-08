# BirthdayApp *(BETA)*

**BirthdayApp** es una aplicación móvil para **recordar cumpleaños** desarrollada con **React Native**. Permite **registrar, listar y gestionar** cumpleaños de familiares y amigos. Los datos se almacenan en **Firebase**.

> **Estado:** Versión **BETA**.
> Puede contener cambios no definitivos y pequeños errores mientras consolidamos la versión estable.

## Tecnologías

* React Native **0.70.6**
* Firebase Web SDK
* @react-native-community/datetimepicker, react-native-modal-datetime-picker
* AsyncStorage, moment

## Autor

* **GitHub:** [diegoseg15](https://github.com/diegoseg15)
* **LinkedIn:** [Diego Segovia](https://www.linkedin.com/in/diegoseg15)
* **Portafolio:** [portfolio-77060.web.app](https://portfolio-77060.web.app/)

---

## Requisitos previos

* **Node.js** 16.x (recomendado: 16.20.x) y **npm** 8+
* **Java 11**
* **Android SDK** (Build-Tools y Platform 31+)
* Dispositivo o emulador Android configurado

---

## Instalación

```bash
git clone https://github.com/diegoseg15/birthdayapp.git
cd birthdayapp
npm install
```

---

## Ejecución en desarrollo

En una terminal:

```bash
npm run start
```

En otra terminal:

```bash
npm run android
```

---

## Scripts

```json
"scripts": {
  "android": "react-native run-android",
  "ios": "react-native run-ios",
  "start": "react-native start",
  "test": "jest",
  "lint": "eslint ."
}
```

---

## Generar APK

### Debug (para pruebas)

```bash
cd android
./gradlew assembleDebug
```

Salida: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release firmado (para distribuir)

1. Genera un **keystore**:

   ```bash
   cd android/app
   keytool -genkey -v -keystore my-release-key.jks -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Configura credenciales en `~/.gradle/gradle.properties`:

   ```
   MYAPP_UPLOAD_STORE_FILE=android/app/my-release-key.jks
   MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
   MYAPP_UPLOAD_STORE_PASSWORD=********
   MYAPP_UPLOAD_KEY_PASSWORD=********
   ```
3. En `android/app/build.gradle`, define `signingConfigs.release` y úsalo en `buildTypes.release` (puedes activar `minifyEnabled` y `shrinkResources`).
4. Construye:

   ```bash
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

Salida: `android/app/build/outputs/apk/release/app-release.apk`

---

## Componentes principales

* **ActionBar**: navegación y acciones.
* **AddBirthday**: alta de cumpleaños.
* **ListBirthday**: listado y organización.
* **LoginForm**: inicio de sesión.
* **RegisterForm**: registro de usuario.

---

## Estructura sugerida

```
src/
  components/
  screens/
  utils/
    firebase.js
  hooks/
```

---

## Versionado

* **v1.x** → versión React Native CLI (**BETA**).
* **v2.x** → migración a Expo (en rama/tag separado).

Ejemplo de etiquetado:

```bash
git tag -a v1.0.0 -m "Release (BETA): RN CLI v1.0.0"
git push origin v1.0.0
```

---

## Contribución

1. Crea una rama `feat/...` o `fix/...`.
2. Asegura lint y tests.
3. Abre un Pull Request hacia `main`.

---

## Troubleshooting (rápido)

* **Metro**: si notas comportamiento extraño, reinicia con caché limpio
  `npm run start -- --reset-cache`
* **Gradle/JDK**: usa **Java 11** para RN 0.70.x.
* **Builds**: limpia antes de reconstruir
  `cd android && ./gradlew clean`

---

## Licencia

Distribuido bajo **Apache License 2.0**. Consulta [LICENSE](LICENSE) para más detalles.

---
