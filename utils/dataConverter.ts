interface ConversionResult {
  outputText: string;
  missed: number;
}

export default function convertData(buffer: Uint8Array): ConversionResult {
  let sampletime = 0;
  let missed = 0;
  let packagenumbercycle = 0;
  let first = 0;
  let last_packagenumber = 0;

  // Each packet is 509 bytes
  const packetSize = 509;
  const outputLines: string[] = [];

  for (
    let offset = 0;
    offset + packetSize <= buffer.length;
    offset += packetSize
  ) {
    const chunk = buffer.subarray(offset, offset + packetSize);

    // Extract the package number
    const packagenumber = (chunk[505] << 8) | chunk[506];

    if (first === 0) {
      last_packagenumber = packagenumber - 1;
      first = 1;
    }

    const dif = packagenumber - last_packagenumber - 1;
    if (dif !== 0) {
      if (dif === -65536) {
        packagenumbercycle += 1;
      } else {
        missed += dif;
      }
    }

    last_packagenumber = packagenumber;

    // Extract NIRS data (as in Python)
    const x = 450;
    const ch1w1a = (chunk[x] << 8) | chunk[x + 1];
    const ch1w2a = (chunk[x + 2] << 8) | chunk[x + 3];
    const ch1w3a = (chunk[x + 4] << 8) | chunk[x + 5];
    const ch1w4a = (chunk[x + 6] << 8) | chunk[x + 7];
    const ch2w1a = (chunk[x + 8] << 8) | chunk[x + 9];
    const ch2w2a = (chunk[x + 10] << 8) | chunk[x + 11];
    const ch2w3a = (chunk[x + 12] << 8) | chunk[x + 13];
    const ch2w4a = (chunk[x + 14] << 8) | chunk[x + 15];
    const ch3w1a = (chunk[x + 16] << 8) | chunk[x + 17];
    const ch3w2a = (chunk[x + 18] << 8) | chunk[x + 19];
    const ch3w3a = (chunk[x + 20] << 8) | chunk[x + 21];
    const ch3w4a = (chunk[x + 22] << 8) | chunk[x + 23];

    const ch1w1b = (chunk[x + 24] << 8) | chunk[x + 25];
    const ch1w2b = (chunk[x + 26] << 8) | chunk[x + 27];
    const ch1w3b = (chunk[x + 28] << 8) | chunk[x + 29];
    const ch1w4b = (chunk[x + 30] << 8) | chunk[x + 31];
    const ch2w1b = (chunk[x + 32] << 8) | chunk[x + 33];
    const ch2w2b = (chunk[x + 34] << 8) | chunk[x + 35];
    const ch2w3b = (chunk[x + 36] << 8) | chunk[x + 37];
    const ch2w4b = (chunk[x + 38] << 8) | chunk[x + 39];
    const ch3w1b = (chunk[x + 40] << 8) | chunk[x + 41];
    const ch3w2b = (chunk[x + 42] << 8) | chunk[x + 43];
    const ch3w3b = (chunk[x + 44] << 8) | chunk[x + 45];
    const ch3w4b = (chunk[x + 46] << 8) | chunk[x + 47];

    const temp = ((chunk[x + 48] << 8) | chunk[x + 49]) / 10;

    // Process the high-rate data (EEG, PPG, ECG, etc.)
    for (let i = 0; i < 14; i++) {
      const a = i * 32 + 2;
      const b = (i + 1) * 32 + 2;
      const highratedata = chunk.subarray(a, b);

      const EEG1 = intFromBytes(highratedata.subarray(0, 3), true);
      const EEG2 = intFromBytes(highratedata.subarray(3, 6), true);
      const EEG3 = intFromBytes(highratedata.subarray(6, 9), true);
      const EEG4 = intFromBytes(highratedata.subarray(9, 12), true);
      const PPG = intFromBytes(highratedata.subarray(12, 14), true);
      const ECG = intFromBytes(highratedata.subarray(14, 17), true);
      const CHESTACM = intFromBytes(highratedata.subarray(17, 19), true);
      const ACMX = intFromBytes(highratedata.subarray(19, 21), true);
      const ACMY = intFromBytes(highratedata.subarray(21, 23), true);
      const ACMZ = intFromBytes(highratedata.subarray(23, 25), true);
      const gyroX = intFromBytes(highratedata.subarray(25, 27), true);
      const gyroy = intFromBytes(highratedata.subarray(27, 29), true);
      const gyroz = intFromBytes(highratedata.subarray(29, 31), true);

      const sync = (highratedata[31] & 0x80) >> 7;
      const reservedata = highratedata[31] & 0x7f;
      const stopsign = 33;

      sampletime += 4;

      let convertedString: string;
      if (i < 7) {
        convertedString = `${sampletime}\t${ch1w1a}\t${ch1w2a}\t${ch1w3a}\t${ch1w4a}\t${ch2w1a}\t${ch2w2a}\t${ch2w3a}\t${ch2w4a}\t${ch3w1a}\t${ch3w2a}\t${ch3w3a}\t${ch3w4a}\t${ACMX}\t${ACMY}\t${ACMZ}\t${gyroX}\t${gyroy}\t${gyroz}\t${temp}\t${EEG1}\t${EEG2}\t${EEG3}\t${EEG4}\t${PPG}\t${ECG}\t${CHESTACM}\t${reservedata}\t${sync}\t${stopsign}\t${missed}\t${packagenumbercycle}\t${packagenumber}\n`;
      } else {
        convertedString = `${sampletime}\t${ch1w1b}\t${ch1w2b}\t${ch1w3b}\t${ch1w4b}\t${ch2w1b}\t${ch2w2b}\t${ch2w3b}\t${ch2w4b}\t${ch3w1b}\t${ch3w2b}\t${ch3w3b}\t${ch3w4b}\t${ACMX}\t${ACMY}\t${ACMZ}\t${gyroX}\t${gyroy}\t${gyroz}\t${temp}\t${EEG1}\t${EEG2}\t${EEG3}\t${EEG4}\t${PPG}\t${ECG}\t${CHESTACM}\t${reservedata}\t${sync}\t${stopsign}\t${missed}\t${packagenumbercycle}\t${packagenumber}\n`;
      }

      outputLines.push(convertedString);
    }
  }

  return {
    outputText: outputLines.join(""),
    missed: missed,
  };
}

// Helper function to convert a byte array to an integer
function intFromBytes(bytes: Uint8Array, signed: boolean): number {
  let value = 0;
  for (const byte of bytes) {
    value = (value << 8) | byte;
  }
  if (signed) {
    // Adjust if signed and top bit set
    const bitLength = bytes.length * 8;
    const max = 1 << (bitLength - 1);
    if ((value & max) !== 0) {
      value = value - (1 << bitLength);
    }
  }
  return value;
}

// Example usage after data collection:
// const result = convertData(Uint8Array.from(getDataBuffer()));
// console.log("Missed packets:", result.missed);
// Now write result.outputText to a .txt file using react-native-fs or similar.
