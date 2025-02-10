export enum Command {
    PAUSE = "P",
    START = "L",
}
export const PACKET_SIZE = 509;
export enum PacketNumber {
    HIGHBYTE = 506,
    LOWBYTE = 507,
}
// OLD Protocol 
// HIGHBYTE = 505,
// LOWBYTE = 506,
// NEW Protcol 
// HIGHBYTE = 506,
// LOWBYTE = 507,

export const START_MARKER = 83; // 'S' in ASCII
export const END_MARKER = 69; // 'E' in ASCII
