let dataBuffer: number[] = [];

export const getDataBuffer = () => dataBuffer;

export const addToDataBuffer = (dataChunk: number[]) => {
  dataBuffer = dataBuffer.concat(dataChunk);
};

export const clearDataBuffer = () => {
  console.log("Data buffer cleared");
  dataBuffer = [];
};
