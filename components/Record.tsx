import Ionicons from "@expo/vector-icons/Ionicons";
import React, {
  useState,
  useEffect,
  useRef,
  FC,
  MutableRefObject,
  Dispatch,
  SetStateAction,
} from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { getDataBuffer, clearDataBuffer } from "@/utils/buffers/dataBuffer";
import { saveDataToFile } from "@/utils/data/saveData";
import Foundation from "@expo/vector-icons/Foundation";
import ChooseFileNameModal from "./modals/ChooseFileNameModal";
import { AppState } from "react-native";

interface RecordProps {
  isDataStreaming: boolean;
  isRecordingRef: MutableRefObject<boolean>;
  isRecordingPaused: boolean;
  setIsRecordingPaused: Dispatch<SetStateAction<boolean>>;
  isRecording: boolean;
  setIsRecording: Dispatch<SetStateAction<boolean>>;
}

const Record: FC<RecordProps> = ({
  isDataStreaming,
  isRecordingRef,
  isRecording,
  setIsRecording,
  isRecordingPaused,
  setIsRecordingPaused,
}) => {
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  // Handle duration with elapsed time calculation
  useEffect(() => {
    setError("");
    let interval: NodeJS.Timeout | null = null;

    const updateDuration = () => {
      if (startTime) {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - startTime) / 1000);
        setDuration(elapsedSeconds);
      }
    };

    if (isRecording) {
      interval = setInterval(updateDuration, 1000);
      updateDuration(); // Initial call

      // Handle app state changes
      const subscription = AppState.addEventListener(
        "change",
        (nextAppState) => {
          if (nextAppState === "active") {
            updateDuration();
          }
        }
      );

      return () => {
        if (interval) clearInterval(interval);
        subscription.remove(); // Use remove() from subscription
      };
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, startTime]);

  //Start recording data
  function startRecordingData() {
    if (isDataStreaming) {
      setIsRecordingPaused(false);
      setIsRecording(true);
      isRecordingRef.current = true;
      setStartTime(Date.now());
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
      setStartTime(null); // Clear start time
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
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View className="flex justify-center items-center bg-white mt-4 py-4 w-[95%] mx-auto rounded-md ">
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
        isLoading={isLoading}
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
