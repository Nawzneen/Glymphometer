import React, { useState, useEffect, useRef, useCallback } from "react";
import CustomButton from "../../components/CustomButton";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import DeviceModal from "../../components/DeviceConnectionModal";
import useBLE from "../../utils/useBLE";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import SignalQuality from "@/components/SignalQuality";
import ToastMessages from "@/components/ToastMessages";
import Record from "@/components/Record";
export default function index() {
  const isRecordingRef = useRef(false);
  const {
    allDevices,
    connectedDevice,
    handleConnectToDevice,
    handleDisconnectDevice,
    toggleDataStreaming,
    requestPermissions,
    scanForPeripherals,
    isDataStreaming,
    // packetNumber,
  } = useBLE(isRecordingRef);

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for toggling data streaming
  const [isRecordingPaused, setIsRecordingPaused] = useState<boolean>(false); // User paused the data streaming and need to decide what to do with saved data
  useEffect(() => {
    console.log("isRecordingpaused", isRecordingPaused);
  }, [isRecordingPaused]);
  const scanForDevices = useCallback(async () => {
    const isPermissionsEnabled = await requestPermissions();
    console.log("isPermissionsEnabled", isPermissionsEnabled);
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  }, [requestPermissions, scanForPeripherals]);

  const hideModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const openModal = useCallback(async () => {
    scanForDevices();
    setIsModalVisible(true);
  }, [scanForDevices]);

  const handleDataStreamingToggle = useCallback(
    async (value: boolean) => {
      if (isLoading || isRecordingPaused) return; //prevent multiple roggles when paused or on loading state
      setIsLoading(true);
      if (connectedDevice) {
        await toggleDataStreaming(connectedDevice, value ? "S" : "P");
      }
      setIsLoading(false);
    },
    [isLoading, connectedDevice, toggleDataStreaming, isRecordingPaused]
  );

  return (
    <SafeAreaView className="flex flex-1 bg-background-color">
      <View className="mt-8 flex flex-row gap-x-2 items-center justify-center  ">
        <View>
          <CustomButton title="Connect to GM5" onPress={openModal} />
        </View>
      </View>
      <View className="">
        {connectedDevice ? (
          <>
            <View className="mt-16 flex-row flex gap-x-1 justify-center items-center">
              <Text className="text-xl font-bold text-primary-color">
                {connectedDevice.name} is{" "}
                {connectedDevice ? "Connected" : "Disconnected"}
              </Text>
              {/* <TouchableOpacity onPress={disconnectDevice} className="ml-2">
                <Ionicons
                  name="refresh"
                  size={24}
                  color="black"
                  className="ml-2"
                />
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={handleDisconnectDevice}
                className="ml-2 bg-gray-200 p-2 rounded-full"
              >
                <AntDesign name="disconnect" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <SignalQuality
              isDataStreaming={isDataStreaming}
              onToggleDataStreaming={handleDataStreamingToggle}
              isLoading={isLoading}
              isRecordingPaused={isRecordingPaused}
            />

            {/* {packet && (
              <Text className="px-1 text-secondary-text-color">
                GMeter Data streaming : {packet}
              </Text>
            )} */}
            <Record
              isDataStreaming={isDataStreaming}
              isRecordingRef={isRecordingRef}
              isRecordingPaused={isRecordingPaused}
              setIsRecordingPaused={setIsRecordingPaused}
            />
          </>
        ) : (
          <Text className="mt-16 text-primary-text-color text-center font-bold text-2xl px-4">
            Please connect your phone to Gmeter.
          </Text>
        )}
      </View>

      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={handleConnectToDevice}
        devices={allDevices}
      />
      <ToastMessages />
    </SafeAreaView>
  );
}
