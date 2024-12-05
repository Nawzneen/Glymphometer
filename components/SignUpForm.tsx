import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../contexts/AuthContext";

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
    <View style={styles.container}>
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Confirm Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Button
        title={loading ? "Signing up..." : "Sign Up"}
        onPress={handleSignUp}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});
