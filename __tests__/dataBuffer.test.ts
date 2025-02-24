import {
  addToDataBuffer,
  getDataBuffer,
  clearDataBuffer,
} from "@/utils/buffers/dataBuffer"; // Adjust path if needed

describe("dataBuffer utilities", () => {
  beforeEach(() => {
    clearDataBuffer(); // Ensure buffer is empty before each test
  });

  it("should add data to the buffer", () => {
    addToDataBuffer([1, 2, 3]);
    expect(getDataBuffer()).toEqual([1, 2, 3]);
  });

  it("should clear the buffer", () => {
    addToDataBuffer([4, 5, 6]);
    clearDataBuffer();
    expect(getDataBuffer()).toEqual([]);
  });
});
