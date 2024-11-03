// useBLE.native.ts
import * as FileSystem from "expo-file-system";
import { handleError } from "./handleError";
import Toast from "react-native-toast-message";
import { requestPermissions } from "./requestPermissions";
import { useRef, useEffect, useState } from "react";
import { discoverBLEServicesCharactristics } from "./bleCharacteristics";
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
  const [packet, setPacket] = useState<string>(""); //Track the received data packet
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null); //Track currently connected device
  const [isDataStreaming, setIsDataStreaming] = useState<boolean>(false); //Track data streaming status
  // Initialization and BLE State Listener
  const dataSubscription = useRef<Subscription | null>(null); //Initialize data subscription ref

  useEffect(() => {
    return () => {
      // Clean up dataSubscription
      if (dataSubscription.current) {
        dataSubscription.current.remove();
        dataSubscription.current = null;
      }
    };
  }, []);

  //If devices is disconnected or turned off, set the connected device to null
  useEffect(() => {
    let disconnectSubscription: Subscription | undefined;
    if (connectedDevice) {
      disconnectSubscription = connectedDevice.onDisconnected(
        (error, device) => {
          // console.log("Device disconnected", device.id);
          setConnectedDevice(null);
          Toast.show({
            type: "success",
            text1: "Disconnected",
            text2: `Disconnected from ${connectedDevice.name}`,
            position: "top",
          });
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
          Toast.show({
            type: "success",
            text1: "Found connected devicees",
            text2: `Found connected devicees:  ${devices[0].name}`,
            position: "top",
          });
        }
      } catch (error: unknown) {
        handleError(error, "Error fetching connected devices");
      }
    };
    fetchConnectedDevices();
  }, []);

  //FUNCTION TO CONNECT TO THE BLE DEVICE
  const connectToDevice = async (device: Device) => {
    if (connectedDevice) {
      await disconnectDevice(); // Disconnect the currently connected device when requesting a new connection
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
  const disconnectDevice = async () => {
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
        text2: `Disconnected from ${
          connectedDevice.name || connectedDevice.id
        }`,
        position: "top",
      });
    } catch (error: unknown) {
      handleError(error, "Error disconnecting from device");
    }
  };

  //HELPER FUNCTION TO CHECK IF A DEVICE HAS ALREADY BEEN DISCORVERED
  const isDeviceDuplicated = (devices: Device[], newDevice: Device) => {
    return devices.findIndex((device) => newDevice.id === device.id) > -1;
  };

  //FUNCTION TO START SCANNING FOR PERIPHERALS
  const scanForPeripherals = () => {
    bleManager.startDeviceScan(
      null,
      null,
      (error: BleError | null, device: Device | null) => {
        if (error) {
          handleError(error, "Scanning for Peripherals");
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
      }
    );
  };
  ////

  //FUNCTION TO TOGGLE DATA STREAMING, SPECIFIC TO GM5
  // S starts the data streaming, P pauses the data streaming
  const toggleDataStreaming = async (device: Device, command: string) => {
    const status = command === "S" ? "Start" : "Pause";
    if (!device) {
      Toast.show({
        type: "error",
        text1: "No Device is Connected.",
        text2: "No Device is Connected.",
        position: "top", // Consistent position
      });
      return;
    }

    // Prevent duplicate actions/toggles
    if (
      (command === "S" && isDataStreaming) ||
      (command === "P" && !isDataStreaming)
    ) {
      Toast.show({
        type: "error",
        text1: `Data Streaming Already ${
          command === "S" ? "Started" : "Paused"
        }`,
        text2: `Cannot ${
          command === "S" ? "start" : "pause"
        } again without toggling.`,
        position: "bottom",
      });
      return;
    }
    //Encode the command string to base64
    const base64Command = base64.encode(command);
    try {
      await device.writeCharacteristicWithResponseForService(
        DATA_SERVICE_UUID,
        RX_CHARACTERISTIC_UUID,
        base64Command
      );
      if (command === "S") {
        dataStreaming(device); // Start data streaming
      } else if (command === "P") {
        // Stop data streaming and remove listener
        if (dataSubscription.current) {
          dataSubscription.current.remove();
          dataSubscription.current = null;
        }
      }
      setIsDataStreaming(command === "S"); //set true if command is S
      Toast.show({
        type: "success",
        text1: `Data Streaming ${status}ed`,
        text2: `Data streaming has been ${status.toLowerCase()}ed.`,
        position: "top",
      });
    } catch (error: unknown) {
      handleError(error, `Error ${status}ing data streaming`);
      // setIsDataStreaming(command === "P");
    }
  };

  // FUNCTION FOR DATA STREAMING
  const dataStreaming = (
    device: Device
    // setReceivedData?: (data: string) => void
  ) => {
    if (device) {
      console.log("data streaming started");
      //set the mut to 512 to contain the 509 bytes data from GM5  (the default mut size is 23 bytes, showing only 20bytes of the data)
      device
        .requestMTU(512)
        .then((mtu) => {
          // Before setting up a new listener, remove any existing one
          if (dataSubscription.current) {
            dataSubscription.current.remove();
            dataSubscription.current = null;
          }
          // Set up the listener and store the subscription
          dataSubscription.current = device.monitorCharacteristicForService(
            DATA_SERVICE_UUID,
            TX_CHARACTERISTIC_UUID,
            onDataUpdate //callback function to handle the data
          );
        })
        .catch((error) => {
          console.log("MTU negotation failed", error);
        });
    }
  };

  //CALL BACK FUNCTION TO HANDLE THE RECEIVED DATA
  const onDataUpdate =
    // (setReceivedData?: (data: string) => void) =>
    (error: BleError | null, characteristic: Characteristic | null) => {
      if (error) {
        handleError(error, "Error receiving data");
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
        setPacket?.(decimalValues.join(","));
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
    toggleDataStreaming, // Function to start or pause data streaming for GM5
    dataStreaming, // Function to start data streaming for GM5
    packet, // Received data packet
    isDataStreaming, // Data streaming status
    setIsDataStreaming, // Set data streaming status
  };
}

export default useBLE;
