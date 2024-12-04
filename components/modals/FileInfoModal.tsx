import React, { FC, useCallback } from "react";
import {
  Modal,
  SafeAreaView,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { FileInfoType } from "@/types/globalTypes";

interface FileInfoModalProps {
  info: FileInfoType | null | undefined;
  isModalVisible: boolean;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileInfoModal: FC<FileInfoModalProps> = ({
  info,
  setIsModalVisible,
  isModalVisible,
}) => {
  const {
    packetsNumbre,
    firstPacketNumber,
    lastPacketNumber,
    duplicatePackets,
    expectedPacketsNumber,
    duration,
    packetLoss,
    packetLossPercentage,
  } = info || {};
  console.log(isModalVisible, "inModal");

  return (
    <Modal
      animationType="slide"
      transparent={true} // Make the background transparent
      visible={isModalVisible}
    >
      {/* Background overlay */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setIsModalVisible(false)} // Close modal on outside press
        className="flex-1 bg-black/90 justify-center items-center"
      >
        {/* Modal content */}
        <TouchableOpacity
          activeOpacity={1}
          className="w-[90%] h-[70%] bg-white rounded-lg overflow-hidden"
        >
          <SafeAreaView className="flex-1 bg-[#ffffff]  items-center mt-16">
            <View className="flex flex-col ">
              <Text className="text-xl text-center mb-8 font-extrabold">
                File Information
              </Text>
              <Text className="text-base ">
                Total Number of Packets:{" "}
                <Text className="font-bold text-primary-color">
                  {packetsNumbre}
                </Text>
              </Text>
              <Text className="text-base ">
                Total Duration of Packets in Seconds:{" "}
                <Text className="font-bold text-primary-color">{duration}</Text>
              </Text>
              <Text className="text-base ">
                First Packet Number:{" "}
                <Text className="font-bold text-primary-color">
                  {firstPacketNumber}
                </Text>
              </Text>
              <Text className="text-base ">
                Last Packet Number:{" "}
                <Text className="font-bold text-primary-color">
                  {lastPacketNumber}
                </Text>
              </Text>
              <Text className="text-base ">
                Numebr of Duplicated Packets:{" "}
                <Text className="font-bold text-primary-color">
                  {duplicatePackets}
                </Text>
              </Text>
              <Text className="text-base ">
                Number of Lost Packets:{" "}
                <Text className="font-bold text-primary-color">
                  {packetLoss}
                </Text>
              </Text>
              <Text className="text-base ">
                Packet Loss Percentage:{" "}
                <Text className="font-bold text-primary-color">
                  {packetLossPercentage}%
                </Text>
              </Text>
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default FileInfoModal;
