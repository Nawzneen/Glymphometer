// using modular approach for firebase
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
  getReactNativePersistence, // it should be a typescript problem, to be fixed
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

// To persist firebase user auth state across app restarts, we need to use a persistence mechanism. In this case, we are using AsyncStorage from @react-native-async-storage/async-storage. We need to pass it to the initializeAuth function to set up the persistence.

export async function loginAndGetToken(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const token = await getIdToken(userCredential.user); //Access token
    const refreshToken = userCredential.user.refreshToken; //Refresh token from firebase
    return { token, refreshToken };
  } catch (error: any) {
    console.log("Error during login:", error.message);
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
    await signOut(auth); // Sign out from Firebase
    await SecureStore.deleteItemAsync("userToken"); // delete token from SecureStore
    await SecureStore.deleteItemAsync("refreshToken"); // delete refresh token from SecureStore
  } catch (error: any) {
    console.log("Error during sign out:", error.message);
    throw error;
  }
}
export async function refreshToken(token: string): Promise<string> {
  try {
    const auth = getAuth();
    console.log(auth);
    const response = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${firebaseConfig.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: token,
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      console.log("data is", data);
      console.log("Successfully refreshed token:", data.access_token);
      return data.access_token;
    } else {
      throw new Error("Failed to refresh token");
    }
  } catch (error: any) {
    console.error("Error refreshing token:", error.message);
    throw error;
  }
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
