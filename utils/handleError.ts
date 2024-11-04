import { BleError } from "react-native-ble-plx";
import Toast from "react-native-toast-message";

export const handleError = (
  error: unknown,
  context: string = "An error occurred"
) => {
  if (error instanceof BleError) {
    Toast.show({
      type: "error",
      text1: `${context} - BLE Error`,
      text2: `${error.errorCode}: ${error.message}`,
      position: "bottom",
    });
  } else if (error instanceof Error) {
    Toast.show({
      type: "error",
      text1: `${context} - Error`,
      text2: error.message,
      position: "bottom",
    });
  } else {
    Toast.show({
      type: "error",
      text1: `${context} - Unknown Error`,
      text2: "An unexpected error occurred.",
      position: "bottom",
    });
  }
};
