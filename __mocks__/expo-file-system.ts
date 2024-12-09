const FileSystem = {
  documentDirectory: "file://mockDocumentDirectory/",
  getInfoAsync: jest.fn(async (uri: string) => {
    return {
      exists: false,
      uri,
    };
  }),
  makeDirectoryAsync: jest.fn(async () => {}),
  writeAsStringAsync: jest.fn(async () => {}),
  EncodingType: {
    Base64: "base64",
  },
};

export default FileSystem;
