// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import {
  loginAndGetToken,
  refreshToken,
  signOutUser,
  signUpAndGetToken,
} from "../services/authService"; // Ensure you have these service functions

interface AuthContextType {
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("userToken");
        const storedRefreshToken =
          await SecureStore.getItemAsync("refreshToken");
        console.log(
          "storedToken & refresh token in authContext is",
          storedToken,
          storedRefreshToken
        );
        if (storedToken) {
          const expired = await isTokenExpired(storedToken);
          if (!expired) {
            setToken(storedToken);
          } else if (storedRefreshToken) {
            try {
              const newToken = await refreshToken(storedRefreshToken);
              await SecureStore.setItemAsync("userToken", newToken); // Save the new token
              setToken(newToken);
            } catch (error) {
              console.error("Error refreshing token:", error);
              setToken(null);
            }
          } else {
            console.log("No refresh token available, Logging out...");
            setToken(null);
          }
        } else {
          setToken(null);
        }
      } catch (error) {
        console.error("Error loading token:", error);
        setToken(null);
      }
    };
    loadToken();
  }, []);

  const isTokenExpired = async (token: string): Promise<boolean> => {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      // check if token is expired
      if (decoded.exp < currentTime) {
        console.log("token is expired. Attempting to refresh...");
        const storedRefreshToken =
          await SecureStore.getItemAsync("refreshToken");
        if (storedRefreshToken) {
          try {
            const newToken = await refreshToken(storedRefreshToken);
            await SecureStore.setItemAsync("userToken", newToken); // Save the new token
            return false; // Token succesfully refresed
          } catch (error) {
            console.error("Error refreshing token:", error);
          }
        }
        console.log("Refresh token unavailable or refresh failed.");
        return true; // Token expired and no refresh token available
      }
      return false; // Token is valid
    } catch (error) {
      console.error("Error checking token expiration:", error);
      return true; // Assume expired if error occurs
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { token, refreshToken } = await loginAndGetToken(email, password);
      console.log("token from signIn", token);
      if (token && refreshToken) {
        setToken(token);
        await SecureStore.setItemAsync("userToken", token); //Access token
        await SecureStore.setItemAsync("refreshToken", refreshToken); // Refresh token
      } else {
        console.log("Login failed, missing token/refresh token");
        throw new Error("Login failed. please try again.");
      }
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        throw new Error(
          "No user found with this email. Please check and try again."
        );
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Invalid password. Please try again.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error(
          "The email address is not valid. Please check and try again."
        );
      } else if (error.code === "auth/user-disabled") {
        throw new Error(
          "This account has been disabled. Contact support for help."
        );
      } else {
        throw new Error(
          "An unexpected error occurred. Please try again later."
        );
      }
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const token = await signUpAndGetToken(email, password);
      if (token) {
        setToken(token);
        await SecureStore.setItemAsync("userToken", token);
      }
    } catch (error: any) {
      if (error.code === "auth/invalid-email") {
        throw new Error(
          "The email address is not valid. Please check and try again."
        );
      } else if (error.code === "auth/weak-password") {
        throw new Error(
          "The password is too weak. Please choose a stronger password."
        );
      } else if (error.code === "auth/email-already-in-use") {
        throw new Error(
          "This email is already in use. Please use a different email."
        );
      } else {
        throw new Error(
          "An unexpected error occurred. Please try again later."
        );
      }
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
      setToken(null);
      // await SecureStore.deleteItemAsync("userToken"); No need to delete here, the AuthServices will take care of it
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
