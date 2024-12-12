import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { AuthContext } from "@/contexts/AuthContext";
import CustomButton from "@/components/CustomButton";
interface SignUpFormProps {
  onSignUpSuccess: () => void;
}

export default function SignUpForm({ onSignUpSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useContext(AuthContext);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Validation Error", "Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Validation Error", "Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      setLoading(false);
      Alert.alert("Success", "Account created successfully.");
      onSignUpSuccess();
    } catch (error) {
      setLoading(false);
      Alert.alert("Sign up Failed", "Invalid email or password.");
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

      <Text className="text-base mt-4">Confirm Password:</Text>
      <TextInput
        className="h-10 border border-gray-300 rounded-md p-2 mt-2"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <View className="mt-4 ">
        <CustomButton
          title={loading ? "Signing Up..." : "Sign Up"}
          onPress={handleSignUp}
          disabled={loading}
        />
      </View>
    </View>
  );
}
