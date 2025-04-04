import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from "react-native";
import CustomButton from "@/components/CustomButton";
import { Keyboard } from "react-native";
interface SaveFileModalProps {
  visible: boolean;
  onSave: (fileName: string) => void;
  onDiscard: () => void;
  isLoading: boolean;
}

const SaveFileModal: React.FC<SaveFileModalProps> = ({
  visible,
  onSave,
  onDiscard,
  isLoading,
}) => {
  const [fileName, setFileName] = useState<string>("");
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {}
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {}
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  const handleSave = () => {
    if (fileName.trim() === "") {
      // No name was entered, please enter a name
      return;
    }
    onSave(fileName.trim());
    setFileName("");
  };
  const handleDiscard = () => {
    onDiscard();
    setFileName("");
  };
  return (
    <Modal
      animationType="slide"
      transparent={true} // Make the background transparent
      visible={visible}
      onRequestClose={handleDiscard} // Handle back button
    >
      {/* Background overlay */}
      <TouchableOpacity
        activeOpacity={1}
        // onPress={handleDiscard} // Close modal on outside press
        className="flex-1 bg-black/90 justify-center items-center"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="w-[80%] h-[400px] bg-white rounded-lg overflow-hidden"
        >
          <SafeAreaView className="flex-1 bg-[#ffffff] justify-center items-center">
            <View className=" rounded-md ">
              <Text className="text-lg font-bold">Enter the file name:</Text>
              <View className="bg-gray-100 mt-8 rounded-md">
                <TextInput
                  className="p-3 text-lg "
                  placeholder="patient_id"
                  value={fileName}
                  onChangeText={(input) => setFileName(input)}
                  autoFocus
                />
              </View>
              {isLoading && (
                <View className="mt-4">
                  <Text>Saving. This might take a few seconds.</Text>
                </View>
              )}
              <View className="flex flex-row justify-center items-center gap-x-4 mt-8">
                <View>
                  <CustomButton
                    title="Discard"
                    onPress={handleDiscard}
                    disabled={isLoading}
                    customButtonStyle={{ backgroundColor: "#8b0000" }}
                  />
                </View>
                <View>
                  <CustomButton
                    title={isLoading ? "Saving" : "Save"}
                    onPress={handleSave}
                    disabled={isLoading}
                  />
                </View>
              </View>
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default SaveFileModal;
