import React, { useState, useEffect } from "react";
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
  const [files, setFiles] = useState<string[]>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const folderUri = FileSystem.documentDirectory + "userData/";
        const fileList = await FileSystem.readDirectoryAsync(folderUri);
        setFiles(fileList);
      } catch (error) {
        handleError(error);
      } finally {
        setRefresh(false);
      }
    };
    fetchFiles();
  }, [refresh]);

  const renderItem = ({ item }: { item: string }) => {
    const fileUri = FileSystem.documentDirectory + "userData/" + item;
    return (
      <View className="mt-4 py-3 px-3 gap-x-1 rounded-lg flex flex-row justify-between bg-gray-300">
        <Text
          className="text-lg flex-shrink"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item}
        </Text>
        <View className="flex flex-row justify-center items-center gap-x-3">
          <TouchableOpacity onPress={() => shareFile(fileUri)}>
            <AntDesign name="sharealt" size={28} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteFile(fileUri)}>
            <AntDesign name="delete" size={28} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const deleteFile = async (fileUri: string) => {
    try {
      await FileSystem.deleteAsync(fileUri);
      console.log("File deleted successfully");
      setFiles((prevfiles) => prevfiles.filter((file) => file !== fileUri));
      setRefresh(true);
    } catch (error) {
      handleError(error, "Error deleting file");
      console.error("Error deleting file", error);
    }
  };
  return (
    <SafeAreaView>
      <View className="py-4 first-letter:flex flex-row justify-center items-center gap-x-2 bg-primary-color">
        <Text className="text-lg text-center text-light-text-color ">
          Saved Files
        </Text>
        <TouchableOpacity className=" " onPress={() => setRefresh(true)}>
          <Feather name="refresh-ccw" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View className="mt-4 mx-3">
        {refresh ? (
          <View>
            <Text className="text-center text-xl"> Loading...</Text>
          </View>
        ) : (
          <FlatList
            data={files}
            renderItem={renderItem}
            keyExtractor={(item) => item}
            ListEmptyComponent={() => <Text>No files saved</Text>}
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
