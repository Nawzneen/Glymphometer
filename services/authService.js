// services/authService.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import Constants from 'expo-constants';


const firebaseConfig ={
    apiKey: Constants.expoConfig.extra.firebaseApiKey,
    projectId: Constants.expoConfig.extra.firebaseProjectId,
    storageBucket: Constants.expoConfig.extra.firebaseStorageBucket,
    appId: Constants.expoConfig.extra.firebaseAppId,
    } ;


if (!firebase.apps.length && firebaseConfig) {
    firebase.initializeApp(firebaseConfig);
} else if (!firebaseConfig) {
    console.error("Firebase config is missing");
}
    

export async function loginAndGetToken(email,password) {
    try {
        //console.log(email)
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        //console.log(password)

        const token = await userCredential.user.getIdToken();
        //console.log("Successfully logged in. Token:", token);
        return token;
    } catch (error) {
        //console.log("$££££££££");

        //console.error("Error during login:", error.message);
        //console.log("$££££££££");

        return null;
    }
}
