import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
// import SensorColumn from "@/components/tabs/SensorColumn";
import { Switch } from "react-native";
import PulsingRings from "./PulsingRings";
interface DataStreamingProps {
  isDataStreaming: boolean;
  onToggleDataStreaming: (value: boolean) => void;
  isLoading: boolean;
  packetNumber?: number;
  isRecordingPaused: boolean;
  packetLossData: { packetLoss: number; packetLossPercentage: string } | null;
}
const DataStreaming: React.FC<DataStreamingProps> = ({
  isDataStreaming,
  onToggleDataStreaming,
  isLoading,
  isRecordingPaused,
  packetLossData,
}) => {
  // ECG mode can be Long or Short, send L for long and N for short to BLE
  const [ECGMode, setECGMode] = useState<string>("L");
  return (
    <>
      <View className="mt-8 py-10 bg-white flex items-center justify-center  w-[95%] mx-auto shadow-lg rounded-md">
        <View className=" w-[95%] bg-primary-color shadow-lg rounded-lg flex-row items-center justify-between px-5 py-4 mb-2 mx-auto">
          <Text className="flex-1 text-center font-bold text-base text-white">
            {isDataStreaming ? "Pause" : "Start"} Data Streaming
          </Text>

          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDataStreaming ? "#f5dd4b" : "#f4f3f4"}
            onValueChange={onToggleDataStreaming}
            value={isDataStreaming}
            disabled={isLoading || isRecordingPaused} // Disable switch while toggling or data recording is paused
          />
        </View>
        {isDataStreaming ? (
          <View className="mt-4 flex flex-row justify-between items-center gap-x-3 ">
            <View className="flex flex-row justify-center items-center">
              <Text className="text-base text-success-color">
                Data is being transferred...
              </Text>
              <View className="ml-4">
                <PulsingRings />
              </View>
            </View>
            {/* <View className="pt-2"> */}
            <Text>Loss: {packetLossData?.packetLossPercentage}%</Text>
            {/* </View> */}
          </View>
        ) : (
          <>
          <View className="mt-4 flex flex-row justify-center items-center gap-x-3">
            <Text className="text-base">
              Choose the ECG mode:
            </Text>
            <View className=" flex flex-row justify-center items-center bg-gray-200  rounded-xl divide-x-2">
            {/* <View className="grid grid-cols-2 gap-x-2 devide-x-2 justify-center items-center"> */}
            <TouchableOpacity className={ECGMode==="L" ? "p-2 bg-blue-200 rounded-l-xl": "p-2 rounded-l-xl" } onPress={()=>setECGMode("L")}>
            <Text className="">Long</Text> 
            </TouchableOpacity>
            {/* <View ></View> */}
            <TouchableOpacity className={ECGMode==="N" ? "p-2 bg-blue-200 rounded-r-xl": "p-2 rounded-r-xl"} onPress={()=>setECGMode("N")}>
            <Text className="">Short</Text>
            </TouchableOpacity>
            </View>
          </View>
          <View className="mt-4 flex flex-row justify-center items-center">
            <Text className="text-base">
              No Data received from Glymphometer.
            </Text>
          </View>
          </>
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
export default React.memo(DataStreaming);
