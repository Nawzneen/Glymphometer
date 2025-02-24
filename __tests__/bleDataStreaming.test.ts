import {
  toggleDataStreaming,
  startDataStreaming,
  onDataUpdate,
} from "@/utils/bleDataStreaming";
import { handleError } from "@/utils/handleError";
import Toast from "react-native-toast-message";
import { addToDataBuffer } from "@/utils/buffers/dataBuffer";
import base64 from "react-native-base64";
import {
  BleError,
  Device,
  Subscription,
  BleErrorCode,
} from "react-native-ble-plx";

jest.mock("react-native-toast-message");
jest.mock("@/utils/handleError");
jest.mock("@/utils/dataBuffer");

jest.mock("react-native-base64", () => ({
  encode: jest.fn(),
  decode: jest.fn(),
}));

jest.mock("@/utils/bleConstants", () => ({
  DATA_SERVICE_UUID: "mock-data-service-uuid",
  RX_CHARACTERISTIC_UUID: "mock-rx-char-uuid",
  TX_CHARACTERISTIC_UUID: "mock-tx-char-uuid",
}));

describe("toggleDataStreaming", () => {
  let mockDevice: Device;
  let setIsDataStreaming: jest.Mock;
  let dataSubscription: { current: Subscription | null };
  let isRecordingRef: { current: boolean };
  let packetStats: {
    receivedPacketNumbers: Set<number>;
    duplicatedPackets: number;
    firstPacketNumber: number | null;
    lastPacketNumber: number | null;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDevice = {
      writeCharacteristicWithResponseForService: jest.fn(),
      requestMTU: jest.fn().mockResolvedValue(512),
      monitorCharacteristicForService: jest.fn(),
    } as unknown as Device;

    // Mock base64 encoding
    (base64.encode as jest.Mock).mockImplementation(
      (input: string) => `base64-${input}`
    );

    setIsDataStreaming = jest.fn();
    dataSubscription = { current: null };
    isRecordingRef = { current: false };
    packetStats = {
      receivedPacketNumbers: new Set(),
      duplicatedPackets: 0,
      firstPacketNumber: null,
      lastPacketNumber: null,
    };
  });

  it("shows error if no device is connected", async () => {
    await toggleDataStreaming(
      null,
      "S",
      false,
      setIsDataStreaming,
      dataSubscription,
      isRecordingRef,
      packetStats
    );
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        text1: "No Device is Connected.",
      })
    );
  });

  it("shows error if attempting to start streaming when already started", async () => {
    await toggleDataStreaming(
      mockDevice,
      "S",
      true,
      setIsDataStreaming,
      dataSubscription,
      isRecordingRef,
      packetStats
    );
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({ text1: "Data Streaming Already Started" })
    );
    expect(
      mockDevice.writeCharacteristicWithResponseForService
    ).not.toHaveBeenCalled();
  });

  it("starts streaming when command is 'S'", async () => {
    await toggleDataStreaming(
      mockDevice,
      "S",
      false,
      setIsDataStreaming,
      dataSubscription,
      isRecordingRef,
      packetStats
    );
    expect(
      mockDevice.writeCharacteristicWithResponseForService
    ).toHaveBeenCalledWith(
      "mock-data-service-uuid",
      "mock-rx-char-uuid",
      "base64-S"
    );
    expect(setIsDataStreaming).toHaveBeenCalledWith(true);
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        text1: "Data Streaming Started",
      })
    );
  });

  it("pauses streaming when command is 'P'", async () => {
    // Pretend we previously had a subscription
    // dataSubscription.current = new Subscription();
    dataSubscription.current = { remove: jest.fn() } as unknown as Subscription;

    await toggleDataStreaming(
      mockDevice,
      "P",
      true,
      setIsDataStreaming,
      dataSubscription,
      isRecordingRef,
      packetStats
    );
    expect(
      mockDevice.writeCharacteristicWithResponseForService
    ).toHaveBeenCalledWith(
      "mock-data-service-uuid",
      "mock-rx-char-uuid",
      "base64-P"
    );
    expect(dataSubscription.current).toBeNull();
    expect(setIsDataStreaming).toHaveBeenCalledWith(false);
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        text1: "Data Streaming Paused",
      })
    );
  });

  it("handles errors during start/stop", async () => {
    (
      mockDevice.writeCharacteristicWithResponseForService as jest.Mock
    ).mockRejectedValueOnce(new Error("Write Failed"));

    // (mockDevice.requestMTU as jest.Mock).mockRejectedValueOnce(
    //   new Error("MTU error")
    // );

    // mockDevice.writeCharacteristicWithResponseForService.mockRejectedValueOnce(
    //   new Error("Write Failed")
    // );
    await toggleDataStreaming(
      mockDevice,
      "S",
      false,
      setIsDataStreaming,
      dataSubscription,
      isRecordingRef,
      packetStats
    );
    expect(handleError).toHaveBeenCalledWith(
      expect.any(Error),
      "Error Starting data streaming"
    );
  });
});

