export class Device {
  writeCharacteristicWithResponseForService = jest.fn();
  requestMTU = jest.fn().mockResolvedValue(512);
  monitorCharacteristicForService = jest.fn();
}

export class BleError extends Error {
  errorCode?: number;
  constructor(message: string, errorCode?: number) {
    super(message);
    this.errorCode = errorCode;
  }
}

export class Subscription {
  remove = jest.fn();
}

// Optionally mock BleErrorCode if needed
export const BleErrorCode = {
  DeviceDisconnected: 201,
};
