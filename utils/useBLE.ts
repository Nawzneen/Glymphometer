import { handleError } from "@/utils/handleError";
import Toast from "react-native-toast-message";
import { requestPermissions } from "@/utils/requestPermissions";
import { useRef, useEffect, useState, useCallback } from "react";
import { connectToDevice, disconnectDevice } from "@/utils/bleConnection";
import { getDataBuffer, clearDataBuffer } from "@/utils/buffers/dataBuffer";
import { DATA_SERVICE_UUID } from "@/utils/bleConstants";
import { adjustLEDLevel } from "@/utils/bleAdjustLEDLevel";
import { BleError, Device, Subscription } from "react-native-ble-plx";
import {
  toggleDataStreaming,
  startDataStreaming,
} from "@/utils/bleDataStreaming";
import bleManager from "@/utils/bleManager";
import { Alert } from "react-native";
import { Buffer } from "buffer";
import { saveDataToFile } from "@/utils/data/saveData";
import { Command } from "@/constants/Constants";

if (typeof global.Buffer === "undefined") {
  global.Buffer = Buffer;
}

type PacketStats = {
  receivedPacketNumbers: Set<number>;
  duplicatedPackets: number;
  firstPacketNumber: number | null;
  lastPacketNumber: number | null;
};

function useBLE(isRecordingRef: React.MutableRefObject<boolean>) {
  const [allDevices, setAllDevices] = useState<Device[]>([]); //Track all discovered devices
  // const [packet, setPacket] = useState<string>(""); //Track the received data packet
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null); //Track currently connected device
  const [isDataStreaming, setIsDataStreaming] = useState<boolean>(false); //Track data streaming status
  // Initialization and BLE State Listener
  const dataSubscription = useRef<Subscription | null>(null); //Initialize data subscription ref
  // const [packetNumber, setPacketNumber] = useState<number>(0); //Track the packet number

  // Initialize packetStats
  const packetStatsRef = useRef<PacketStats>({
    firstPacketNumber: null,
    lastPacketNumber: null,
    receivedPacketNumbers: new Set<number>(),
    duplicatedPackets: 0,
  });
  // State to hold paccket loss data
  const [packetLossData, setPacketLossData] = useState<{
    packetLoss: number;
    packetLossPercentage: string;
  } | null>(null);

  // Timer ReferenceError
  const packetLossTimerRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePacketLoss = () => {
    const packetStats = packetStatsRef.current;
    if (
      packetStats.firstPacketNumber !== null &&
      packetStats.lastPacketNumber !== null &&
      packetStats.receivedPacketNumbers.size > 0
    ) {
      const expectedPackets = calculateExpectedPackets(
        packetStats.firstPacketNumber,
        packetStats.lastPacketNumber
      );
      const receivedPackets = packetStats.receivedPacketNumbers.size;
      const packetLoss = expectedPackets - receivedPackets;
      const packetLossPercentage = (
        (packetLoss / expectedPackets) *
        100
      ).toFixed(2);
      // console.log("Packet Loss:", packetLoss, packetLossPercentage);
      // Update State
      setPacketLossData({ packetLoss, packetLossPercentage });
      //Reset oacjet stats for the next interval
      console.log("reseting the packets for the next interval");
      // packetStatsRef.current = {
      //   firstPacketNumber: null,
      //   lastPacketNumber: null,
      //   receivedPacketNumbers: new Set<number>(),
      //   duplicatedPackets: 0,
      // };
      // Reset properties without changing the object reference
      packetStatsRef.current.firstPacketNumber = null;
      packetStatsRef.current.lastPacketNumber = null;
      packetStatsRef.current.receivedPacketNumbers.clear(); // Clear the Set
      packetStatsRef.current.duplicatedPackets = 0;
    } else {
      // No data to calculate packet Loss
      console.log("No data to calculate packet loss");
      setPacketLossData(null);
      Alert.alert(
        "Notice",
        "There is a problem with data streaming.\nTurn data streaming off and on again."
      );
    }
  };
  const calculateExpectedPackets = (
    firstPacketNumber: number,
    lastPacketNumber: number
  ): number => {
    if (lastPacketNumber >= firstPacketNumber) {
      return lastPacketNumber - firstPacketNumber + 1;
    } else {
      //Wrap around accurred
      return 65536 - firstPacketNumber + lastPacketNumber + 1;
    }
  };

  useEffect(() => {
    if (isDataStreaming) {
      // Start the packet loss timer
      packetLossTimerRef.current = setInterval(() => {
        calculatePacketLoss();
      }, 10000); // 10 seconds
    } else {
      // Stop the packet loss timer
      console.log("Data Streaming is off, Clearing packet loss timer");
      if (packetLossTimerRef.current) {
        clearInterval(packetLossTimerRef.current);
        packetLossTimerRef.current = null;
      }
      //Reset packet stats
      packetStatsRef.current = {
        firstPacketNumber: null,
        lastPacketNumber: null,
        receivedPacketNumbers: new Set<number>(),
        duplicatedPackets: 0,
      };
      setPacketLossData(null);
    }
    return () => {
      //clean up when component unmounts
      if (packetLossTimerRef.current) {
        clearInterval(packetLossTimerRef.current);
        packetLossTimerRef.current = null;
      }
    };
  }, [isDataStreaming]);

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
        async (error, device) => {
          if (dataSubscription.current) {
            console.log("removing data subscription");
            dataSubscription.current.remove();
            dataSubscription.current = null;
          }
          if (isRecordingRef.current) {
            try {
              const dataBuffer = getDataBuffer();
              await saveDataToFile(dataBuffer, "AutoSave");
              Toast.show({
                type: "success",
                text1: "Auto-Save Complete",
                text2: "Data saved successfully after disconnection.",
                position: "top",
              });
            } catch (error) {
              Toast.show({
                type: "error",
                text1: "Auto-Save Failed",
                text2: "An error occurred while saving data.",
                position: "top",
              });
            } finally {
              clearDataBuffer(); // Clear the data buffer when device disconnected
              setConnectedDevice(null);
            }
          } else {
            clearDataBuffer(); // Clear the data buffer when device disconnected
            setConnectedDevice(null);
          }

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
      // Data streaming and Recording will be paused before disconnecting
      await handleToggleDataStreaming(Command.PAUSE);
      Alert.alert(
        "Disconect Device",
        "Are you sure you want to disconnect? If you are recording, you will lose the data.",
        [
          { text: "Cancel", style: "cancel", onPress: () => {} },
          {
            text: "Disconnect",
            onPress: async () => {
              await disconnectDevice(connectedDevice);
              setConnectedDevice(null);
            },
          },
        ]
      );

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
      // the below line throws an unnecessary error message
      // handleError(
      //   "Data streaming is should be active for this function to work"
      // );
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
        isRecordingRef,
        packetStatsRef.current
      );
    },
    [connectedDevice, isDataStreaming, dataSubscription, isRecordingRef]
  );
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
    packetLossData, // Packet loss LIVE data
  };
}

export default useBLE;

////
