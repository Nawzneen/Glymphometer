import React, { useState, useEffect, useRef, useCallback } from "react";
import CustomButton from "@/components/CustomButton";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import DeviceModal from "@/components/modals/DeviceConnectionModal";
import useBLE from "@/utils/useBLE";
import AntDesign from "@expo/vector-icons/AntDesign";
import SignalQuality from "@/components/SignalQuality";
import ToastMessages from "@/components/ToastMessages";
import Record from "@/components/Record";
import AdjustLEDLevel from "@/components/AdjustLEDLevel";

export default function index() {
  const isRecordingRef = useRef(false);

  const {
    allDevices,
    connectedDevice,
    handleConnectToDevice,
    handleDisconnectDevice,
    handleToggleDataStreaming,
    handleLEDLevel,
    requestPermissions,
    scanForPeripherals,
    isDataStreaming,
    packetLossData,
  } = useBLE(isRecordingRef);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isDeviceModalVisible, setIsDeviceModalVisible] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for toggling data streaming
  const [isRecordingPaused, setIsRecordingPaused] = useState<boolean>(false); // User paused the data streaming and need to decide what to do with saved data
  const scanForDevices = useCallback(async () => {
    const isPermissionsEnabled = await requestPermissions();
    console.log("isPermissionsEnabled", isPermissionsEnabled);
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  }, [requestPermissions, scanForPeripherals]);

  const hideModal = useCallback(() => {
    setIsDeviceModalVisible(false);
  }, []);

  const openModal = useCallback(async () => {
    scanForDevices();
    setIsDeviceModalVisible(true);
  }, [scanForDevices]);

  const handleDataStreamingToggle = useCallback(
    async (value: boolean) => {
      if (isLoading || isRecordingPaused) return; //prevent multiple roggles when paused or on loading state
      setIsLoading(true);
      if (connectedDevice) {
        await handleToggleDataStreaming(value ? "S" : "P");
      }
      setIsLoading(false);
    },
    [isLoading, connectedDevice, handleToggleDataStreaming, isRecordingPaused]
  );

  return (
    <SafeAreaView className="flex flex-1 bg-background-color">
      <ScrollView className="flex-gow">
        <View className="mt-4 flex flex-row gap-x-2 items-center justify-center  ">
          <View>
            <CustomButton title="Connect to GM5" onPress={openModal} />
          </View>
        </View>

        <View className="">
          {connectedDevice ? (
            <>
              <View className="mt-8 flex-row flex gap-x-1 justify-center items-center">
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
                packetLossData={packetLossData}
              />
              <AdjustLEDLevel
                handleLEDLevel={handleLEDLevel}
                isDataStreaming={isDataStreaming}
                isRecording={isRecording}
              />

              <Record
                isDataStreaming={isDataStreaming}
                isRecordingRef={isRecordingRef}
                isRecordingPaused={isRecordingPaused}
                setIsRecordingPaused={setIsRecordingPaused}
                isRecording={isRecording}
                setIsRecording={setIsRecording}
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
          visible={isDeviceModalVisible}
          connectToPeripheral={handleConnectToDevice}
          devices={allDevices}
        />
      </ScrollView>
      <ToastMessages />
    </SafeAreaView>
  );
}
