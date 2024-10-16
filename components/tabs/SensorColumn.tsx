import React from "react";
import { View, Text, StyleSheet } from "react-native";
interface SensorColumnProps {
  title: string;
  isEnabled: boolean;
}
const getBackgroundColor = () => {
  const numbers = [10, 20, 30];
  const randomIndex = Math.floor(Math.random() * numbers.length);
  let value = numbers[randomIndex];
  let color;
  if (value === 10) {
    color = "red";
  } else if (value === 20) {
    color = "yellow";
  } else if (value === 30) {
    color = "green";
  }
  return color;
};

// Reusable component for SensorColumn
const SensorColumn: React.FC<SensorColumnProps> = ({ title, isEnabled }) => {
  const renderBoxes = () => {
    const backgroundColor = isEnabled ? getBackgroundColor() : "white";

    return [1, 2, 3].map((index) => (
      <View
        key={index}
        className="rounded-full border border-gray-600 border-1 w-[50px] h-[50px] "
        style={{ backgroundColor }}
      />
    ));
  };

  return (
    <View className="grid gap-x-1 gap-y-1 items-center">
      <Text>{title}</Text>
      {renderBoxes()}
    </View>
  );
};

export default SensorColumn;
