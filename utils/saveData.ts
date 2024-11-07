import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import Toast from "react-native-toast-message";
import { handleError } from "@/utils/handleError";

export const saveDataToFile = async (dataBuffer: number[]) => {
  try {
    const uint8Array = new Uint8Array(dataBuffer);
    const base64Data = Buffer.from(uint8Array).toString("base64");

    const folderUri = await createFolder();
    const fileUri = folderUri + `streamingData_${Date.now()}.bin`;
    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("File Info:", await FileSystem.getInfoAsync(fileUri));

    Toast.show({
      type: "success",
      text1: "Data Saved Successfully",
      text2: `File saved at: ${fileUri}`,
      position: "top",
    });

    console.log("Data saved successfully");
  } catch (error) {
    handleError(error, "Error saving data to file");
  }
};
const createFolder = async () => {
  const folderUri = FileSystem.documentDirectory + "userData/";
  const folderInfo = await FileSystem.getInfoAsync(folderUri);

  if (!folderInfo.exists) {
    await FileSystem.makeDirectoryAsync(folderUri, { intermediates: true });
    console.log("Folder created at:", folderUri);
  } else {
    console.log("Folder already exists at:", folderUri);
  }

  return folderUri;
};
