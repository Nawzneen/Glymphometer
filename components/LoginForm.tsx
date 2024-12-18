import React, { useState, useContext } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { AuthContext } from "@/contexts/AuthContext";
import CustomButton from "@/components/CustomButton";

interface LoginFormProps {
  onLoginSuccess: () => void;
}
export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password); // No need to handle token here, AuthContext will do it.
      setLoading(false);
      onLoginSuccess();
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View className="w-full p-5">
      <Text className="text-base mt-4">Email:</Text>
      <TextInput
        className="h-10 border border-gray-300 rounded-md p-2 mt-2"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text className="text-base mt-4">Password:</Text>
      <TextInput
        className="h-10 border border-gray-300 rounded-md p-2 mt-2"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View className="mt-4 ">
        <CustomButton
          title={loading ? "Logging in..." : "Login"}
          onPress={handleLogin}
          disabled={loading}
        />
      </View>
    </View>
  );
}
