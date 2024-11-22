import { handleError } from "./handleError";
import Toast from "react-native-toast-message";
import { requestPermissions } from "./requestPermissions";
import { useRef, useEffect, useState, useCallback } from "react";
import { connectToDevice, disconnectDevice } from "./bleConnection";
import { clearDataBuffer } from "@/utils/dataBuffer";
import { DATA_SERVICE_UUID } from "./bleConstants";
import { adjustLEDLevel } from "./bleAdjustLEDLevel";
import { BleError, Device, Subscription } from "react-native-ble-plx";
import { toggleDataStreaming, startDataStreaming } from "./bleDataStreaming";
import bleManager from "./bleManager";
import { Alert } from "react-native";
import { Buffer } from "buffer";

if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

function useBLE(isRecordingRef: React.MutableRefObject<boolean>) {
  const [allDevices, setAllDevices] = useState<Device[]>([]); //Track all discovered devices
  // const [packet, setPacket] = useState<string>(""); //Track the received data packet
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null); //Track currently connected device
  const [isDataStreaming, setIsDataStreaming] = useState<boolean>(false); //Track data streaming status
  // Initialization and BLE State Listener
  const dataSubscription = useRef<Subscription | null>(null); //Initialize data subscription ref
  // const [packetNumber, setPacketNumber] = useState<number>(0); //Track the packet number

  useEffect(() => {
    return () => {
      // Clean up dataSubscription
      if (dataSubscription.current) {
        clearDataBuffer(); // Clear the data buffer
        console.log("datasubscription remove on umount");
        dataSubscription.current.remove();
        dataSubscription.current = null;
      }
    };
  }, []);

  //If devices is disconnected or turned off, set the connected device to null and remove the datasubpscription
  useEffect(() => {
    let disconnectSubscription: Subscription | undefined;
    if (connectedDevice) {
      disconnectSubscription = connectedDevice.onDisconnected(
        (error, device) => {
          if (dataSubscription.current) {
            console.log(
              "removing data subscription",
              typeof dataSubscription.current
            );
            dataSubscription.current.remove();
            dataSubscription.current = null;
          }
          clearDataBuffer(); // Clear the data buffer when device disconnected
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
    clearDataBuffer(); // Clear the data buffer before connecting or disconnecting to any device
    if (connectedDevice) {
      await handleDisconnectDevice();
    }
    try {
      const deviceConnection = await connectToDevice(device);
      setConnectedDevice(deviceConnection);
      Toast.show({
        type: "success",
        text1: "Device Connected successfully",
        text2: `Device Connected successfully:  ${deviceConnection?.name}`,
        position: "top",
      });
    } catch (error) {
      handleError(error, "Error connecting to device");
    }
  };
  // Function to disconnect from a BLE device
  const handleDisconnectDevice = async () => {
    if (connectedDevice) {
      console.log("pause data streaming before disconnecting");
      await handleToggleDataStreaming("P");
      await disconnectDevice(connectedDevice);
      setConnectedDevice(null);
      Toast.show({
        type: "success",
        text1: "Disconnected",
        text2: `Disconnected from ${
          connectedDevice.name || connectedDevice.id
        }`,
        position: "top",
      });
    } else {
      Toast.show({
        type: "info",
        text1: "No Device Connected",
        text2: "There is no device currently connected.",
        position: "bottom",
      });
    }
  };

  //FUNCTION TO ADJUST LED LIGHT LEVEL
  //** This function should only work if the isDataStreaming true. */
  const handleLEDLevel = async (value: number) => {
    if (!isDataStreaming) {
      handleError(
        "Data streaming is should be active for this function to work"
      );
      return;
    }
    if (connectedDevice) {
      const LEDLevel = value.toString();
      await adjustLEDLevel(LEDLevel, connectedDevice);
    } else {
      console.log("No device connected");
    }
  };

  const handleToggleDataStreaming = useCallback(
    async (command: string) => {
      await toggleDataStreaming(
        connectedDevice,
        command,
        isDataStreaming,
        setIsDataStreaming,
        dataSubscription,
        isRecordingRef
      );
    },
    [
      connectedDevice,
      isDataStreaming,
      dataSubscription,
      setIsDataStreaming,
      isRecordingRef,
    ]
  ); // the last two were added recently, check the effect
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

  return {
    requestPermissions, // Function to request necessary permissions
    handleConnectToDevice, // Function to connect to GM5 device
    handleDisconnectDevice, // Function to disconnect from the device
    allDevices, // List of all discovered devices
    connectedDevice, // Currently connected device
    scanForPeripherals, // Function to start scanning for devices
    handleToggleDataStreaming, // Function to start or pause data streaming for GM5
    handleLEDLevel, // Function to adjust LED light level
    startDataStreaming, // Function to start data streaming for GM5
    isDataStreaming, // Data streaming status
    setIsDataStreaming, // Set data streaming status
  };
}

export default useBLE;
