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
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

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
      <View className="bg-white flex items-center justify-center mt-5 w-[95%] mx-auto">
        <View className="mt-10 w-[95%] bg-[#f7f0ba] shadow-lg rounded-lg flex-row items-center justify-between px-5 py-4 mb-2 mx-auto">
          <Text className="flex-1 text-center font-bold text-sm">
            Signal Quality
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>

        <View className="rounded-lg flex-row justify-center w-[95%] h-48 bg-[aliceblue] shadow-lg">
          <SensorColumn title="NIRS 1" isEnabled={isEnabled} />
          <SensorColumn title="NIRS 2" isEnabled={isEnabled} />
          <SensorColumn title="NIRS 3" isEnabled={isEnabled} />
        </View>
      </View>
    </View>
  );
}
