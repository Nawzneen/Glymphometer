import React, { useState, useEffect } from "react";
import CustomButton from "../../components/CustomButton";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";

import DeviceModal from "../../components/DeviceConnectionModal";
import useBLE from "../../utils/useBLE";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import SignalQuality from "@/components/SignalQuality";
export default function index() {
  const {
    allDevices,
    connectedDevice,
    connectToDevice,
    disconnectDevice,
    startOrPauseDataStreaming,
    requestPermissions,
    scanForPeripherals,
    dataStreaming,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [receivedData, setReceivedData] = useState<string>("");
  const [isDataStreaming, setIsDataStreaming] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
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
  const handleDataStreamingToggle = (value: boolean) => {
    setIsDataStreaming(value);
    if (connectedDevice) {
      if (value) {
        console.log("start data streaming");
        startOrPauseDataStreaming(connectedDevice, "S");
        dataStreaming(connectedDevice, setReceivedData);
      } else {
        console.log("stop data streaming");
        startOrPauseDataStreaming(connectedDevice, "P");
      }
    }
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
                GM5 is {isConnected ? "Connected" : "Disconnected"}
              </Text>
              <TouchableOpacity onPress={disconnectDevice} className="ml-2">
                <Ionicons
                  name="refresh"
                  size={24}
                  color="black"
                  className="ml-2"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={disconnectDevice} className="ml-2">
                <AntDesign name="disconnect" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row justify-center items-center gap-x-2 mt-8 ">
              {/* {isDataStreaming ? ( 
              <>
                <View>
                  <CustomButton
                    title="Pause Streaming Data"
                    customButtonStyle={{}}
                    onPress={() => {
                      startOrPauseDataStreaming(connectedDevice, "P");
                      // dataStreaming(connectedDevice, setReceivedData);
                    }}
                  />
                </View>
              </>
              ) : ( 
              <View>
                <CustomButton
                  title="Start Streaming Data "
                  onPress={() => {
                    startOrPauseDataStreaming(connectedDevice, "S"),
                      dataStreaming(connectedDevice, setReceivedData);
                  }}
                />
              </View>
              )}  */}
            </View>
            <SignalQuality
              isDataStreaming={isDataStreaming}
              onToggleDataStreaming={handleDataStreamingToggle}
            />

            {receivedData && (
              <Text className="px-1 text-secondary-text-color">
                GMeter Data streaming : {receivedData}
              </Text>
            )}
          </>
        ) : (
          <Text className="mt-16 text-primary-text-color text-center font-bold text-2xl px-4">
            Please connect your phone to Gmeter.
          </Text>
        )}
      </View>
      {/* <TouchableOpacity onPress={openModal} style={styles.ctaCustomButton}>
        <Text style={styles.ctaCustomButtonText}>Connect</Text>
      </TouchableOpacity> */}

      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
}
