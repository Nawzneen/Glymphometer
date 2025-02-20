let nirsData: number[][][] = [
  [[], [], [], []], // Channel 1: wavelengths 1-4
  [[], [], [], []], // Channel 2: wavelengths 1-4
  [[], [], [], []], // Channel 3: wavelengths 1-4
];

export const getNirsData = () => nirsData;

export const addToNirsData = (dataChunk: number[][]) => {
  // dataChunk is expected to be a 3x4 array, e.g.:
  // [
  //   [ch1.w1, ch1.w2, ch1.w3, ch1.w4],
  //   [ch2.w1, ch2.w2, ch2.w3, ch2.w4],
  //   [ch3.w1, ch3.w2, ch3.w3, ch3.w4]
  // ]
  try {
    for (let ch = 0; ch < 3; ch++) {
      for (let wl = 0; wl < 4; wl++) {
        nirsData[ch][wl].push(dataChunk[ch][wl]);
      }
    }
  } catch (error) {
    console.error("Error adding data to Nirs Data array", error);
  }
  //   console.log("Nirs Data:", nirsData);
};

export const clearNirsData = () => {
  console.log("Accumulated Nirs Data Cleared");
  nirsData = [
    [[], [], [], []],
    [[], [], [], []],
    [[], [], [], []],
  ];
};
