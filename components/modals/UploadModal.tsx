import React, { useState, useContext, Dispatch, SetStateAction } from "react";

import { Modal, Alert, TouchableOpacity, SafeAreaView } from "react-native";
import DataEntryForm from "@/components/DataEntryForm";
import { AuthContext } from "@/contexts/AuthContext";
import {
  uploadDataset,
  uploadFileMetadata,
  uploadFileContent,
} from "@/services/apiService";
interface UploadModalProps {
  isModalVisible: boolean;
  selectedFiles: any[];
  setSelectedFiles: Dispatch<SetStateAction<object[]>>;
  setIsModalVisible: (isVisible: boolean) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isModalVisible,
  setIsModalVisible,
  selectedFiles,
  setSelectedFiles,
}) => {
  const { token } = useContext(AuthContext);
  const [datasetDetails, setDatasetDetails] = useState({
    created: new Date().toISOString(),
    country: "",
    description: "",
  });
  const [isLoading, setIsloading] = useState(false);

  const handleDiscard = () => {
    setIsModalVisible(false); // Close the modal
    // Reset the dataset details
    setDatasetDetails({
      created: new Date().toISOString(),
      country: "",
      description: "",
    });
  };
  const handleUploadFiles = async () => {
    setIsloading(true);
    if (!datasetDetails.country.trim()) {
      Alert.alert("Error", "Country is a required field.");
      return;
    }
    if (token === null) {
      Alert.alert("Error", "Please log in to upload files.");
      return;
    }

    try {
      const datasetResponse = await uploadDataset(datasetDetails, token); // calling function in apiService.js
      const datasetId = datasetResponse.id;
      const metadataResponses = [];

      for (const file of selectedFiles) {
        const fileData = {
          name: file.name,
          format: file.format || "txt",
          datasetId,
        };
        // const localUri = file.uri;
        // // Resolve the URI using Asset
        // const asset = Asset.fromModule(file.uri); // `file.uri` is the require() statement
        // await asset.downloadAsync(); // Ensure the file is available locally
        // const localUri = asset.localUri || asset.uri;

        const metadataResponseArray = await uploadFileMetadata(fileData, token);
        console.log(
          "Metadata response array for file:",
          file.name,
          metadataResponseArray
        );

        const metadataResponse = metadataResponseArray[0];
        console.log(
          "metadataResponseeeeeeeeeeeeeeeeeeeeeeee",
          metadataResponse
        );
        metadataResponses.push({
          uri: file.uri,
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
      setSelectedFiles([]);
      // Reset the dataset details
      setDatasetDetails({
        created: new Date().toISOString(),
        country: "",
        description: "",
      });
    } catch (error: any) {
      console.error(error);

      // Extract error details
      let status = "Unknown";
      let message = "An error occurred";

      if (error.response) {
        status = error.response.status || status;
        message = error.response.data?.message || error.message || message;
      } else if (error.message) {
        const match = error.message.match(/Status: (\d+)\s-\s(.+)/);
        if (match) {
          status = match[1];
          message = match[2];
        } else {
          message = error.message;
        }
      }
      Alert.alert(
        "Error Uploading Files",
        `Status: ${status}\nMessage: ${message}`
      );
      console.error(error);
    } finally {
      setIsModalVisible(false);
      setIsloading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={handleDiscard}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDiscard}
        className="flex-1 bg-black/90 justify-center items-center"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="w-[90%] h-[400px] bg-white rounded-lg overflow-hidden"
        >
          <SafeAreaView className="flex-1 bg-[#ffffff]">
            <DataEntryForm
              datasetDetails={datasetDetails}
              isLoading={isLoading}
              setIsloading={setIsloading}
              onDatasetChange={(field, value) =>
                setDatasetDetails({ ...datasetDetails, [field]: value })
              }
              handleUploadFiles={handleUploadFiles}
            />
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default UploadModal;
