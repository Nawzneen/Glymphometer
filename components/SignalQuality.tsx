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
      <View className="mt-8 py-10 bg-white flex items-center justify-center  w-[95%] mx-auto shadow-lg">
        <View className=" w-[95%] bg-primary-color shadow-lg rounded-lg flex-row items-center justify-between px-5 py-4 mb-2 mx-auto">
          <Text className="flex-1 text-center font-bold text-base text-white">
            {isDataStreaming ? "Pause" : "Start"} Data Streaming
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDataStreaming ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={onToggleDataStreaming}
            value={isDataStreaming}
          />
        </View>

        <View className="rounded-lg flex-row justify-center w-[95%] ">
          <SensorColumn title="NIRS1" isDataStreaming={isDataStreaming} />
          <SensorColumn title="NIRS2" isDataStreaming={isDataStreaming} />
          <SensorColumn title="NIRS3" isDataStreaming={isDataStreaming} />
          <SensorColumn title="EEG" isDataStreaming={isDataStreaming} />
          <SensorColumn title="EKG" isDataStreaming={isDataStreaming} />
        </View>
      </View>
    </>
  );
};

export default SignalQuality;
