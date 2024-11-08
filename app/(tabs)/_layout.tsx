import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native"; // Import View and StyleSheet for layout
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Header from "@/components/Header"; // Import your custom Header component
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View className="flex flex-1 bg-gray-100">
      {/* Custom Header Component */}
      <Header title="Glymphometer" />

      {/* Tabs at the bottom */}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "orange", // Set the active tab color to orange
          tabBarInactiveTintColor: "gray", // Set the inactive tab color to gray
          headerShown: false, // Hide the header for the individual screens
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Connect",
            tabBarIcon: ({ color, focused }) => (
              // <TabBarIcon
              //   name={focused ? "code-slash" : "code-slash-outline"}
              //   color={color}
              // />
              <FontAwesome6
                name="connectdevelop"
                size={24}
                color={focused ? "orange" : "black"}
              />
            ),
          }}
        />
        {/* <Tabs.Screen
          name="results"
          options={{
            title: "Results",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "code-slash" : "code-slash-outline"}
                color={focused ? "orange" : "black"}
              />
            ),
          }}
        /> */}
        <Tabs.Screen
          name="savedFiles"
          options={{
            title: "Saved Files",
            tabBarIcon: ({ color, focused }) => (
              <AntDesign
                name="filetext1"
                size={24}
                color={focused ? "orange" : "black"}
              />
              // <TabBarIcon
              //   name={focused ? "code-slash" : "code-slash-outline"}
              //   color={color}
              // />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
