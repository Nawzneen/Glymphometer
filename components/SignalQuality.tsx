import React, { useState } from "react";
import { View, Text } from "react-native";
import SensorColumn from "@/components/tabs/SensorColumn";
import { Switch } from "react-native";
interface SignalQualityProps {
  isDataStreaming: boolean;
  onToggleDataStreaming: (value: boolean) => void;
}
const SignalQuality: React.FC<SignalQualityProps> = ({
  isDataStreaming,
  onToggleDataStreaming,
}) => {
  return (
    <>
      <View className="mt-8 bg-white flex items-center justify-center  w-[95%] mx-auto">
        <View className="mt-10 w-[95%] bg-[#f7f0ba] shadow-lg rounded-lg flex-row items-center justify-between px-5 py-4 mb-2 mx-auto">
          <Text className="flex-1 text-center font-bold text-base">
            {isDataStreaming ? "Pause" : "Start"} Receiving Data
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDataStreaming ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={onToggleDataStreaming}
            value={isDataStreaming}
          />
        </View>

        <View className="rounded-lg flex-row justify-center w-[95%] h-48 bg-[aliceblue] shadow-lg">
          <SensorColumn title="NIRS 1" isDataStreaming={isDataStreaming} />
          <SensorColumn title="NIRS 2" isDataStreaming={isDataStreaming} />
          <SensorColumn title="NIRS 3" isDataStreaming={isDataStreaming} />
        </View>
      </View>
    </>
  );
};

export default SignalQuality;
