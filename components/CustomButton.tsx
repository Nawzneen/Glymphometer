import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface CustomButtonProps {
  title: string;
  onPress?: () => void;
  customButtonStyle?: object;
  textStyle?: object;
  className?: object;
  disabled?: boolean;
}
const CustomButton: React.FC<CustomButtonProps> = ({
  title = "Click Me", // Default title
  onPress = () => alert("Button Pressed!"), // Default onPress action
  customButtonStyle = {}, // Default button style
  textStyle = {}, // Default text style
  className = {},
  disabled = false, // Default disabled state
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        customButtonStyle,
        disabled && { backgroundColor: "gray", opacity: 0.6 },
      ]} // Combine default and overridden styles
      className="bg-primary-color"
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyle]} className="text-light-text-color">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 55,
    paddingHorizontal: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomButton;
