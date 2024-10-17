import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
interface HeaderProps {
  title: string;
  onButtonPress?: () => void;
}
const Header: React.FC<HeaderProps> = ({ title = "My App", onButtonPress }) => (
  <View className="mb-8 px-4 h-16 bg-primary-color text-white flex  shadow-black shadow-lg flex-row justify-between items-center ">
    <Text className="text-center text-white font-bold text-xl">{title}</Text>
    <View className="flex flex-row gap-x-2">
      <View className="rounded-full bg-green-800 w-[30px] h-[30px]" />
      <Text className="text-center text-white font-bold text-xl">30%</Text>
    </View>

    {/* {onButtonPress && (
      <TouchableOpacity onPress={onButtonPress}>
        <Text style={styles.button}>Button</Text>
      </TouchableOpacity>
    )} */}
  </View>
);

const styles = StyleSheet.create({
  button: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Header;
