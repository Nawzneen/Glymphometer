import {
  BleError,
  Characteristic,
  Subscription,
  BleErrorCode,
  Device,
} from "react-native-ble-plx";
import { Dispatch, SetStateAction, MutableRefObject } from "react";
import { handleError } from "./handleError";
import Toast from "react-native-toast-message";
import base64 from "react-native-base64";
import {
  DATA_SERVICE_UUID,
  RX_CHARACTERISTIC_UUID,
  TX_CHARACTERISTIC_UUID,
} from "./bleConstants";

import { addToDataBuffer } from "./dataBuffer";

type PacketStats = {
  receivedPacketNumbers: Set<number>;
  duplicatedPackets: number;
  firstPacketNumber: number | null;
  lastPacketNumber: number | null;
};

//FUNCTION TO TOGGLE DATA STREAMING, SPECIFIC TO GM5
// S starts the data streaming, P pauses the data streaming
export const toggleDataStreaming =
  // useCallback(
  async (
    connectedDevice: Device | null,
    command: string,
    isDataStreaming: boolean,
    setIsDataStreaming: Dispatch<SetStateAction<boolean>>,
    dataSubscription: MutableRefObject<Subscription | null>,
    isRecordingRef: MutableRefObject<boolean>,
    packetStats: PacketStats
  ): Promise<void> => {
    console.log("toogle data", command);
    const status = command === "S" ? "Start" : "Pause";
    if (!connectedDevice) {
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
      await connectedDevice.writeCharacteristicWithResponseForService(
        DATA_SERVICE_UUID,
        RX_CHARACTERISTIC_UUID,
        base64Command
      );
      if (command === "S") {
        startDataStreaming(
          connectedDevice,
          dataSubscription,
          isRecordingRef,
          setIsDataStreaming,
          packetStats
        ); // Start data streaming
      } else if (command === "P") {
        // Stop data streaming and remove listener
        if (dataSubscription.current) {
          console.log("datasubsccription removed when paused");
          dataSubscription.current.remove();
          dataSubscription.current = null;
        }
      }
      setIsDataStreaming(command === "S"); //set true if command is S, set false if command is p
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
// [connectedDevice, isDataStreaming, dataSubscription];
// );

// FUNCTION FOR DATA STREAMING
export const startDataStreaming = (
  connectedDevice: Device,
  dataSubscription: MutableRefObject<Subscription | null>,
  isRecordingRef: MutableRefObject<boolean>,
  setIsDataStreaming: Dispatch<SetStateAction<boolean>>,
  packetStats: PacketStats
): void => {
  if (connectedDevice) {
    console.log("data streaming started");
    //set the mut to 512 to contain the 509 bytes data from GM5  (the default mut size is 23 bytes, showing only 20bytes of the data)
    connectedDevice
      .requestMTU(512)
      .then((mtu) => {
        // Before setting up a new listener, remove any existing one
        if (dataSubscription.current) {
          console.log(
            "data subscription remove before setting up new datasubscription in datastreaming"
          );
          dataSubscription.current.remove();
          dataSubscription.current = null;
        }
        console.log("setting up data subscription");
        // Set up the listener and store the subscription
        dataSubscription.current =
          connectedDevice.monitorCharacteristicForService(
            DATA_SERVICE_UUID,
            TX_CHARACTERISTIC_UUID,
            onDataUpdate(
              dataSubscription,
              setIsDataStreaming,
              isRecordingRef,
              packetStats
            ) //callback function to handle the data
          );
      })
      .catch((error) => {
        console.log("MTU negotation failed", error);
        handleError(error, "MTU negotiation failed");
      });
  }
};

//CALL BACK FUNCTION TO HANDLE THE RECEIVED DATA
export const onDataUpdate =
  (
    dataSubscription: MutableRefObject<Subscription | null>,
    setIsDataStreaming: Dispatch<SetStateAction<boolean>>,
    isRecordingRef: MutableRefObject<boolean>,
    packetStats: PacketStats
  ) =>
  (error: BleError | null, characteristic: Characteristic | null): void => {
    // console.log("on Data update is supposed to run");
    try {
      if (error) {
        console.log("Error onDataUpdate", error);
        // If the error indicates the device is disconnected, remove the subscription
        console.log("Error Code:", error.errorCode);
        console.log(BleErrorCode.DeviceDisconnected);
        if (error.errorCode === BleErrorCode.DeviceDisconnected) {
          if (dataSubscription.current) {
            dataSubscription.current.remove();
            dataSubscription.current = null;
            console.log(
              "Data subscription removed in onDataUpdate when device disconnected"
            );
          }
          setIsDataStreaming(false);
        }
        return;
      }

      if (characteristic && characteristic.value) {
        //characteristic.value is a base64 encoded string
        const encodedData = characteristic.value;
        // Decode the Base64 string to a byte array
        const decodedData = base64.decode(encodedData);

        const byteArray = Array.from(decodedData, (char) => char.charCodeAt(0));

        // this is decimal values of each paceket [83,83,...,69,69]

        // Process the packet (now only for for packet loss)
        processPacket(byteArray, packetStats);

        if (isRecordingRef.current) {
          addToDataBuffer(byteArray); // Accumulate binary data
        }
      } else {
        console.error("Characteristic value is null or undefined.");
      }
    } catch (error: unknown) {
      console.log("Error receiving data", error);
      handleError(error, "Error receiving data");
    }
  };
////
const START_MARKER = 83; // 'S' in ASCII
const END_MARKER = 69; // 'E' in ASCII

const validatePacketMarkers = (packet: number[]): boolean => {
  return (
    packet[0] === START_MARKER &&
    packet[1] === START_MARKER &&
    packet[507] === END_MARKER &&
    packet[508] === END_MARKER
  );
};

const extractPacketNumber = (packet: number[]): number => {
  return (packet[505] << 8) | packet[506];
};

const processPacket = (packet: number[], packetStats: PacketStats): void => {
  // Validate packet markers
  if (!validatePacketMarkers(packet)) {
    console.warn("Invalid packet markers.");
    return;
  }

  // Extract packet number
  const packetNumber = extractPacketNumber(packet);
  // Initialize first packet number
  if (packetStats.firstPacketNumber === null) {
    packetStats.firstPacketNumber = packetNumber;
    console.log("first packet number is", packetNumber);
  }

  // Update last packet number
  packetStats.lastPacketNumber = packetNumber;
  console.log("last packet number is", packetNumber);

  // Check for duplicates
  if (packetStats.receivedPacketNumbers.has(packetNumber)) {
    packetStats.duplicatedPackets += 1;
  } else {
    packetStats.receivedPacketNumbers.add(packetNumber);
  }
};
