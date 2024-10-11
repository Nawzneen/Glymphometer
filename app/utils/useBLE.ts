import { useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import * as ExpoDevice from "expo-device";
import { base64 } from "react-native-base64";
import {
  BleError,
  BleManager,
  Device,
  Characteristic,
} from "react-native-ble-plx";

// Device Characteristitcs UUIDs specific to GM5
const DATA_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"; // Service UUID for handling data
const RX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; //To Send Data
const TX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // To Recieve UUID

const bleManager = new BleManager();

function useBLE() {
  const [allDevices, setAllDevices] = useState<Device[]>([]); //Track all discovered devices
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null); //Track currently connected device

  //Requesting Android-specific Location Permission (Android 12 and later require additional permissions)
  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Bluetooth Scan Permission",
        message: "This app needs to scan for bluetooth devices.",
        // buttonNeutral: "Ask Me Later",
        // buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth Connect Permission",
        message: "This app needs to connect to bluetooth devices.",
        // buttonNeutral: "Ask Me Later",
        // buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "This app needs access to your location",
        // buttonNeutral: "Ask Me Later",
        // buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  //Request necessary permissions for both android and IOS
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        // For android versions less than 12
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location",
            // buttonNeutral: "Ask Me Later",
            // buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // For Android 12 and later, request additional permissions
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();
        return isAndroid31PermissionsGranted;
      }
    } else {
      return true; // For IOS, no additional permissions are required
    }
  };

  //Function to connect to a BLE device
  const connectToDevice = async (device: Device) => {
    try {
      const deviceConnection = await bleManager.connectToDevice(device.id); // Connect to the device using its ID
      await deviceConnection.discoverAllServicesAndCharacteristics(); // Discover all services and characteristics of the device

      ////// check to see UUID of the services and characteristics if you don't already know
      const services = await deviceConnection.services(); // Get all services of the device
      for (const service of services) {
        const characteristics =
          await deviceConnection.characteristicsForService(service.uuid); // Get all characteristics of the service
        for (const characteristic of characteristics) {
          // console.log("Characteristic UUID:", characteristic.uuid);
        }
      }
      //   set the connected device
      setConnectedDevice(deviceConnection); //Save the connected device
      bleManager.stopDeviceScan(); // Stop scanning for devices once connected
    } catch (error) {
      console.log("FAILED TO CONNECT", error);
      console.error(error);
    }
  };

  //Helper function to check if a device has already been discovered
  const isDeviceDuplicated = (devices: Device[], newDevice: Device) => {
    return devices.findIndex((device) => newDevice.id === device.id) > -1;
  };

  //Function to start scanning for BLE devices
  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Error in Scanning for peripherals", error);
        return;
      }
      //Only handle the devices with specific name for GLymphometer (GM5)
      if (device?.name === "GM5" || device?.localName) {
        setAllDevices((prevState: Device[]) => {
          if (device && !isDeviceDuplicated(allDevices, device)) {
            return [...prevState, device];
            //Add the device if its new
          }
          return prevState;
        });
      }
    });
  };
  return {
    connectToDevice, // Function to connect to GM5 device
    allDevices, // List of all discovered devices
    connectedDevice, // Currently connected device
    requestPermissions, // Function to request necessary permissions
    scanForPeripherals, // Function to start scanning for devices
  };
}

export default useBLE;
