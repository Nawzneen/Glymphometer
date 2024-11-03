import React, { useState, useEffect } from "react";
import CustomButton from "../../components/CustomButton";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import DeviceModal from "../../components/DeviceConnectionModal";
import useBLE from "../../utils/useBLE";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import SignalQuality from "@/components/SignalQuality";
import ToastMessages from "@/components/ToastMessages";
export default function index() {
  const {
    allDevices,
    connectedDevice,
    connectToDevice,
    disconnectDevice,
    toggleDataStreaming,
    requestPermissions,
    scanForPeripherals,
    isDataStreaming,
    packet,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state for toggling data streaming
  React.useEffect(() => {
    if (connectedDevice) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [connectedDevice]);

  const scanForDevices = async () => {
    const isPermissionsEnabled = await requestPermissions();
    if (isPermissionsEnabled) {
      scanForPeripherals();
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };
  const handleDataStreamingToggle = async (value: boolean) => {
    if (isLoading) return; //prevent multiple roggles
    setIsLoading(true);
    if (connectedDevice) {
      await toggleDataStreaming(connectedDevice, value ? "S" : "P");
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView className="flex flex-1 bg-background-color">
      <View className="flex flex-row gap-x-2 items-center justify-center  ">
        <View>
          <CustomButton title="Connect to GM5" onPress={openModal} />
        </View>
        <View>
          <CustomButton title="Open Saved Data" onPress={scanForDevices} />
        </View>
      </View>
      <View className="">
        {connectedDevice ? (
          <>
            <View className="mt-16 flex-row flex gap-x-1 justify-center items-center">
              <Text className="text-xl font-bold text-primary-color">
                {connectedDevice.name} is{" "}
                {isConnected ? "Connected" : "Disconnected"}
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
                onPress={disconnectDevice}
                className="ml-2 bg-gray-200 p-2 rounded-full"
              >
                <AntDesign name="disconnect" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <SignalQuality
              isDataStreaming={isDataStreaming}
              onToggleDataStreaming={handleDataStreamingToggle}
              isLoading={isLoading}
            />

            {packet && (
              <Text className="px-1 text-secondary-text-color">
                GMeter Data streaming : {packet}
              </Text>
            )}
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
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
      <ToastMessages />
    </SafeAreaView>
  );
}
