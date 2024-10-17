import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const CustomButton = ({
  title = "Click Me", // Default title
  onPress = () => alert("Button Pressed!"), // Default onPress action
  buttonStyle = {}, // Default button style
  textStyle = {}, // Default text style
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle]} // Combine default and overridden styles
      onPress={onPress}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    height: 55,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomButton;
