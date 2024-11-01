import { PermissionsAndroid, Platform } from "react-native";
import * as ExpoDevice from "expo-device";

//Requesting Android-specific Location Permission (Android 12 and later require additional permissions)
const requestAndroid31Permissions = async () => {
  const bluetoothScanPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    {
      title: "Bluetooth Scan Permission",
      message: "This app needs to scan for bluetooth devices.",
      // buttonNeutral: "Ask Me Later",
      // buttonNegative: "Cancel",
      buttonPositive: "OK",
    }
  );
  const bluetoothConnectPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    {
      title: "Bluetooth Connect Permission",
      message: "This app needs to connect to bluetooth devices.",
      // buttonNeutral: "Ask Me Later",
      // buttonNegative: "Cancel",
      buttonPositive: "OK",
    }
  );
  const fineLocationPermission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: "Location Permission",
      message: "This app needs access to your location",
      // buttonNeutral: "Ask Me Later",
      // buttonNegative: "Cancel",
      buttonPositive: "OK",
    }
  );
  return (
    bluetoothScanPermission === "granted" &&
    bluetoothConnectPermission === "granted" &&
    fineLocationPermission === "granted"
  );
};

//Request necessary permissions for both android and IOS
const requestPermissions = async () => {
  if (Platform.OS === "android") {
    if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
      // For android versions less than 12
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location",
          // buttonNeutral: "Ask Me Later",
          // buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // For Android 12 and later, request additional permissions
      const isAndroid31PermissionsGranted = await requestAndroid31Permissions();
      return isAndroid31PermissionsGranted;
    }
  } else {
    return true; // For IOS, no additional permissions are required
  }
};
export { requestPermissions };
