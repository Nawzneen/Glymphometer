import {
  discoverBLEServicesCharactristics,
  //   readBatteryLevel,
} from "@/utils/bleCharacteristics"; // Adjust path
import { Device } from "react-native-ble-plx";

describe("discoverBLEServicesCharactristics", () => {
  let mockDevice: Device;

  beforeEach(() => {
    mockDevice = {
      discoverAllServicesAndCharacteristics: jest
        .fn()
        .mockResolvedValue(undefined),
      services: jest.fn().mockResolvedValue([{ uuid: "service-uuid" }]),
      characteristicsForService: jest
        .fn()
        .mockResolvedValue([
          { uuid: "char-uuid", isReadable: true, isNotifiable: false },
        ]),
    } as any;
  });

  it("discovers services and characteristics", async () => {
    await discoverBLEServicesCharactristics(mockDevice);
    expect(mockDevice.discoverAllServicesAndCharacteristics).toHaveBeenCalled();
    expect(mockDevice.services).toHaveBeenCalled();
    expect(mockDevice.characteristicsForService).toHaveBeenCalledWith(
      "service-uuid"
    );
  });
});

// describe("readBatteryLevel", () => {
//   let mockDevice: Device;

//   beforeEach(() => {
//     mockDevice = {
//       readCharacteristicForService: jest
//         .fn()
//         .mockResolvedValue({ value: "base64BatteryValue" }),
//     } as any;
//     jest.spyOn(console, "log").mockImplementation(() => {});
//   });

//   afterEach(() => {
//     (console.log as jest.Mock).mockRestore();
//   });

//   it("reads battery level from the device", async () => {
//     await readBatteryLevel(mockDevice);
//     expect(mockDevice.readCharacteristicForService).toHaveBeenCalledWith(
//       "180F",
//       "2A19"
//     );
//     expect(console.log).toHaveBeenCalledWith(
//       "Battery Level is",
//       "base64BatteryValue"
//     );
//   });

//   it("logs an error if reading fails", async () => {
//     (mockDevice.readCharacteristicForService as jest.Mock).mockRejectedValue(
//       new Error("Failed")
//     );
//     await readBatteryLevel(mockDevice);
//     expect(console.log).toHaveBeenCalledWith(
//       "Error in reading battery level",
//       expect.any(Error)
//     );
//   });
// });
