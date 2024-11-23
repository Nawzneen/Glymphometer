import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import CheckBox from "@react-native-community/checkbox";

const files = [
  {
    id: 1,
    name: "File_1",
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
// Define the types for the props
interface FileItem {
  id: number;
  name: string;
  format: string;
  uri: any; // You can specify a more detailed type for uri if needed (e.g., string or require)
}

interface FileListProps {
  selectedFiles: number[]; // Array of selected file IDs
  toggleFileSelection: (fileId: number) => void; // Function to toggle file selection
}
export default function FileList({
  selectedFiles,
  toggleFileSelection,
}: FileListProps) {
  return (
    <FlatList
      data={files}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.fileItem}>
          <CheckBox
            value={selectedFiles.includes(item.id)}
            onValueChange={() => toggleFileSelection(item.id)}
            tintColors={{ true: "#007AFF", false: "#D3D3D3" }}
          />
          <Text style={styles.fileName}>{item.name}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#F5F5F5",
  },
  fileName: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
});
