import { Device } from "react-native-ble-plx";
import bleManager from "@/utils/bleManager";
import { discoverBLEServicesCharactristics } from "./bleCharacteristics";
import { handleError } from "@/utils/handleError";

//FUNCTION TO CONNECT TO THE BLE DEVICE
export const connectToDevice = async (device: Device) => {
  try {
    // Connect to the device using its ID by a methode provided by blemanager
    const deviceConnection = await bleManager.connectToDevice(device.id);

    // Discover all services and characteristics of the device
    await discoverBLEServicesCharactristics(deviceConnection);

    // Stop scanning for devices once connected
    bleManager.stopDeviceScan();
    return deviceConnection;
  } catch (error: unknown) {
    // handleError(error, "Error connecting to device");
    throw error; // Rethrow the error to let it propagate up
  }
};

//FUNCTION TO DISCONNECT TO THE BLE DEVICE
export const disconnectDevice = async (connectedDevice: Device) => {
  try {
    await bleManager.cancelDeviceConnection(connectedDevice.id); // Disconnect the device
  } catch (error: unknown) {
    // handleError(error, "Error disconnecting from device");
    throw error; // Rethrow the error to let it propagate up
  }
};
