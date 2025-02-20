import { FC, useEffect, useState } from "react";
import { View, SafeAreaView, Text, StyleSheet } from "react-native";
const signalQuality: FC = () => {
  const [wavelengths, setWavelengths] = useState<number[][]>(
    Array(3).fill(Array(4).fill(0))
  );

  // Update every second
  useEffect(() => {
    const interval = setInterval(() => {
      setWavelengths(
        wavelengths.map((channel) =>
          channel.map(() => (Math.random() > 0.5 ? 1 : 0))
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [wavelengths]);
  return (
    <SafeAreaView className="flex-1">
      <View className="py-4 flex flex-row justify-center items-center gap-x-2 bg-primary-color">
        <Text className="text-lg text-center text-light-text-color ">
          NIRS Signal Quality
        </Text>
      </View>

      <View className="flex flex-row items-center  gap-x-3 my-4 p-3">
        <Text className="text-lg font-semibold w-28 text-gray-700">
          Channel
        </Text>
        <View className="flex flex-row gap-4">
          {["W1", "W2", "W3", "W4"].map((label) => (
            <Text
              key={label}
              className="text-base font-medium w-10 text-center text-black"
            >
              {label}
            </Text>
          ))}
        </View>
      </View>

      {/* Channels and Wavelengths */}
      {wavelengths.map((channel, channelIndex) => (
        <View
          key={channelIndex}
          className="flex flex-row items-center gap-x-3 mb-3 bg-white p-3 rounded-xl shadow-md"
        >
          <Text className="text-base font-semibold w-28 text-gray-800">
            Channel {channelIndex + 1}
          </Text>

          <View className="flex flex-row gap-4">
            {channel.map((value, index) => (
              <View
                key={index}
                className={`w-10 h-10 rounded-full shadow-md transition-all ${
                  value ? "bg-green-400" : "bg-red-400"
                }`}
              />
            ))}
          </View>
        </View>
      ))}
      {/* </View>
          </View>
        ))} */}
      {/* </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#f0f0f0" },
  channel: { marginBottom: 20 },
  channelTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  wavelengthRow: { flexDirection: "row", gap: 10 },
  wavelengthContainer: { flexDirection: "column", alignItems: "center" },
  colorBlock: { width: 40, height: 40, marginVertical: 2, borderRadius: 4 },
});

export default signalQuality;
