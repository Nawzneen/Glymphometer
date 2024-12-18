import { DATA_SERVICE_UUID, RX_CHARACTERISTIC_UUID } from "./bleConstants";
import { Device, Subscription } from "react-native-ble-plx";
import base64 from "react-native-base64";

export const adjustLEDLevel = async (
  value: string = "3",
  connectedDevice: Device
) => {
  // Default value of the LED light is 3

  if (!/^[0-9]$/.test(value)) {
    throw new Error(
      "Invalid value for LED level. Only numbers 0-9 are allowed"
    );
  }

  // Encode the value string to base64
  const base64Command = base64.encode(value);

  try {
    // Send the command to adjust the LED level
    await connectedDevice.writeCharacteristicWithResponseForService(
      DATA_SERVICE_UUID,
      RX_CHARACTERISTIC_UUID,
      base64Command
    );
  } catch (error) {
    console.log("Error adjusting LED level:", error);
  }
};
