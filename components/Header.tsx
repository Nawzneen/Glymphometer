import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
interface HeaderProps {
  title: string;
  onButtonPress?: () => void;
}
const Header: React.FC<HeaderProps> = ({ title = "My App", onButtonPress }) => (
  <View className="relative mb-8 px-4 h-16  flex flex-row justify-between items-center bg-primary-text-color ">
    <View className="absolute shadow-black shadow-2xl" />
    <Text className="text-center font-bold text-xl text-light-text-color">
      {title}
    </Text>
    {/* <View className="flex flex-row items-center justify-center gap-x-2 text-base">
      <View className="rounded-full bg-success-color w-[25px] h-[25px]" />
      <Text className="text-center font-bold text-light-text-color">30%</Text>
    </View> */}

    {/* {onButtonPress && (
      <TouchableOpacity onPress={onButtonPress}>
        <Text style={styles.button}>Button</Text>
      </TouchableOpacity>
    )} */}
  </View>
);

export default Header;
