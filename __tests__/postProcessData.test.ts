import * as FileSystem from "expo-file-system";
import { postProcessData } from "@/utils/postProcessData";
jest.mock("expo-file-system", () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: { Base64: "base64" },
}));

// Mock global.Buffer if needed
global.Buffer = require("buffer").Buffer;

describe("postProcessData", () => {
  const PACKET_SIZE = 509;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns undefined if file read fails", async () => {
    (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValue(
      new Error("Read error")
    );
    const result = await postProcessData("fakeUri");
    expect(result).toBeUndefined();
  });

  it("returns undefined if extra data is present", async () => {
    // Create base64 data that doesn't divide evenly by 509
    const dataLength = PACKET_SIZE + 10; // extra bytes
    const fakeData = Buffer.alloc(dataLength, 0).toString("base64");
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(fakeData);

    const result = await postProcessData("fakeUri");
    expect(result).toBeUndefined();
  });

  it("processes valid packets and returns stats", async () => {
    // Create a single valid packet
    // Packet format: S=83, E=69 at correct positions
    const packet = Buffer.alloc(PACKET_SIZE, 0);
    packet[0] = 83; // S
    packet[1] = 83; // S
    packet[507] = 69; // E
    packet[508] = 69; // E
    // Packet number at [505,506]
    packet[505] = 0x00;
    packet[506] = 0x01; // Packet number = 1

    const base64Data = packet.toString("base64");
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(base64Data);

    const result = await postProcessData("fakeUri");
    expect(result).toBeTruthy();
    expect(result?.packetsNumbre).toEqual(1);
    expect(result?.firstPacketNumber).toBe(1);
    expect(result?.lastPacketNumber).toBe(1);
    expect(result?.duplicatePackets).toBe(0);
    expect(result?.expectedPacketsNumber).toBe(1);
    expect(result?.packetLoss).toBe(0);
    expect(result?.packetLossPercentage).toBe("0.00");
    expect(result?.duration).toBeDefined();
  });

  it("handles invalid packet markers", async () => {
    // Packet with invalid markers
    const packet = Buffer.alloc(PACKET_SIZE, 0);
    // Missing valid start and end markers
    const base64Data = packet.toString("base64");
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(base64Data);

    const result = await postProcessData("fakeUri");
    expect(result).toBeNull(); // No valid packets processed
  });

  it("handles multiple packets and detects duplicates", async () => {
    // Two packets, second one is a duplicate of first
    const createPacket = (packetNumber: number) => {
      const p = Buffer.alloc(PACKET_SIZE, 0);
      p[0] = 83;
      p[1] = 83;
      p[507] = 69;
      p[508] = 69;
      p[505] = (packetNumber >> 8) & 0xff;
      p[506] = packetNumber & 0xff;
      return p;
    };

    const packet1 = createPacket(100);
    const packet2 = createPacket(100); // duplicate
    const combined = Buffer.concat([packet1, packet2]);
    const base64Data = combined.toString("base64");

    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(base64Data);

    const result = await postProcessData("fakeUri");
    expect(result).toBeTruthy();
    // expect(result?.packetsNumbre).toBe(2); // duplicated packets
    expect(result?.packetsNumbre).toBe(1); // Unique packets only
    expect(result?.duplicatePackets).toBe(1);
  });
});
