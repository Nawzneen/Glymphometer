import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { handleError } from "@/utils/handleError";
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import Toast from "react-native-toast-message";

const SavedFiles = () => {
  const [files, setFiles] = useState<
    Array<{
      name: string;
      uri: string;
      modificationTime?: number;
      size: number;
    }>
  >([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const fetchFiles = useCallback(async () => {
    try {
      const folderUri = FileSystem.documentDirectory + "userData/";
      const fileList = await FileSystem.readDirectoryAsync(folderUri);
      const filesWithInfo = await Promise.all(
        fileList.map(async (fileName) => {
          const fileUri = folderUri + fileName;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          if (fileInfo.exists) {
            return {
              name: fileName,
              uri: fileUri,
              modificationTime: fileInfo.modificationTime,
              size: fileInfo.size,
            };
          } else {
            // Skip files that do not exist
            return null;
          }
        })
      );
      // Filter out null values
      const validFiles = filesWithInfo
        .filter((file): file is NonNullable<typeof file> => file !== null)
        .sort((a, b) => (b.modificationTime || 0) - (a.modificationTime || 0));
      setFiles(validFiles);
    } catch (error) {
      console.log("Error fetching files", error);
      handleError(error);
    } finally {
      setRefresh(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      fetchFiles(); // Refresh the file list whenever the screen is focused
    }, [fetchFiles])
  );

  const formatDate = (timestamp?: number) => {
    if (!timestamp) {
      return "Unknown date";
    }
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-indexed
    const year = date.getFullYear();
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`; // Less than 1 KB
    } else if (bytes < 1024 * 1024) {
      const kb = bytes / 1024;
      return `${kb.toFixed(2)} KB`; // Less than 1 MB, show in KB
    } else {
      const mb = bytes / (1024 * 1024);
      return `${mb.toFixed(2)} MB`; // 1 MB or more, show in MB
    }
  };
  const renderItem = ({
    item,
  }: {
    item: {
      name: string;
      uri: string;
      modificationTime?: number;
      size: number;
    };
  }) => {
    const fileUri = item.uri;
    const formattedDate = formatDate(item.modificationTime);
    const formattedSize = formatFileSize(item.size);

    return (
      <View className="mb-4 py-3 px-3 gap-x-1 rounded-lg flex flex-col justify-between bg-gray-200">
        <View className="flex flex-row justify-between items-center">
          <Text
            className="text-lg flex-shrink"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
          <Text>{formattedSize}</Text>
        </View>
        <View className="flex flex-row justify-between items-center mt-1">
          <View>
            <Text className="text-sm">{formattedDate}</Text>
          </View>
          <View
            className="
            flex
            flex-row
            justify-center
            items-center
            gap-x-3"
          >
            <TouchableOpacity onPress={() => shareFile(fileUri)}>
              <AntDesign name="sharealt" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteFile(fileUri)}>
              <AntDesign name="delete" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const deleteFile = async (fileUri: string) => {
    try {
      await FileSystem.deleteAsync(fileUri);
      console.log("File deleted successfully");
      setFiles((prevFiles) => prevFiles.filter((file) => file.uri !== fileUri));
      setRefresh(true);
    } catch (error) {
      handleError(error, "Error deleting file");
      console.error("Error deleting file", error);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="py-4 flex flex-row justify-center items-center gap-x-2 bg-primary-color">
        <Text className="text-lg text-center text-light-text-color ">
          Saved Files
        </Text>
        {/* <TouchableOpacity onPress={() => setRefresh(true)}>
          <Feather name="refresh-ccw" size={24} color="white" />
        </TouchableOpacity> */}
      </View>
      <View className="mt-4 mx-3 flex-1 ">
        {refresh ? (
          <View>
            <Text className="text-center text-xl"> Loading...</Text>
          </View>
        ) : (
          <FlatList
            className=""
            data={files}
            renderItem={renderItem}
            keyExtractor={(item) => item.uri}
            ListEmptyComponent={() => <Text>No files saved</Text>}
            refreshing={refresh}
            onRefresh={fetchFiles}
          />
        )}
      </View>
      <Toast />
    </SafeAreaView>
  );
};

export default SavedFiles;

const shareFile = async (fileUri: string) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri);
      console.log("File shared successfully");
    } else {
      Toast.show({
        type: "error",
        text1: "Sharing Not Available",
        text2: "Sharing is not available on this device.",
        position: "top",
      });
    }
  } catch (error) {
    console.error("Error sharing file", error);
    handleError(error, "Error sharing file");
  }
};
