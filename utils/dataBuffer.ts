let dataBuffer: number[] = [];

export const getDataBuffer = () => dataBuffer;

export const addToDataBuffer = (dataChunk: number[]) => {
  try {
    dataBuffer.push(...dataChunk);
  } catch (error) {
    console.log("Error adding data to buffer", error);
  }
};

export const clearDataBuffer = () => {
  console.log("Data buffer cleared");
  dataBuffer = [];
};
