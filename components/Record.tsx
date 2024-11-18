import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { getDataBuffer, clearDataBuffer } from "@/utils/dataBuffer";
import { saveDataToFile } from "@/utils/saveData";
import Foundation from "@expo/vector-icons/Foundation";
import ChooseFileNameModal from "./modals/ChooseFileNameModal";

interface RecordProps {
  isDataStreaming: boolean;
  isRecordingRef: React.MutableRefObject<boolean>;
  isRecordingPaused: boolean;
  setIsRecordingPaused: React.Dispatch<React.SetStateAction<boolean>>;
}
const Record: React.FC<RecordProps> = ({
  isDataStreaming,
  isRecordingRef,
  isRecordingPaused,
  setIsRecordingPaused,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Handle changes in data streaming or recording
  useEffect(() => {
    setError("");
    if (!isDataStreaming && isRecording) {
      // Data streaming has stopped while recording
      setIsRecording(false);
      setIsRecordingPaused(true);
      isRecordingRef.current = false;
      setError("Data streaming stopped while recording");
    } else if (!isDataStreaming && !isRecording) {
      // Data streaming stopped and not recording
      setIsRecordingPaused(false);
      setDuration(0);
    }
    //Do not add isRecording to the dependency array
  }, [isDataStreaming]);

  // Handle duration with interval
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

  //Start recording data
  function startRecordingData() {
    if (isDataStreaming) {
      setIsRecordingPaused(false);
      setIsRecording(true);
      isRecordingRef.current = true;
      setDuration(0); //Reset the duration when recording starts
    } else {
      setError("Enable data streaming first to start recording");
    }
  }
  //Stop recording data
  function stopRecordingData() {
    if (isRecording) {
      setIsRecording(false);
      setIsRecordingPaused(true);
      isRecordingRef.current = false;
      setModalVisible(true); // Show modal to save/discard data
    }
  }
  // Discard Data
  function discardData() {
    setIsRecording(false);
    setIsRecordingPaused(false);
    setDuration(0);
    clearDataBuffer();
    setModalVisible(false);
  }

  // Save Data

  const handleSaveData = async (fileName: string) => {
    try {
      const dataBuffer = getDataBuffer();
      await saveDataToFile(dataBuffer, fileName);
      setIsRecordingPaused(false);
      setIsRecording(false);
      setDuration(0);
      clearDataBuffer();
      setModalVisible(false);
    } catch (error) {
      // handleError(error, "Error saving data");
      setError("Error saving data to file");
    }
  };
  return (
    <View className="flex  justify-center items-center bg-white mt-4 py-4">
      {isRecordingPaused ? (
        <View>
          <Text className="text-base text-primary-text-color">
            Do you want to save the data?
          </Text>
          <View className="flex flex-row justify-center items-center gap-x-3 mt-2">
            <TouchableOpacity className="" onPress={discardData}>
              <Ionicons name="close-circle" size={60} color={"black"} />
            </TouchableOpacity>
            <TouchableOpacity
              className=""
              onPress={() => setModalVisible(true)}
            >
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
                <Foundation name="record" size={68} color="red" />
                {/* <Ionicons name="play-circle" size={68} color={"red"} /> */}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={startRecordingData}>
                <Foundation name="record" size={68} color="black" />
                {/* <Ionicons name="play-circle" size={60} color={"black"} /> */}
              </TouchableOpacity>
            )}
            {isRecordingPaused ? (
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
      {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}

      {/* Modal for choosing file name */}
      <ChooseFileNameModal
        visible={modalVisible}
        onSave={handleSaveData}
        onDiscard={discardData}
      />
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
