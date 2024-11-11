import React, { FC, useCallback } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Device } from "react-native-ble-plx";
import CustomButton from "./CustomButton";

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

type DeviceModalProps = {
  devices: Device[];
  visible: boolean;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

const DeviceModalListItem: FC<DeviceModalListItemProps> = (props) => {
  const { item, connectToPeripheral, closeModal } = props;
  const connectAndCloseModal = useCallback(() => {
    connectToPeripheral(item.item);
    closeModal();
  }, [closeModal, connectToPeripheral, item.item]);
  return (
    <View className="flex justify-center items-center my-2">
      <CustomButton
        title={item.item.name || item.item.localName || "Unknown Device"}
        onPress={connectAndCloseModal}
        customButtonStyle={{ width: 300 }}
        textStyle={{ color: "white" }}
      />
    </View>
  );
};

const DeviceModal: FC<DeviceModalProps> = (props) => {
  const { devices, visible, connectToPeripheral, closeModal } = props;

  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return (
        <DeviceModalListItem
          item={item}
          connectToPeripheral={connectToPeripheral}
          closeModal={closeModal}
        />
      );
    },
    [closeModal, connectToPeripheral]
  );

  return (
    <Modal
      animationType="slide"
      transparent={true} // Make the background transparent
      visible={visible}
    >
      {/* Background overlay */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={closeModal} // Close modal on outside press
        className="flex-1 bg-black/90 justify-center items-center"
      >
        {/* Modal content */}
        <TouchableOpacity
          activeOpacity={1}
          className="w-[90%] h-[70%] bg-white rounded-lg overflow-hidden"
        >
          <SafeAreaView className="flex-1 bg-[#ffffff]">
            <Text className="mt-10 text-xl font-bold mx-5 text-center text-primary-text-color">
              Tap on a device to connect
            </Text>
            {/* in case of an error */}
            {/* <Text className="text-center text-red-600 mt-4">
              Turn on your phone's Bluetooth!
            </Text> */}
            <Text className="text-base mx-6 my-4 text-primary-text-color">
              If you don't see the Glymphometer name here, make sure your Phones
              bluetooth is on. Try to turn on and off the Glymphometer one time.
              Glymphometer needs all the permissions that is asked.
            </Text>
            <FlatList
              contentContainerStyle={{
                paddingVertical: 20,
                marginVertical: 10,
              }}
              data={devices}
              renderItem={renderDeviceModalListItem}
              keyExtractor={(item) => item.id}
            />
            {/* <View className="flex flex-1 justify-center items-center">
              <CustomButton
                title="GM5"
                // onPress={connectAndCloseModal}
                customButtonStyle={{ backgroundColor: "#5c5de5", width: 150 }}
                textStyle={{ color: "white" }}
              />
            </View> */}
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default React.memo(DeviceModal);
