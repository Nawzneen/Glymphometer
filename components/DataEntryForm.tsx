import React, { Dispatch, SetStateAction } from "react";
import { View, Text, TextInput } from "react-native";
import CustomButton from "@/components/CustomButton";

interface DatasetDetails {
  created: string;
  country: string;
  description: string;
}

interface DataEntryFormProps {
  datasetDetails: DatasetDetails;
  onDatasetChange: (field: keyof DatasetDetails, value: string) => void;
  handleUploadFiles: () => void;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export default function DataEntryForm({
  datasetDetails,
  onDatasetChange,
  handleUploadFiles,
  isLoading,
  setIsLoading,
}: DataEntryFormProps) {
  return (
    <View className="mt-8 mx-auto w-[90%]">
      <Text className="text-xl mb-8">Please fill the information below:</Text>
      <Text className="text-base">Country (required):</Text>
      <TextInput
        className="p-3 my-3 border border-gray-300 rounded-md "
        value={datasetDetails.country}
        onChangeText={(value) => onDatasetChange("country", value)}
        placeholder="Enter country..."
      />
      <Text className="text-base">Description:</Text>
      <TextInput
        className="p-3 my-3 border border-gray-300 rounded-md "
        value={datasetDetails.description}
        onChangeText={(value) => onDatasetChange("description", value)}
        placeholder="Enter description..."
      />
      <View className="mt-2">
        <CustomButton
          title={isLoading ? "Uploading..." : "Upload"}
          onPress={() => {
            handleUploadFiles();
          }}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
