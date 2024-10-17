import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Switch,
  Button,
  Text,
  View,
} from "react-native";
import SensorColumn from "@/components/tabs/SensorColumn";
const getRandomNumber = () => {
  const numbers = [10, 20, 30];
  const randomIndex = Math.floor(Math.random() * numbers.length);
  return numbers[randomIndex];
};

const getBackgroundColor = () => {
  const numbers = [10, 20, 30];
  const randomIndex = Math.floor(Math.random() * numbers.length);
  let value = numbers[randomIndex];
  let color;
  if (value === 10) {
    color = "tomato";
  } else if (value === 20) {
    color = "gold";
  } else if (value === 30) {
    color = "greenyellow";
  }
  return color;
};

export default function Connect() {
  return (
    <View>
      <View className="relative bg-[#000000d7] h-52 w-full flex justify-center items-center ">
        <View className=" bg-white w-[95%] h-36 rounded-lg shadow-md flex items-center justify-center ">
          <View className="flex flex-row w-full items-center p-2">
            <View className="flex items-center justify-center flex-1">
              <Text className="text-base">Temperature</Text>
              <Text className="text-black text-base">37°C</Text>
            </View>
            <View className="flex items-center justify-center flex-1">
              <Text className="text-base">HR(bpm)</Text>
              <Text className="text-black text-base">60</Text>
            </View>
            <View className="flex items-center justify-center flex-1">
              <Text className="text-base">HRV(ms)</Text>
              <Text className="text-black text-base">9°C</Text>
            </View>
          </View>
          <View className="flex-row w-full items-center p-2">
            <View className="flex items-center justify-center flex-1">
              <Text className="text-base">Temp</Text>
              <Text className="text-black text-base">7%</Text>
            </View>
            <View className="flex items-center justify-center flex-1">
              <Text className="text-base">Temp</Text>
              <Text className="text-black text-base">5</Text>
            </View>
            <View className="flex items-center justify-center flex-1">
              <Text className="text-base">HRV</Text>
              <Text className="text-black text-base">30°C</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
