import { Device } from "react-native-ble-plx";
async function discoverBLEServicesCharactristics(deviceConnection: Device) {
  // Discover all services and characteristics of the device
  await deviceConnection.discoverAllServicesAndCharacteristics();

  // Get all services of the device
  const services = await deviceConnection.services();

  // Loop through each services
  for (const service of services) {
    // Get all characteristics of the service
    const characteristics = await deviceConnection.characteristicsForService(
      service.uuid
    );

    // Loop through each characteristic and log properties
    for (const characteristic of characteristics) {
      console.log(
        "Characteristic UUID:",
        characteristic.uuid,
        "Readable:",
        characteristic.isReadable,
        "Writable:",
        characteristic.isWritableWithResponse ||
          characteristic.isWritableWithoutResponse,
        "Notifiable:",
        characteristic.isNotifiable
      );
    }
    //Log the Service UUID
    console.log("Service UUID:", service.uuid);
  }
}

// Function to read the battery level of the device (it doesnt work now)
async function readBatteryLevel(device: Device) {
  const BATTERY_SERVICE_UUID = "180F";
  const BATTERY_LEVEL_CHAR_UUID = "2A19";
  device
    .readCharacteristicForService(BATTERY_SERVICE_UUID, BATTERY_LEVEL_CHAR_UUID)
    .then((Characteristic) => {
      const batteryLevel = Characteristic.value;
      console.log("Battery Level is", batteryLevel);
    })
    .catch((error) => {
      console.log("Error in reading battery level", error);
    });
}
export { discoverBLEServicesCharactristics, readBatteryLevel };
