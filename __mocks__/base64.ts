export default {
  encode: jest.fn((input: string) => `base64-${input}`),
  decode: jest.fn((input: string) => "decodedData"),
};
