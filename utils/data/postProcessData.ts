import * as FileSystem from "expo-file-system";
import { PacketNumber, START_MARKER, END_MARKER, PACKET_SIZE } from "@/constants/Constants";
// Function to read binary data from a file
const readBinaryDataFromFile = async (
  fileUri: string
): Promise<Uint8Array | false> => {
  try {
    const base64Data = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const binaryData = global.Buffer.from(base64Data, "base64");
    return new Uint8Array(binaryData);
  } catch (error) {
    console.error("Error reading binary data", error);
    return false;
  }
};

// Function to validate the start and end markers of a packet
const validatePacketMarkers = (
  packet: Uint8Array,
  packetIndex: number
): boolean => {
  
  if (
    packet[0] !== START_MARKER ||
    // packet[1] !== START_MARKER ||
    // packet[507] !== END_MARKER ||
    packet[508] !== END_MARKER
  ) {
    console.error(`Packet ${packetIndex} has invalid start/end markers.`);
    return false;
  }
  return true;
};

// Function to extract the packet number from a packet
const extractPacketNumber = (packet: Uint8Array): number => {
  return (packet[PacketNumber.HIGHBYTE] << 8) | packet[PacketNumber.LOWBYTE];
};

// Function to process all packets and collect necessary data
const processPackets = (data: Uint8Array, packetSize: number) => {
  const totalPackets = Math.floor(data.length / packetSize);
  const packetNumbersSet = new Set<number>();
  const packetNumbersArray: number[] = [];
  let firstPacketNumber: number | null = null;
  let lastPacketNumber: number | null = null;
  let duplicatePackets = 0;

  for (let i = 0; i < totalPackets; i++) {
    const start = i * packetSize;
    const end = start + packetSize;
    const packet = data.slice(start, end);

    // Validate packet markers
    if (!validatePacketMarkers(packet, i)) {
      continue;
    }

    // Extract packet number
    const packetNumber = extractPacketNumber(packet);

    if (firstPacketNumber === null) {
      firstPacketNumber = packetNumber;
    }

    // Collect packet numbers for loss calculation
    packetNumbersArray.push(packetNumber);

    // Check for duplicates
    if (packetNumbersSet.has(packetNumber)) {
      console.warn(`Duplicate packet detected: ${packetNumber}`);
      duplicatePackets += 1;
    } else {
      packetNumbersSet.add(packetNumber);
    }

    lastPacketNumber = packetNumber;
  }

  return {
    totalPackets,
    firstPacketNumber,
    lastPacketNumber,
    duplicatePackets,
    packetNumbersSet,
    packetNumbersArray,
  };
};

// Function to calculate expected packets considering wrap-around
const calculateExpectedPackets = (
  firstPacketNumber: number,
  lastPacketNumber: number
): number => {
  if (lastPacketNumber >= firstPacketNumber) {
    return lastPacketNumber - firstPacketNumber + 1;
  } else {
    // Wrap-around occurred
    return 65535 - firstPacketNumber + 1 + (lastPacketNumber + 1);
  }
};
const calculateDuration = (expectedPackets: number) => {
  const duration = Math.floor(expectedPackets * 0.056); // Each packet receives in 56ms

  return { duration };
};
// Function to calculate packet loss and percentage
const calculatePacketLoss = (
  expectedPackets: number,
  receivedPackets: number
) => {
  const packetLoss = expectedPackets - receivedPackets;
  const packetLossPercentage = ((packetLoss / expectedPackets) * 100).toFixed(
    2
  );
  return { packetLoss, packetLossPercentage };
};

// Main function to validate data
export const postProcessData = async (fileUri: string) => {
  const Uint8ArrayData = await readBinaryDataFromFile(fileUri);
  if (!Uint8ArrayData) return;

 

  // Check for extra data
  if (Uint8ArrayData.length % PACKET_SIZE !== 0) {
    console.error("Extra data found in the file");
    return;
  }

  // Process packets
  const {
    totalPackets,
    firstPacketNumber,
    lastPacketNumber,
    duplicatePackets,
    packetNumbersSet,
  } = processPackets(Uint8ArrayData, PACKET_SIZE);

  // console.log(`${totalPackets} totalPacketsNumber`);

  if (firstPacketNumber === null || lastPacketNumber === null) {
    console.error("Could not determine first or last packet number.");
    return null;
  }

  // Calculate expected packets
  const expectedPacketsNumber = calculateExpectedPackets(
    firstPacketNumber,
    lastPacketNumber
  );

  // Calculate packet loss
  const { packetLoss, packetLossPercentage } = calculatePacketLoss(
    expectedPacketsNumber,
    packetNumbersSet.size
  );
  // Calculate duration of recording
  const { duration } = calculateDuration(expectedPacketsNumber);

  // Output results
  // console.log(`First Packet Number: ${firstPacketNumber}`);
  // console.log(`Last Packet Number: ${lastPacketNumber}`);
  // console.log(`Total Duplicate Packets: ${duplicatePackets}`);
  // console.log(`Expected Packets: ${expectedPacketsNumber}`);
  // console.log(`Actual Packets Received: ${packetNumbersSet.size}`);
  // console.log(`Packets Lost: ${packetLoss}`);
  // console.log(
  //   `Packet Loss Percentage: ${packetLossPercentage}%`,
  //   typeof packetLossPercentage
  // );

  return {
    packetsNumbre: packetNumbersSet.size, // Total packets processed without duplicates
    // packetsNumbre: packetNumbersArray.length, // Total packets processed counting duplicates
    firstPacketNumber,
    lastPacketNumber,
    duplicatePackets,
    expectedPacketsNumber,
    packetLoss,
    packetLossPercentage,
    duration,
  };
};
