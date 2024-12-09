import { connectToDevice, disconnectDevice } from "@/utils/bleConnection";
import bleManager from "@/utils/bleManager";
import { discoverBLEServicesCharactristics } from "@/utils/bleCharacteristics";
import { Device } from "react-native-ble-plx";

jest.mock("@/utils/bleManager", () => ({
  connectToDevice: jest.fn(),
  stopDeviceScan: jest.fn(),
  cancelDeviceConnection: jest.fn(),
}));

jest.mock("@/utils/bleCharacteristics", () => ({
  discoverBLEServicesCharactristics: jest.fn(),
}));

describe("connectToDevice", () => {
  const mockDevice = { id: "test-device-id" } as Device;
  const mockConnectedDevice = {
    id: "test-device-id",
    connected: true,
  } as unknown as Device;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("connects to device and discovers services/characteristics", async () => {
    (bleManager.connectToDevice as jest.Mock).mockResolvedValue(
      mockConnectedDevice
    );

    const result = await connectToDevice(mockDevice);

    expect(bleManager.connectToDevice).toHaveBeenCalledWith("test-device-id");
    expect(discoverBLEServicesCharactristics).toHaveBeenCalledWith(
      mockConnectedDevice
    );
    expect(bleManager.stopDeviceScan).toHaveBeenCalled();
    expect(result).toBe(mockConnectedDevice);
  });

  it("throws an error if connecting fails", async () => {
    (bleManager.connectToDevice as jest.Mock).mockRejectedValue(
      new Error("connect error")
    );

    await expect(connectToDevice(mockDevice)).rejects.toThrow("connect error");
  });
});

describe("disconnectDevice", () => {
  const mockDevice = { id: "test-device-id" } as Device;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("disconnects the device", async () => {
    await disconnectDevice(mockDevice);
    expect(bleManager.cancelDeviceConnection).toHaveBeenCalledWith(
      "test-device-id"
    );
  });

  it("throws an error if disconnecting fails", async () => {
    (bleManager.cancelDeviceConnection as jest.Mock).mockRejectedValue(
      new Error("disconnect error")
    );

    await expect(disconnectDevice(mockDevice)).rejects.toThrow(
      "disconnect error"
    );
  });
});
