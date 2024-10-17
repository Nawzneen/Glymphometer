import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const CustomButton = ({
  title = "Click Me", // Default title
  onPress = () => alert("Button Pressed!"), // Default onPress action
  customButtonStyle = {}, // Default button style
  textStyle = {}, // Default text style
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, customButtonStyle]} // Combine default and overridden styles
      onPress={onPress}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#5c5de5",
    padding: 10,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    paddingHorizontal: 10,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomButton;
