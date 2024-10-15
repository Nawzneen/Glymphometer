import { Stack } from "expo-router";
import Hm from "./HomeScreen";
import Connect from "./Connect";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="HomeScreen" />
      <Stack.Screen name="Connect" />
    </Stack>
  );
}
