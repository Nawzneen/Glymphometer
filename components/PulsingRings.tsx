import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

const PulsingRings = () => {
  const ring1Scale = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0)).current;
  const ring3Scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (scaleRef: any, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(scaleRef, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleRef, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createPulse(ring1Scale, 0);
    createPulse(ring2Scale, 1000); // 500ms delay for staggered effect
    createPulse(ring3Scale, 2000); // 1000ms delay for staggered effect
  }, [ring1Scale, ring2Scale, ring3Scale]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.ring,
          styles.ring1,
          {
            transform: [{ scale: ring1Scale }],
            opacity: ring1Scale.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ring2,
          {
            transform: [{ scale: ring2Scale }],
            opacity: ring2Scale.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          styles.ring3,
          {
            transform: [{ scale: ring3Scale }],
            opacity: ring3Scale.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 50, // Adjusted based on individual ring sizes
    borderWidth: 5,
    borderColor: "blue", // Blue signal color
  },
  ring1: {
    width: 30,
    height: 30,
  },
  ring2: {
    width: 40,
    height: 40,
  },
  ring3: {
    width: 50,
    height: 50,
  },
});

export default PulsingRings;
