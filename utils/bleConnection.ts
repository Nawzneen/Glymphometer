import { Device } from "react-native-ble-plx";
import bleManager from "@/utils/bleManager";
import { discoverBLEServicesCharactristics } from "./bleCharacteristics";
import Toast from "react-native-toast-message";
import { handleError } from "@/utils/handleError";

//FUNCTION TO CONNECT TO THE BLE DEVICE
export const connectToDevice = async (
  connectedDevice: Device | null,
  device: Device,
  setConnectedDevice: (device: Device | null) => void
) => {
  if (connectedDevice) {
    await disconnectDevice(connectedDevice, setConnectedDevice); // Disconnect the currently connected device when requesting a new connection
  }
  try {
    // Connect to the device using its ID by a methode provided by blemanager
    const deviceConnection = await bleManager.connectToDevice(device.id);
    Toast.show({
      type: "success",
      text1: "Device Connected successfully",
      text2: `Device Connected successfully:  ${deviceConnection.name}`,
      position: "top",
    });

    // Discover all services and characteristics of the device
    await discoverBLEServicesCharactristics(deviceConnection);

    // set the connected device state
    setConnectedDevice(deviceConnection);
    // Stop scanning for devices once connected
    bleManager.stopDeviceScan();
  } catch (error: unknown) {
    handleError(error, "Error connecting to device");
  }
};

//FUNCTION TO DISCONNECT TO THE BLE DEVICE
export const disconnectDevice = async (
  connectedDevice: Device | null,
  setConnectedDevice: (device: Device | null) => void
) => {
  if (!connectedDevice) {
    Toast.show({
      type: "info",
      text1: "No Device Connected",
      text2: "There is no device currently connected.",
      position: "top",
    });
    return;
  }
  try {
    await bleManager.cancelDeviceConnection(connectedDevice.id); // Disconnect the device
    setConnectedDevice(null); // Reset the connected device
    Toast.show({
      type: "success",
      text1: "Disconnected",
      text2: `Disconnected from ${connectedDevice.name || connectedDevice.id}`,
      position: "top",
    });
  } catch (error: unknown) {
    handleError(error, "Error disconnecting from device");
  }
};
