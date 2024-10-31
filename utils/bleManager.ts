//Create BleManager as a single instance throughout app to maintain consistent state.
import { BleManager } from "react-native-ble-plx";
const bleManager = new BleManager();
export default bleManager;
