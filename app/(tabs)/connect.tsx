import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DeviceModal from "../../components/DeviceConnectionModal";
import useBLE from "../utils/useBLE";
export default function saved() {
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

  useEffect(() => {
    if (connectedDevice) {
      console.log("UseEffect is called");
      // startStreamingData(connectedDevice, setReceivedData); // Start listening for data
      // continousData(connectedDevice, setReceivedData);
      // console.log("newData is", newData);
      // setData(newData);
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
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        {connectedDevice ? (
          <>
            <Text style={styles.heartRateTitleText}>Connected</Text>
            <TouchableOpacity
              onPress={disconnectDevice}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaButtonText}>Disconnect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => {
                startOrPauseDataStreaming(connectedDevice, "S"),
                  dataStreaming(connectedDevice, setReceivedData);
              }}
            >
              <Text style={styles.ctaButtonText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => startOrPauseDataStreaming(connectedDevice, "P")}
            >
              <Text style={styles.ctaButtonText}>Pause</Text>
            </TouchableOpacity>
            <Text>Data going to be here: {receivedData}</Text>
          </>
        ) : (
          <Text style={styles.heartRateTitleText}>
            Please connect the Gmeter
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={openModal} style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>Connect</Text>
      </TouchableOpacity>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 20,
    color: "black",
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: "#FF6060",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
