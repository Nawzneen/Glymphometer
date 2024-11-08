import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { getDataBuffer, clearDataBuffer } from "@/utils/dataBuffer";
import { saveDataToFile } from "@/utils/saveData";
import { handleError } from "@/utils/handleError";
interface RecordProps {
  isDataStreaming: boolean;
  isRecordingRef: React.MutableRefObject<boolean>;
}
const Record: React.FC<RecordProps> = ({ isDataStreaming, isRecordingRef }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string>("");
  // Update the ref whenever isRecording changes

  useEffect(() => {
    setError("");
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
  }, [isDataStreaming]);
  useEffect(() => {
    setError("");
    let interval: NodeJS.Timeout | null = null;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else if (!isRecording && interval) {
      //Clear the interval when recording stops
      clearInterval(interval);
    }
    // Cleanup function to clear interval if components unmounts
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);
  function startRecordingData() {
    if (isDataStreaming) {
      setIsPaused(false);
      setIsRecording(true);
      isRecordingRef.current = true;
      setDuration(0); //Reset the duration when recording starts
    } else {
      setError("Enable data streaming first to start recording");
    }
  }
  function stopRecordingData() {
    if (isDataStreaming) {
      setIsRecording(false);
      setIsPaused(true);
      isRecordingRef.current = false;
    }
  }
  function discardData() {
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    clearDataBuffer();
  }
  async function handleSaveData() {
    const dataBuffer = getDataBuffer();
    await saveDataToFile(dataBuffer);
    clearDataBuffer();
    setIsPaused(false);
    setIsRecording(false);
    setDuration(0);
  }
  return (
    <View className="flex  justify-center items-center bg-white mt-4 py-4">
      {isPaused ? (
        <View>
          <Text className="text-base text-primary-text-color">
            Do you want to save the data?
          </Text>
          <View className="flex flex-row justify-center items-center gap-x-3 mt-2">
            <TouchableOpacity className="" onPress={discardData}>
              <Ionicons name="close-circle" size={60} color={"black"} />
            </TouchableOpacity>
            <TouchableOpacity className="" onPress={handleSaveData}>
              <Ionicons name="checkmark-circle" size={60} color={"black"} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <Text className="text-base text-primary-text-color">
            Click to start recording Data
          </Text>
          <View className="flex flex-row  justify-center items-center gap-x-3 mt-2">
            {isRecording ? (
              <TouchableOpacity>
                <Ionicons name="play-circle" size={60} color={"red"} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={startRecordingData}>
                <Ionicons name="play-circle" size={60} color={"black"} />
              </TouchableOpacity>
            )}
            {isPaused ? (
              <TouchableOpacity>
                <Ionicons name="stop-circle" size={60} color="red" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={stopRecordingData}>
                <Ionicons name="stop-circle" size={60} color="black" />
              </TouchableOpacity>
            )}
          </View>
        </>
      )}
      <View className="mt-2">
        <Text className="">
          Recording Duration:{" "}
          <Text className="text-success-color">
            {" "}
            {formatDuration(duration)}
          </Text>
        </Text>
      </View>
      <Text className="text-red-500 mt-2">{error}</Text>
    </View>
  );
};

export default Record;
function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let result = "";
  if (hrs > 0) {
    result += `${hrs}h`;
  }
  if (mins > 0) {
    result += `${mins}m`;
  }
  result += `${secs}s`;
  return result.trim();
}
