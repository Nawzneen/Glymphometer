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
  const [isLoading, setIsLoading] = useState(false);

  const handleDiscard = () => {
    setIsModalVisible(false); // Close the modal
    setIsLoading(false); // Reset the loading state
    // Reset the dataset details
    setDatasetDetails({
      created: new Date().toISOString(),
      country: "",
      description: "",
    });
  };
  const handleUploadFiles = async () => {
    if (!datasetDetails.country.trim()) {
      Alert.alert("Error", "Country is a required field.");
      return;
    }
    if (token === null) {
      Alert.alert("Error", "Please log in to upload files.");
      return;
    }
    setIsLoading(true);

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

        const metadataResponseArray = await uploadFileMetadata(fileData, token);
        const metadataResponse = metadataResponseArray[0];
        metadataResponses.push({
          uri: file.uri,
          metadataResponse,
        });
      }

      for (const { uri, metadataResponse } of metadataResponses) {
        const fileId = metadataResponse.id;
        await uploadFileContent(uri, fileId, token);
      }
      Alert.alert("Success", "Data uploaded successfully.");
      setSelectedFiles([]);
      // Reset the dataset details
      setDatasetDetails({
        created: new Date().toISOString(),
        country: "",
        description: "",
      });
      setIsModalVisible(false);
    } catch (error: any) {
      // console.error("Error occurred during file upload:", error);
      const message = error?.message || "An unknown error occurred.";
      Alert.alert("Error Uploading Files", message);
    } finally {
      setIsLoading(false);
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
              setIsLoading={setIsLoading}
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
