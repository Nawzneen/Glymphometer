// useBLE.native.ts
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { handleError } from "./handleError";
import Toast from "react-native-toast-message";
import { requestPermissions } from "./requestPermissions";
import { useRef, useEffect, useState } from "react";
import { connectToDevice, disconnectDevice } from "./bleConnection";
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
let dataBuffer: string[] = []; // Buffer to accumulate all the streaming data
console.log("I ran");
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

  // Function to connect to a BLE device
  const handleConnectToDevice = async (device: Device) => {
    await connectToDevice(connectedDevice, device, setConnectedDevice);
  };
  // Function to disconnect from a BLE device
  const handleDisconnectDevice = async () => {
    await disconnectDevice(connectedDevice, setConnectedDevice);
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
            const deviceIndex = prevState.findIndex(
              (prevDevice) => prevDevice.id === device.id
            );
            if (deviceIndex === -1) {
              //Add the device if its new
              return [...prevState, device];
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
        // Save data to file after stopping the streaming
        await saveDataToFile();
        console.log("data saved");
        // Clear the data buffer after saving
        dataBuffer = [];
        console.log("buffer emptied");
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
        const decodedData = base64.decode(encodedData);
        // Convert the byte array to hexadecimal values

        // Append the decoded data to the buffer
        // dataBuffer.push(decodedData);
        // console.log("dataBuffer", dataBuffer);

        const hexValues = [];
        for (let i = 0; i < decodedData.length; i++) {
          // Convert each character code to hexadecimal and pad it to ensure it's always two digits (e.g., '0a' instead of 'a')
          let hex = decodedData.charCodeAt(i).toString(16);
          if (hex.length < 2) {
            hex = "0" + hex; // Pad single-digit hex values with a leading zero
          }
          hexValues.push(hex);
        }
        dataBuffer.push(hexValues.join(" "));
        console.log("hexValues", hexValues.join(" "));

        const byteArray = [];
        for (let i = 0; i < decodedData.length; i++) {
          byteArray.push(decodedData.charCodeAt(i));
        }

        const extracted24Bytes = byteArray.slice(478, 509 - 7); // The 24 bytes we want (bytes from 478 to 502 inclusive)
        setPacket?.(hexValues.join(" "));
        const extracted24BytesHex = extracted24Bytes
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join(" ");
        // console.log("Extracted 24 Bytes (Hex):", extracted24BytesHex);
        // console.log("Data Received", hexValues.join(","));
      } else {
        console.error("Characteristic value is null or undefined.");
      }
    };
  ////

  return {
    requestPermissions, // Function to request necessary permissions
    handleConnectToDevice, // Function to connect to GM5 device
    handleDisconnectDevice, // Function to disconnect from the device
    allDevices, // List of all discovered devices
    connectedDevice, // Currently connected device
    scanForPeripherals, // Function to start scanning for devices
    toggleDataStreaming, // Function to start or pause data streaming for GM5
    dataStreaming, // Function to start data streaming for GM5
    packet, // Received data packet
    isDataStreaming, // Data streaming status
    setIsDataStreaming, // Set data streaming status
  };
}

export default useBLE;
// FUNCTION TO SAVE DATA TO A FILE
const saveDataToFile = async () => {
  try {
    // Join all accumulated data from the buffer
    const dataToSave = dataBuffer.join("");
    // console.log("dataToSave", dataToSave);
    // Define the path where you want to save the file
    const fileUri = FileSystem.documentDirectory + "streamingData.txt";

    // Write the accumulated data to the file
    await FileSystem.writeAsStringAsync(fileUri, dataToSave);

    // Show a success message
    Toast.show({
      type: "success",
      text1: "Data Saved Successfully",
      text2: `File saved at: ${fileUri}`,
      position: "top",
    });
    //Share the file after saving
    await shareFile(fileUri);
  } catch (error) {
    handleError(error, "Error saving data to file");
  }
};
// FUNCTION TO SHARE DATA FILE
const shareFile = async (fileUri: string) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri);
      console.log("File shared successfully");
    } else {
      Toast.show({
        type: "error",
        text1: "Sharing Not Available",
        text2: "Sharing is not available on this device.",
        position: "top",
      });
    }
  } catch (error) {
    handleError(error, "Error sharing file");
  }
};
