import { Tabs } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native"; // Import View and StyleSheet for layout
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import Header from "@/components/Header"; // Import your custom Header component

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
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
              <TabBarIcon
                name={focused ? "code-slash" : "code-slash-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="results"
          options={{
            title: "Results",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "code-slash" : "code-slash-outline"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

// Add some basic styles for the layout
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
