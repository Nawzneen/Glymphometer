import { requestPermissions } from "@/utils/requestPermissions";
import { Platform, PermissionsAndroid, Alert, Linking } from "react-native";
import * as ExpoDevice from "expo-device";

jest.mock("react-native", () => ({
  Platform: { OS: "android" },
  PermissionsAndroid: {
    check: jest.fn(),
    request: jest.fn(),
    PERMISSIONS: {
      ACCESS_FINE_LOCATION: "android.permission.ACCESS_FINE_LOCATION",
      BLUETOOTH_SCAN: "android.permission.BLUETOOTH_SCAN",
      BLUETOOTH_CONNECT: "android.permission.BLUETOOTH_CONNECT",
    },
    RESULTS: {
      GRANTED: "granted",
      DENIED: "denied",
      NEVER_ASK_AGAIN: "never_ask_again",
    },
  },
  Alert: { alert: jest.fn() },
  Linking: { openSettings: jest.fn() },
}));

jest.mock("expo-device", () => ({
  platformApiLevel: 30, // default mock
}));

describe("requestPermissions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true for iOS immediately", async () => {
    (Platform as any).OS = "ios";
    const result = await requestPermissions();
    expect(result).toBe(true);
  });

  it("checks Android < 31 location permission granted", async () => {
    (Platform as any).OS = "android";
    (ExpoDevice as any).platformApiLevel = 30;
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);

    const result = await requestPermissions();
    expect(PermissionsAndroid.check).toHaveBeenCalledWith(
      "android.permission.ACCESS_FINE_LOCATION"
    );
    expect(result).toBe(true);
  });

  it("requests permission if not granted on Android < 31 and user grants", async () => {
    (Platform as any).OS = "android";
    (ExpoDevice as any).platformApiLevel = 30;
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue("granted");

    const result = await requestPermissions();
    expect(PermissionsAndroid.request).toHaveBeenCalledWith(
      "android.permission.ACCESS_FINE_LOCATION",
      expect.any(Object)
    );
    expect(result).toBe(true);
  });

  it("alerts user if permission denied on Android < 31", async () => {
    (Platform as any).OS = "android";
    (ExpoDevice as any).platformApiLevel = 30;
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue("denied");

    const result = await requestPermissions();
    expect(Alert.alert).toHaveBeenCalledWith(
      "Location Permission Required",
      "Location permission is required to scan for devices.",
      expect.any(Array),
      { cancelable: false }
    );
    expect(result).toBe(false);
  });

  it("opens settings if permission never ask again on Android < 31", async () => {
    (Platform as any).OS = "android";
    (ExpoDevice as any).platformApiLevel = 30;
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
      "never_ask_again"
    );

    const result = await requestPermissions();
    expect(Alert.alert).toHaveBeenCalledWith(
      "Location Permission Required",
      "Please enable location permission in app settings to scan for devices.",
      expect.any(Array),
      { cancelable: false }
    );
    expect(Linking.openSettings).not.toHaveBeenCalled(); // The user must press "Open Settings" in alert to trigger openSettings
    expect(result).toBe(false);
  });

  it("requests Android 31+ permissions and returns true if all granted", async () => {
    (Platform as any).OS = "android";
    (ExpoDevice as any).platformApiLevel = 31;
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);

    const result = await requestPermissions();
    // Since all checks return true, no request calls needed
    expect(result).toBe(true);
  });

  it("requests Android 31+ permissions and alerts if denied", async () => {
    (Platform as any).OS = "android";
    (ExpoDevice as any).platformApiLevel = 31;
    // First permission returns false, triggers request and user denies
    (PermissionsAndroid.check as jest.Mock).mockResolvedValueOnce(false);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValueOnce("denied");

    const result = await requestPermissions();
    expect(Alert.alert).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it("requests Android 31+ permissions and alerts if never ask again", async () => {
    (Platform as any).OS = "android";
    (ExpoDevice as any).platformApiLevel = 31;
    (PermissionsAndroid.check as jest.Mock).mockResolvedValueOnce(false);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValueOnce(
      "never_ask_again"
    );

    const result = await requestPermissions();
    expect(Alert.alert).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
