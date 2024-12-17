import React, { useState, useEffect, useCallback, useContext } from "react";
import { useFocusEffect } from "@react-navigation/native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { handleError } from "@/utils/handleError";
import { postProcessData } from "@/utils/postProcessData";
import { Alert } from "react-native";
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { createFolder } from "@/utils/saveData";
import AntDesign from "@expo/vector-icons/AntDesign";
import Toast from "react-native-toast-message";
import FileInfoModal from "@/components/modals/FileInfoModal";
import LoginModal from "@/components/modals/LoginModal";
import { FileInfoType } from "@/types/globalTypes";
import CustomButton from "@/components/CustomButton";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthContext } from "@/contexts/AuthContext";
import FileUpload from "@/components/FileUpload";
import UploadModal from "@/components/modals/UploadModal";
import CheckBox from "@react-native-community/checkbox";
import { saveManually } from "@/utils/saveManually";

interface FileType {
  name: string;
  uri: string;
  modificationTime?: number;
  size: number;
}
const SavedFiles = () => {
  const [files, setFiles] = useState<Array<FileType>>([]);
  const [refresh, setRefresh] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isLoginModalVisible, setIsLoginModalVisible] =
    useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<FileInfoType | null | undefined>(
    null
  );
  const [isFileInfoLoading, setIsFileInfoLoading] = useState<boolean>(false);
  const { token, signOut } = useContext(AuthContext);
  const [isUploadModalVisible, setIsUploadModalVisible] =
    useState<boolean>(false);
  const [selectedFiles, setSelectedFiles] = useState<object[]>([]);

  useEffect(() => {
    console.log("Token in SavedFiles:", token);
    // Perform any actions when token changes (e.g., fetch files)
  }, [token]);
  const fetchFiles = useCallback(async () => {
    try {
      await createFolder(); // if the folder already exist, it will continue to other parts of the code
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
              format: fileName.split(".").pop(),
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
  // if its a new user, create the folder else it will throw an error

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

  const handleFileInfo = async (fileUri: string) => {
    setIsModalVisible(true);
    setIsFileInfoLoading(true);
    try {
      const info = await postProcessData(fileUri);
      setFileInfo(info);
    } catch (error) {
      console.error("Error processing file info", error);
      handleError(error, "Error processing file info");
    } finally {
      setIsFileInfoLoading(false);
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
      format?: string;
    };
  }) => {
    const fileUri = item.uri;
    const formattedDate = formatDate(item.modificationTime);
    const formattedSize = formatFileSize(item.size);

    return (
      <View className="mb-4 py-3 px-3 gap-x-1 rounded-lg flex flex-col justify-between bg-gray-200">
        <View className="flex flex-row justify-between items-center">
          <View className="flex flex-row  items-center">
            <CheckBox
              value={selectedFiles.includes(item)}
              onValueChange={() => toggleFileSelection(item)}
              // tintColors={{ true: "#007AFF", false: "#D3D3D3" }}
            />
            <Text
              className="text-lg flex-shrink"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
          </View>

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
              <AntDesign name="sharealt" size={26} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(fileUri)}>
              <AntDesign name="delete" size={26} color="black" />
            </TouchableOpacity>
            {item.format === "bin" && (
              <TouchableOpacity onPress={() => handleFileInfo(fileUri)}>
                <AntDesign name="infocirlceo" size={26} color="black" />
              </TouchableOpacity>
            )}
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
    } finally {
      setRefresh(false);
    }
  };
  const confirmDelete = (fileUri: string) => {
    Alert.alert(
      "Delete File",
      "Are you sure you want to delete this file?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteFile(fileUri),
        },
      ],
      {
        cancelable: true,
      }
    );
  };
  const toggleFileSelection = (file: FileType) => {
    setSelectedFiles((prev) =>
      prev.includes(file) ? prev.filter((f) => f !== file) : [...prev, file]
    );
  };
  return (
    <SafeAreaView className="flex-1">
      <View className="py-4 flex flex-row justify-center items-center gap-x-2 bg-primary-color">
        <Text className="text-lg text-center text-light-text-color ">
          Saved Files
        </Text>
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
      <View
        className=" p-3"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        {token ? (
          <View className="mt-2">
            <CustomButton
              title="Upload Files"
              disabled={selectedFiles.length === 0}
              onPress={() => setIsUploadModalVisible(true)}
            />
          </View>
        ) : (
          <View className="mt-2 mx-auto">
            <Text> If you want to upload the files, please Sign In.</Text>
          </View>
        )}
        {/* <View className="mt-2">
        <CustomButton title="save manually" onPress={() => saveManually()} />
        </View> */}
        <View className="mt-2">
          {token ? (
            <CustomButton
              title="Sign Out"
              onPress={() => {
                signOut();
              }}
            />
          ) : (
            <CustomButton
              title="Sign In / Sign Up"
              onPress={() => {
                setIsLoginModalVisible(true);
              }}
            />
          )}
        </View>
      </View>
      <Toast />
      <FileInfoModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        info={fileInfo}
        isFileInfoLoading={isFileInfoLoading}
      />
      <LoginModal
        isModalVisible={isLoginModalVisible}
        setIsModalVisible={setIsLoginModalVisible}
      />
      <UploadModal
        isModalVisible={isUploadModalVisible}
        setIsModalVisible={setIsUploadModalVisible}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
      />
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
