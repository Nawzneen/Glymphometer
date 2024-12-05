// services/authService.js
// import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getIdToken,
  initializeAuth,
  getReactNativePersistence,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Check if all config values are present
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.appId
) {
  throw new Error("Missing Firebase configuration in Expo constants.");
}

// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }

// if (!firebase.apps.length && firebaseConfig) {
//   firebase.initializeApp(firebaseConfig);
// } else if (!firebaseConfig) {
//   console.error("Firebase config is missing");
// }

// console.log("app is", app);
// const auth = getAuth(app);
// To persist firebase user auth state across app restarts, we need to use a persistence mechanism. In this case, we are using AsyncStorage from @react-native-async-storage/async-storage. We need to pass it to the initializeAuth function to set up the persistence.

export async function loginAndGetToken(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await getIdToken(userCredential.user);
    console.log("Successfully logged in. Token:", token);
    return token;
  } catch (error: any) {
    console.error("Error during login:", error.message);
    throw error;
  }
}

export async function signUpAndGetToken(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await getIdToken(userCredential.user);
    return token;
  } catch (error: any) {
    console.error("Error during sign up:", error.message);
    throw error;
  }
}

export async function signOutUser() {
  try {
    // await firebase.auth().signOut();Z
    await signOut(auth); // Sign out from Firebase
    await SecureStore.deleteItemAsync("userToken");
  } catch (error: any) {
    console.error("Error during sign out:", error.message);
    throw error;
  }
}

// export async function loginAndGetToken(email, password) {
//   try {
//     //console.log(email)
//     const userCredential = await firebase
//       .auth()
//       .signInWithEmailAndPassword(email, password);
//     //console.log(password)

//     const token = await userCredential.user.getIdToken();
//     //console.log("Successfully logged in. Token:", token);
//     return token;
//   } catch (error) {
//     throw error; // Rethrow the error to catch it in the component
//     //console.log("$££££££££");

//     //console.error("Error during login:", error.message);
//     //console.log("$££££££££");

//     // return null;
//   }
// }
// export async function signUpAndGetToken(email, password) {
//   try {
//     const userCredential = await firebase
//       .auth()
//       .createUserWithEmailAndPassword(email, password);
//     const token = await userCredential.user.getIdToken();
//     //console.log("Successfully signed up. Token:", token);
//     return token;
//   } catch (error) {
//     //console.error("Error during sign up:", error.message);
//     // return null;
//     throw error; // Rethrow the error to catch it in the component

//   }
// }
