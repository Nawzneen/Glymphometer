import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import Toast from "react-native-toast-message";
import { handleError } from "@/utils/handleError";
import convertData from "@/utils/dataConverter";

// Function to sanitize the file name
const sanitizeFilename = (fileName: string): string => {
  return fileName.replace(/[^a-z0-9_\-]/gi, "_"); //invalid characters will be replaced by underscores
};
export const saveDataToFile = async (
  dataBuffer: number[],
  fileName: string
) => {
  try {
    const date = formatDate();
    // console.log(formatDate());
    const uint8Array = new Uint8Array(dataBuffer);
    const base64Data = Buffer.from(uint8Array).toString("base64");
    const folderUri = await createFolder();
    const sanitizedFileName = sanitizeFilename(fileName);
    const binFileUri = folderUri + `${sanitizedFileName}_${date}.bin`;

    await FileSystem.writeAsStringAsync(binFileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { outputText } = convertData(uint8Array);
    const txtFileUri = folderUri + `${sanitizedFileName}_${date}.txt`;
    await FileSystem.writeAsStringAsync(txtFileUri, outputText, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    Toast.show({
      type: "success",
      text1: "Data Saved Successfully",
      text2: `File saved.`,
      position: "top",
    });

    console.log("Data saved successfully");
  } catch (error) {
    handleError(error, "Error saving data to file");
  }
};
export const createFolder = async () => {
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

function formatDate() {
  const date = new Date(Date.now()); // Convert from seconds to milliseconds

  // Extract date and time components
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const formattedDate = `${day}.${month}.${year}.${hours}.${minutes}.${seconds}`;
  return formattedDate;
}
