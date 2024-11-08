import { PermissionsAndroid, Platform, Linking, Alert } from "react-native";

import * as ExpoDevice from "expo-device";

// Function to open app settings
const openAppSettings = () => {
  Linking.openSettings();
};

// Requesting Android-specific Location Permission (Android 12 and later require additional permissions)
const requestAndroid31Permissions = async () => {
  const permissions = [
    {
      permission: PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      name: "Bluetooth Scan",
    },
    {
      permission: PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      name: "Bluetooth Connect",
    },
    {
      permission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      name: "Location",
    },
  ];

  let allPermissionsGranted = true;

  for (const perm of permissions) {
    const hasPermission = await PermissionsAndroid.check(perm.permission);

    if (!hasPermission) {
      const status = await PermissionsAndroid.request(perm.permission, {
        title: `${perm.name} Permission`,
        message: `This app needs ${perm.name.toLowerCase()} permission.`,
        buttonPositive: "OK",
      });

      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        // Permission granted
        continue;
      } else if (status === PermissionsAndroid.RESULTS.DENIED) {
        // Permission denied but not permanently
        allPermissionsGranted = false;
        Alert.alert(
          `${perm.name} Permission Required`,
          `${perm.name} permission is required to use this feature.`,
          [
            {
              text: "OK",
              onPress: () => {},
            },
          ],
          { cancelable: false }
        );
      } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        // Permission denied permanently
        allPermissionsGranted = false;
        Alert.alert(
          `${perm.name} Permission Required`,
          `Please enable ${perm.name.toLowerCase()} permission in app settings to proceed.`,
          [
            {
              text: "Open Settings",
              onPress: () => openAppSettings(),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ],
          { cancelable: false }
        );
        break;
      }
    }
  }

  return allPermissionsGranted;
};

// Request necessary permissions for both Android and iOS
const requestPermissions = async () => {
  console.log("asking for permissions");
  if (Platform.OS === "android") {
    if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
      // For Android versions less than 12
      const status = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (status) {
        return true;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "This app needs access to your location",
            buttonPositive: "OK",
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          Alert.alert(
            "Location Permission Required",
            "Location permission is required to scan for devices.",
            [
              {
                text: "OK",
                onPress: () => {},
              },
            ],
            { cancelable: false }
          );
          return false;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            "Location Permission Required",
            "Please enable location permission in app settings to scan for devices.",
            [
              {
                text: "Open Settings",
                onPress: () => openAppSettings(),
              },
              {
                text: "Cancel",
                style: "cancel",
              },
            ],
            { cancelable: false }
          );
          return false;
        }
      }
    } else {
      // For Android 12 and later, request additional permissions
      const isAndroid31PermissionsGranted = await requestAndroid31Permissions();
      return isAndroid31PermissionsGranted;
    }
  } else {
    return true; // For iOS, no additional permissions are required
  }
};

export { requestPermissions };
