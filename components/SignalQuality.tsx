import React, { useState } from "react";
import { View, Text } from "react-native";
import SensorColumn from "@/components/tabs/SensorColumn";
import { Switch } from "react-native";
import PulsingRings from "./PulsingRings";
interface SignalQualityProps {
  isDataStreaming: boolean;
  onToggleDataStreaming: (value: boolean) => void;
  isLoading: boolean;
}
const SignalQuality: React.FC<SignalQualityProps> = ({
  isDataStreaming,
  onToggleDataStreaming,
  isLoading,
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
            disabled={isLoading} // Disable switch while toggling
          />
        </View>
        {isDataStreaming ? (
          <View className="mt-4 flex flex-row justify-center items-center">
            <Text className="text-base text-success-color">
              Data is being transfered...
            </Text>
            <View className="ml-4">
              <PulsingRings />
            </View>
          </View>
        ) : (
          <View className="mt-4 flex flex-row justify-center items-center">
            <Text className="text-base">
              No Data received from Glymphometer.
            </Text>
          </View>
        )}

        {/* <View className="rounded-lg flex-row justify-center w-[95%] ">
          <SensorColumn title="NIRS1" isDataStreaming={isDataStreaming} />
          <SensorColumn title="NIRS2" isDataStreaming={isDataStreaming} />
          <SensorColumn title="NIRS3" isDataStreaming={isDataStreaming} />
          <SensorColumn title="EEG" isDataStreaming={isDataStreaming} />
          <SensorColumn title="EKG" isDataStreaming={isDataStreaming} />
        </View> */}
      </View>
    </>
  );
};

export default SignalQuality;
