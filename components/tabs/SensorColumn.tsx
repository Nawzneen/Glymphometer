import React from "react";
import { View, Text, StyleSheet } from "react-native";
interface SensorColumnProps {
  title: string;
  isDataStreaming: boolean;
}
const getBackgroundColor = () => {
  const numbers = [10, 20, 30];
  const randomIndex = Math.floor(Math.random() * numbers.length);
  let value = numbers[randomIndex];
  let color;
  if (value === 10) {
    color = "#FFEB3B";
  } else if (value === 20) {
    color = "#F44336";
  } else if (value === 30) {
    color = "#4CAF50";
  }
  return color;
};

// Reusable component for SensorColumn
const SensorColumn: React.FC<SensorColumnProps> = ({
  title,
  isDataStreaming,
}) => {
  const renderBoxes = () => {
    const backgroundColor = isDataStreaming ? getBackgroundColor() : "#B0B0B0";

    return [1, 2, 3, 4].map((index) => (
      <View
        key={index}
        className={` border  border-gray-200 w-[50px] h-[50px] `}
        style={{ backgroundColor }}
      />
    ));
  };

  return (
    <View className="grid items-center my-4">
      <Text className="mb-4">{title}</Text>
      {renderBoxes()}
    </View>
  );
};

export default SensorColumn;
