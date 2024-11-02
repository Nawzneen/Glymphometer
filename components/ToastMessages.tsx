import React from "react";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import {
  ToastConfig,
  BaseToastProps,

  //   ErrorToastProps,
} from "react-native-toast-message";
import { View, Text } from "react-native";
const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "pink" }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: "400",
      }}
    />
  ),

  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      text1Style={{
        fontSize: 17,
      }}
      text2Style={{
        fontSize: 15,
      }}
    />
  ),
  /*
     Example of a custom toast
    */
  // tomatoToast: ({ text1, props }: any) => (
  //   <View style={{ height: 60, width: "100%", backgroundColor: "tomato" }}>
  //     <Text>{text1}</Text>
  //     <Text>{props.uuid}</Text>
  //   </View>
  // ),
};
const ToastMessages = () => {
  return <Toast config={toastConfig} />;
};

export default ToastMessages;
