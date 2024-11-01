// useBLE.native.ts
////////////////////////////////////////////////
import * as FileSystem from "expo-file-system";
import { requestPermissions } from "./requestPermissions";
import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { discoverBLEServicesCharactristics } from "./bleCharacteristics";
import * as ExpoDevice from "expo-device";
import base64 from "react-native-base64";
import {
  BleError,
  Device,
  Characteristic,
  Subscription,
} from "react-native-ble-plx";
import bleManager from "./bleManager";
import { Alert } from "react-native";

// Device Characteristitcs UUIDs specific to GM5
const DATA_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e"; // Service UUID for handling data
const RX_CHARACTERISTIC_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e"; //To Send Data / write
const TX_CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"; // To Recieve UUID / notify

function useBLE() {
  const [allDevices, setAllDevices] = useState<Device[]>([]); //Track all discovered devices
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null); //Track currently connected device
  // Initialization and BLE State Listener

  //If devices is disconnected or turned off, set the connected device to null
  useEffect(() => {
    let disconnectSubscription: Subscription | undefined;
    if (connectedDevice) {
      disconnectSubscription = connectedDevice.onDisconnected(
        (error, device) => {
          console.log("Device disconnected", device.id);
          setConnectedDevice(null);
        }
      );
    }
    return () => {
      if (disconnectSubscription) {
        disconnectSubscription.remove();
      }
    };
  }, [connectedDevice]);

  useEffect(() => {
    const subscription: Subscription = bleManager.onStateChange((state) => {
      console.log("BLE State:", state);
      if (state === "PoweredOn") {
        // Optionally start scanning automatically
        // scanForPeripherals();
      } else if (state === "PoweredOff") {
        Alert.alert(
          "Bluetooth Disabled",
          "Please enable Bluetooth to connect to your GM5 device.",
          [{ text: "OK" }]
        );
      }
    }, true);

    return () => {
      // Cleaning up BLE Manager without destroying it
      subscription.remove();
    };
  }, []);

  // Reconnection Logic on Mount
  // Fetch already connected devices on mount (to prevent hot reloads destroy the connection without disconnecting ble device)
  useEffect(() => {
    const fetchConnectedDevices = async () => {
      try {
        const devices = await bleManager.connectedDevices([DATA_SERVICE_UUID]);
        console.log("Connected devicess:", devices);
        if (devices.length > 0) {
          setConnectedDevice(devices[0]);
          const newDevice = devices[0];
          setAllDevices((prevDevices) => [...prevDevices, newDevice]);
          console.log("Found connected devicees:", devices[0].id);
        }
      } catch (error) {
        console.error("Error fetching connected devices:", error);
      }
    };
    fetchConnectedDevices();
  }, []);

  //FUNCTION TO CONNECT TO THE BLE DEVICE
  const connectToDevice = async (device: Device) => {
    try {
      // Connect to the device using its ID
      const deviceConnection = await bleManager.connectToDevice(device.id);
      console.log("Device Connected successfully", deviceConnection.id);

      // Discover all services and characteristics of the device
      await discoverBLEServicesCharactristics(deviceConnection);

      // set the connected device state
      setConnectedDevice(deviceConnection);
      // Stop scanning for devices once connected
      bleManager.stopDeviceScan();
    } catch (error) {
      console.log("GM5 FAILED TO CONNECT", error);
      console.error(error);
    }
  };

  //FUNCTION TO DISCONNECT TO THE BLE DEVICE
  const disconnectDevice = async () => {
    console.log("Disconnecting device running");
    if (!connectedDevice) {
      console.log("No device connected to disconnect");
      return;
    }
    try {
      await bleManager.cancelDeviceConnection(connectedDevice.id); // Disconnect the device
      setConnectedDevice(null); // Reset the connected device
      console.log("Device Disconnected successfully");
    } catch (error) {
      console.log("FAILED TO DISCONNECT", error);
    }
  };

  //HELPER FUNCTION TO CHECK IF A DEVICE HAS ALREADY BEEN DISCORVERED
  const isDeviceDuplicated = (devices: Device[], newDevice: Device) => {
    return devices.findIndex((device) => newDevice.id === device.id) > -1;
  };

  //FUNCTION TO START SCANNING FOR PERIPHERALS
  const scanForPeripherals = () => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log("Error in Scanning for peripherals", error);
        return;
      }
      //Only handle the devices with specific name for GLymphometer (GM5) and everything comes after it such as GM5-1, GM5-2, etc
      if (
        device?.name?.startsWith("GM5") ||
        device?.localName?.startsWith("GM5")
      ) {
        setAllDevices((prevState: Device[]) => {
          if (!isDeviceDuplicated(prevState, device)) {
            return [...prevState, device];
            //Add the device if its new
          }
          return prevState;
        });
      }
    });
  };
  ////

  //FUNCTION TO TOGGLE DATA STREAMING, SPECIFIC TO GM5
  // S starts the data streaming, P pauses the data streaming
  const startOrPauseDataStreaming = async (device: Device, command: string) => {
    const status = command === "S" ? "Start" : "Pause";
    if (device) {
      //Encode the command string to base64
      const base64Command = base64.encode(command);
      try {
        await device.writeCharacteristicWithResponseForService(
          DATA_SERVICE_UUID,
          RX_CHARACTERISTIC_UUID,
          base64Command
        );
        console.log(`Deivce ${status}ed`);
      } catch (error) {
        console.log(`Data streaming failed to ${status}`, error);
      }
    } else {
      console.log("Device not connected");
    }
  };

  // FUNCTION FOR DATA STREAMING
  const dataStreaming = (
    device: Device,
    setReceivedData?: (data: string) => void
  ) => {
    if (device) {
      console.log("data streaming started");

      //set the mut to 512 to contain the 509 bytes data from GM5  (the default mut size is 23 bytes, showing only 20bytes of the data)
      device
        .requestMTU(512)
        .then((mtu) => {
          device.monitorCharacteristicForService(
            DATA_SERVICE_UUID,
            TX_CHARACTERISTIC_UUID,
            onDataUpdate(setReceivedData) //callback function to handle the data
          );
        })
        .catch((error) => {
          console.log("MTU negotation failed", error);
        });
    }
  };

  //CALL BACK FUNCTION TO HANDLE THE RECEIVED DATA
  const onDataUpdate =
    (setReceivedData?: (data: string) => void) =>
    (error: BleError | null, characteristic: Characteristic | null) => {
      if (error) {
        console.log("Error in receving the data", error);
        return;
      }
      if (characteristic && characteristic.value) {
        //characteristic.value is a base64 encoded string
        const encodedData = characteristic.value;
        // Decode the Base64 string to a byte array
        // const decodedData = atob(encodedData);
        const decodedData = base64.decode(encodedData);
        // Convert the byte array to a decimal values
        const decimalValues = [];
        for (let i = 0; i < decodedData.length; i++) {
          decimalValues.push(decodedData.charCodeAt(i));
        }
        setReceivedData?.(decimalValues.join(","));
        console.log("Data Received", decimalValues.join(","));
      } else {
        console.error("Characteristic value is null or undefined.");
      }
    };
  ////

  return {
    requestPermissions, // Function to request necessary permissions
    connectToDevice, // Function to connect to GM5 device
    allDevices, // List of all discovered devices
    connectedDevice, // Currently connected device
    disconnectDevice, // Function to disconnect from the device
    scanForPeripherals, // Function to start scanning for devices
    startOrPauseDataStreaming, // Function to start or pause data streaming for GM5
    dataStreaming, // Function to start data streaming for GM5
  };
}

export default useBLE;
