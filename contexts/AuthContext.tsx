// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import {
  loginAndGetToken,
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
        console.log("storedToken in authContext is", storedToken);
        if (storedToken && !isTokenExpired(storedToken)) {
          setToken(storedToken);
        } else {
          console.log("stored oken doesnt exist or exired");
          await SecureStore.deleteItemAsync("userToken");
          setToken(null);
        }
      } catch (error) {
        console.error("Error loading token:", error);
        setToken(null);
      }
    };
    loadToken();
  }, []);

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log("signing In in SignIn with", email, password);
    try {
      const token = await loginAndGetToken(email, password);
      console.log("token from signIn", token);
      if (token) {
        setToken(token);
        await SecureStore.setItemAsync("userToken", token);
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const token = await signUpAndGetToken(email, password);
      if (token) {
        setToken(token);
        await SecureStore.setItemAsync("userToken", token);
      }
    } catch (error) {
      throw error;
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
