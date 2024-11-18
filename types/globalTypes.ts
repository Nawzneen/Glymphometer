export interface FileInfoType {
  packetsNumbre: number;
  firstPacketNumber: number;
  lastPacketNumber: number;
  duplicatePackets: number;
  expectedPacketsNumber: number;
  packetLoss: number;
  packetLossPercentage: string;
}
