import { addToNirsData } from "@/utils/buffers/nirsDataBuffer";
import { PACKET_SIZE } from "@/constants/Constants";

/**
 * Extracts NIRS data from a single 509-byte packet.
 * Each packet contains 13 mini-blocks of 36 bytes (starting at index 1).
 * For each mini-block, the first 24 bytes are interpreted as 12 big-endian 16-bit numbers.
 *
 * The data for each mini-block is then arranged into a 3x4 array corresponding to:
 * [
 *   [ch1.w1, ch1.w2, ch1.w3, ch1.w4],
 *   [ch2.w1, ch2.w2, ch2.w3, ch2.w4],
 *   [ch3.w1, ch3.w2, ch3.w3, ch3.w4]
 * ]
 *
 * This formatted mini-block is then added to the global NirsData structure.
 *
 * @param packet A single packet as a number array (should be 509 bytes long).
 */
const NIRS_MINI_BLOCKS = 13; // Each packet contains 13 mini-blocks
const extractNirsData = (packet: number[]) => {
  // console.log("extractNirsData");
  if (packet.length < PACKET_SIZE) {
    console.error("Packet is too short.");
    return;
  }

  for (
    let miniBlockIndex = 0;
    miniBlockIndex < NIRS_MINI_BLOCKS;
    miniBlockIndex++
  ) {
    const start = miniBlockIndex * 36 + 1;
    const end = start + 24; // Only the first 24 bytes contain NIRS data
    const miniBlock = packet.slice(start, end);
    if (miniBlock.length !== 24) {
      console.error("Mini-block is too short.");
      return;
    }

    // Extract 12 NIRS values, each two bytes
    const nirsValues: number[] = [];
    for (let i = 0; i < 24; i += 2) {
      const val = (miniBlock[i] << 8) | miniBlock[i + 1];
      nirsValues.push(val);
    }

    // Reformat into a 3x4 structure:
    // - First 4 values belong to channel 1 (wavelengths 1-4)
    // - Next 4 values belong to channel 2 (wavelengths 1-4)
    // - Last 4 values belong to channel 3 (wavelengths 1-4)

    const formattedNirsData = [
      nirsValues.slice(0, 4),
      nirsValues.slice(4, 8),
      nirsValues.slice(8, 12),
    ];

    // // Add this mini-block's data to the global NirsData structure,
    // // ensuring each channel's wavelength gets its own array of values.
    addToNirsData(formattedNirsData);
  }
};

// SECOND METHOD
// const extractNirsData = (packet: number[]) => {
//   if (packet.length < PACKET_SIZE) {
//     console.error("Packet is too short.");
//     return;
//   }

//   // Process each mini-block in the packet
//   for (let miniBlockIndex = 0; miniBlockIndex < NIRS_MINI_BLOCKS; miniBlockIndex++) {
//     // Calculate the start of the mini-block as in Python
//     const start = (miniBlockIndex * 36) + 1;
//     const end = ((miniBlockIndex + 1) * 36) + 1;
//     const miniBlock = packet.slice(start, end);

//     // Only use the first 24 bytes of the miniBlock for NIRS data
//     const nirsBytes = miniBlock.slice(0, 24);
//     const nirsValues: number[] = [];
//     for (let rr = 0; rr < 12; rr++) {
//       const highByte = nirsBytes[2 * rr];
//       const lowByte = nirsBytes[2 * rr + 1];
//       const value = (highByte << 8) | lowByte;
//       nirsValues.push(value);
//     }

//     // Reformat into a 3x4 structure:
//     const formattedNirsData = [
//       nirsValues.slice(0, 4),
//       nirsValues.slice(4, 8),
//       nirsValues.slice(8, 12)
//     ];

//     // Store the formatted NIRS data
//     addToNirsData(formattedNirsData);
//   }
// };

export default extractNirsData;
