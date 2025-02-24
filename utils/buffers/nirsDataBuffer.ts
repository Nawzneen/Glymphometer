const RING_SIZE = 3000;
let nirsBuffers: number[][][] = [
  [[], [], [], []], // Channel 1: wavelengths 1-4
  [[], [], [], []], // Channel 2: wavelengths 1-4
  [[], [], [], []], // Channel 3: wavelengths 1-4
];

export const getNirsData = () => nirsBuffers;

export const addToNirsData = (dataChunk: number[][]) => {
  // dataChunk is expected to be a 3x4 array, e.g.:
  // [
  //   [ch1.w1, ch1.w2, ch1.w3, ch1.w4],
  //   [ch2.w1, ch2.w2, ch2.w3, ch2.w4],
  //   [ch3.w1, ch3.w2, ch3.w3, ch3.w4]
  // ]
  for (let ch = 0; ch < 3; ch++) {
    for (let wl = 0; wl < 4; wl++) {
      // push the new sample
      nirsBuffers[ch][wl].push(dataChunk[ch][wl]);
      // if buffer grows too large, remove older data
      if (nirsBuffers[ch][wl].length > RING_SIZE) {
        nirsBuffers[ch][wl].splice(0, nirsBuffers[ch][wl].length - RING_SIZE);
      }
    }
  }
};

export const clearNirsData = () => {
  console.log("Accumulated Nirs Data Cleared");
  nirsBuffers = [
    [[], [], [], []],
    [[], [], [], []],
    [[], [], [], []],
  ];
};
