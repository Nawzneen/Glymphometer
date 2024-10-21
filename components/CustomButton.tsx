import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface CustomButtonProps {
  title?: string;
  onPress?: () => void;
  customButtonStyle?: object;
  textStyle?: object;
  className?: object;
}
const CustomButton: React.FC<CustomButtonProps> = ({
  title = "Click Me", // Default title
  onPress = () => alert("Button Pressed!"), // Default onPress action
  customButtonStyle = {}, // Default button style
  textStyle = {}, // Default text style
  className = {},
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, customButtonStyle]} // Combine default and overridden styles
      className="bg-primary-color"
      onPress={onPress}
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
