import React from "react";
import { StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Home() {
  const router = useRouter();
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#000000" />
      <SafeAreaView className="flex flex-1 bg-white items-center justify-center">
        <View className="pt-5 px-5 h-52 w-full mb-12">
          <LinearGradient
            // Background Linear Gradient
            colors={["#5c258d", "#4389a2"]}
            className="absolute left-0 right-0 top-0 h-[320px]"
          />
        </View>

        {/* Gradient Border Button */}
        <LinearGradient
          colors={["#5c258d", "#4389a2"]}
          className="rounded-full p-[3px] w-[70%] my-7"
        >
          <TouchableOpacity
            className="bg-white rounded-full px-6 py-4 w-full"
            onPress={() => {
              router.push("/connect");
            }}
            activeOpacity={0.8}
          >
            <Text className="text-[#5c5de5] font-bold text-lg text-center">
              Connect
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Upload Button */}
        <TouchableOpacity
          onPress={() => {
            alert("Under construction");
          }}
          className="bg-[#5c5de5] rounded-full px-6 py-4 w-[70%] mx-auto mt-2"
        >
          <Text className="text-white font-bold text-lg text-center">
            Upload
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
}