describe("startDataStreaming", () => {
  let mockDevice: Device;
  let dataSubscription: { current: Subscription | null };
  let isRecordingRef: { current: boolean };
  let setIsDataStreaming: jest.Mock;
  let packetStats: any;

  beforeEach(() => {
    mockDevice = {
      writeCharacteristicWithResponseForService: jest.fn(),
      requestMTU: jest.fn().mockResolvedValue(512),
      monitorCharacteristicForService: jest.fn(),
    } as unknown as Device;
    dataSubscription = { current: null };
    isRecordingRef = { current: false };
    setIsDataStreaming = jest.fn();
    packetStats = {
      receivedPacketNumbers: new Set(),
      duplicatedPackets: 0,
      firstPacketNumber: null,
      lastPacketNumber: null,
    };
    jest.clearAllMocks();
  });

  it("requests MTU and sets up data subscription", async () => {
    startDataStreaming(
      mockDevice,
      dataSubscription,
      isRecordingRef,
      setIsDataStreaming,
      packetStats
    );

    // Wait for async MTU request to resolve
    await Promise.resolve();

    expect(mockDevice.requestMTU).toHaveBeenCalledWith(512);
    expect(mockDevice.monitorCharacteristicForService).toHaveBeenCalled();
    expect(dataSubscription.current).not.toBeNull();
  });

  it("handles MTU negotiation errors", async () => {
    (mockDevice.requestMTU as jest.Mock).mockRejectedValueOnce(
      new Error("MTU error")
    );
    // startDataStreaming(
    //   mockDevice,
    //   dataSubscription,
    //   isRecordingRef,
    //   setIsDataStreaming,
    //   packetStats
    // );
    // await Promise.resolve();
    // expect(handleError).toHaveBeenCalledWith(
    //   expect.any(Error),
    //   "MTU negotiation failed"
    // );
    await new Promise((resolve) => {
      startDataStreaming(
        mockDevice,
        dataSubscription,
        isRecordingRef,
        setIsDataStreaming,
        packetStats
      );
      setImmediate(resolve); // Ensures any asynchronous tasks are processed
    });

    expect(handleError).toHaveBeenCalledWith(
      expect.any(Error),
      "MTU negotiation failed"
    );
  });
});

describe("onDataUpdate callback", () => {
  let dataSubscription: { current: Subscription | null };
  let setIsDataStreaming: jest.Mock;
  let isRecordingRef: { current: boolean };
  let packetStats: any;
  let callback: ReturnType<typeof onDataUpdate>;

  beforeEach(() => {
    dataSubscription = {
      current: { remove: jest.fn() } as unknown as Subscription,
    };
    setIsDataStreaming = jest.fn();
    isRecordingRef = { current: false };
    packetStats = {
      receivedPacketNumbers: new Set(),
      duplicatedPackets: 0,
      firstPacketNumber: null,
      lastPacketNumber: null,
    };

    callback = onDataUpdate(
      dataSubscription,
      setIsDataStreaming,
      isRecordingRef,
      packetStats
    );
    jest.clearAllMocks();
  });

  it("handles device disconnect error", () => {
    // const error = new BleError(
    //   "Device disconnected",
    //   BleErrorCode.DeviceDisconnected
    // );
    const error = {
      errorCode: BleErrorCode.DeviceDisconnected,
      message: "Device disconnected",
    } as BleError;

    callback(error, null);
    expect(dataSubscription.current).toBeNull();
    expect(setIsDataStreaming).toHaveBeenCalledWith(false);
  });

  it("processes received data and adds to buffer if recording", () => {
    isRecordingRef.current = true;
    // Simulate a characteristic with a base64 value
    callback(null, { value: "someBase64Data" } as any);

    // Since we mocked base64.decode to "decodedData", which is string
    // We'll need to ensure packet markers. Let's mock decode for correct packet
    (base64.decode as jest.Mock).mockReturnValueOnce(
      // 509 bytes packet with correct start/end markers
      String.fromCharCode(83, 83, ...Array(503).fill(0), 69, 69)
    );

    callback(null, { value: "someBase64Data" } as any);
    expect(addToDataBuffer).toHaveBeenCalledWith(expect.any(Array));
  });

  it("logs warning if invalid packet markers", () => {
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});
    (base64.decode as jest.Mock).mockReturnValueOnce("invalidPacket");
    callback(null, { value: "someBase64Data" } as any);
    expect(consoleWarnSpy).toHaveBeenCalledWith("Invalid packet markers.");
    consoleWarnSpy.mockRestore();
  });

  it("handles general errors gracefully", () => {
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});
    (base64.decode as jest.Mock).mockImplementation(() => {
      throw new Error("Decode error");
    });
    callback(null, { value: "someBase64Data" } as any);
    expect(handleError).toHaveBeenCalledWith(
      expect.any(Error),
      "Error receiving data"
    );
    consoleLogSpy.mockRestore();
  });
});
