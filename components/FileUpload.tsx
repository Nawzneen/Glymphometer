import React, { useState } from "react";
import { View, Button, Alert, StyleSheet, Text } from "react-native";
import FileList from "./FileList";
import DataEntryForm from "./DataEntryForm";
import {
  uploadDataset,
  uploadFileMetadata,
  uploadFileContent,
} from "../app/(tabs)/services/apiService";
import { SafeAreaView } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";

const files = [
  {
    id: 1,
    name: "File_1.txt",
    format: "txt",
    uri: require("../assets/textFiles/File_1.txt"),
  },
  {
    id: 2,
    name: "File_2.txt",
    format: "txt",
    uri: require("../assets/textFiles/File_2.txt"),
  },
  {
    id: 3,
    name: "File_3.txt",
    format: "txt",
    uri: require("../assets/textFiles/File_3.txt"),
  },
  {
    id: 4,
    name: "File_4.txt",
    format: "txt",
    uri: require("../assets/textFiles/File_4.txt"),
  },
];
// Define the prop types for the FileUploadScreen component
interface FileUploadScreenProps {
  token: string; // The token should be a string
}
export default function FileUploadScreen({ token }: FileUploadScreenProps) {
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [datasetDetails, setDatasetDetails] = useState({
    created: new Date().toISOString(),
    country: "",
    description: "",
  });

  const toggleFileSelection = (fileId: number) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleUpload = async () => {
    if (!datasetDetails.country.trim()) {
      Alert.alert("Error", "Country is a required field.");
      return;
    }

    try {
      const datasetResponse = await uploadDataset(datasetDetails, token); // calling function in apiService.js
      const datasetId = datasetResponse.id;

      const selectedFileDetails = files.filter((file) =>
        selectedFiles.includes(file.id)
      );
      const metadataResponses = [];

      for (const file of selectedFileDetails) {
        const fileData = {
          name: file.name,
          format: file.format,
          datasetId,
        };

        // Resolve the URI using Asset
        const asset = Asset.fromModule(file.uri); // `file.uri` is the require() statement
        await asset.downloadAsync(); // Ensure the file is available locally
        const localUri = asset.localUri || asset.uri;

        const metadataResponseArray = await uploadFileMetadata(fileData, token);
        console.log(
          "Metadata response array for file:",
          file.name,
          metadataResponseArray
        );

        const metadataResponse = metadataResponseArray[0];
        metadataResponses.push({
          uri: localUri, // Use the resolved local URI
          metadataResponse,
        });
      }

      for (const { uri, metadataResponse } of metadataResponses) {
        //console.log("Resolved URI:", uri);
        const fileId = metadataResponse.id;
        //console.log(`Uploading file content for ID: ${fileId}`);
        await uploadFileContent(uri, fileId, token);
      }
      Alert.alert("Success", "Files and data uploaded successfully.");
    } catch (error) {
      Alert.alert("Error");
      console.error(error);
    }
  };

  return (
    <SafeAreaView>
      <FileList
        selectedFiles={selectedFiles}
        toggleFileSelection={toggleFileSelection}
      />
      <DataEntryForm
        datasetDetails={datasetDetails}
        onDatasetChange={(field, value) =>
          setDatasetDetails({ ...datasetDetails, [field]: value })
        }
      />

      <Button title="Upload Files and Data" onPress={handleUpload} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
});
