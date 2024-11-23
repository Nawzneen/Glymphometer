import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

// Define the types for datasetDetails and onDatasetChange
interface DatasetDetails {
  created: string;
  country: string;
  description: string;
}

interface DataEntryFormProps {
  datasetDetails: DatasetDetails;
  onDatasetChange: (field: keyof DatasetDetails, value: string) => void;
}

export default function DataEntryForm({
  datasetDetails,
  onDatasetChange,
}: DataEntryFormProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Country (required):</Text>
      <TextInput
        style={styles.input}
        value={datasetDetails.country}
        onChangeText={(value) => onDatasetChange("country", value)}
        placeholder="Enter country"
      />
      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={styles.input}
        value={datasetDetails.description}
        onChangeText={(value) => onDatasetChange("description", value)}
        placeholder="Enter description"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
});
