// This component should allow user to adjust LED Light Levels
import React, { useState, useEffect, MutableRefObject, FC } from "react";
import { Text, View } from "react-native";
import Slider from "@react-native-community/slider";
interface AdjustLEDLevelProps {
  isDataStreaming: boolean;
  handleLEDLevel: (value: number) => Promise<void>;
  isRecording: boolean;
}

const AdjustLEDLevel: FC<AdjustLEDLevelProps> = ({
  handleLEDLevel,
  isDataStreaming,
  isRecording,
}) => {
  const [LEDLevel, setLEDLevel] = useState<number>(3);
  // const steps = Array.from({ length: 10 }, (_, i) => i); // [0,1,2,...,9]
  useEffect(() => {
    handleLEDLevel(LEDLevel);
  }, [LEDLevel]);
  return (
    <View className="mt-4 mx-2 bg-gray-100 p-4 ">
      <Text className="mb-4 px-2 text-base text-primary-text-color ">
        Adjust the light level: {LEDLevel}
      </Text>
      <Slider
        minimumValue={0}
        maximumValue={9}
        step={1}
        value={LEDLevel}
        disabled={!isDataStreaming || isRecording}
        onValueChange={(LEDLevel) => setLEDLevel(LEDLevel)}
        minimumTrackTintColor="#2d9cdb"
        maximumTrackTintColor="#56ccf2"
        thumbTintColor="#2d9cdb"
      />
      {/* <View className="flex flex-row">
        {steps.map((step) => (
          <Text key={step}>{step}</Text>
        ))}
      </View> */}
    </View>
  );
};

export default AdjustLEDLevel;
