import 'dotenv/config';

export default {
  expo: {
    name: "Glymphometer",
    slug: "Glymphometer",
    version: "1.0.0",
    orientation: "portrait",
    extra: {
      firebaseApiKey: (process.env.FIREBASE_API_KEY),
      firebaseProjectId: (process.env.FIREBASE_PROJECT_ID),
      firebaseStorageBucket: (process.env.FIREBASE_STORAGE_BUCKET),
      firebaseAppId: (process.env.FIREBASE_APP_ID),
      eas: {
        projectId: "4933a55d-fb86-4d56-b30a-975a47b34831", 
      },
    },
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "light",
    splash: { 
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.freelancers.glympholink", 
    },
    android: {
      package: "com.freelancers.glympholink", 
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.BLUETOOTH",
        "android.permission.BLUETOOTH_ADMIN",
        "android.permission.BLUETOOTH_CONNECT",
      ],
    },
    web: {
      bundler: "metro", 
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "react-native-ble-plx",
        {
          isBackgroundEnabled: true,
          modes: ["peripheral", "central"],
          bluetoothAlwaysPermission: "Allow $(PRODUCT_NAME) to connect to Bluetooth devices",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};