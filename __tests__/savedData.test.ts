jest.mock("expo-file-system", () => ({
  documentDirectory: "file://mockDocumentDirectory/",
  getInfoAsync: jest.fn(async (uri: string) => ({
    exists: false,
    uri,
  })),
  makeDirectoryAsync: jest.fn(async () => {}),
  writeAsStringAsync: jest.fn(async () => {}),
  EncodingType: {
    Base64: "base64",
  },
}));
import { saveDataToFile, createFolder } from "@/utils/saveData";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import { handleError } from "@/utils/handleError";

// jest.mock("expo-file-system");
// jest.mock("react-native-toast-message");
jest.mock("@/utils/handleError"); // Adjust path if needed

describe("saveDataToFile", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock getInfoAsync to simulate folder not existing initially
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
      exists: false,
      uri: "file://mockDocumentDirectory/userData/",
    });
  });

  it("should create the folder if it doesn't exist and save data", async () => {
    const dataBuffer = [0x01, 0x02, 0x03];
    const fileName = "test_file";

    await saveDataToFile(dataBuffer, fileName);

    // Check if folder creation was called
    expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
      "file://mockDocumentDirectory/userData/",
      { intermediates: true }
    );

    // Check that the file was written
    expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
    const [[writtenUri, base64Data]] = (
      FileSystem.writeAsStringAsync as jest.Mock
    ).mock.calls;
    expect(writtenUri).toMatch(/userData\/test_file_\d+\.bin$/);
    expect(base64Data).toEqual(expect.any(String));

    // Check toast is shown
    expect(Toast.show).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "success",
        text1: "Data Saved Successfully",
      })
    );

    // Ensure no error handler was called
    expect(handleError).not.toHaveBeenCalled();
  });

  it("should handle errors by calling handleError", async () => {
    (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValue(
      new Error("Write failed")
    );
    await saveDataToFile([1, 2, 3], "fail_test");

    expect(handleError).toHaveBeenCalledWith(
      expect.any(Error),
      "Error saving data to file"
    );
    expect(Toast.show).not.toHaveBeenCalled();
  });
});

describe("createFolder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create the folder if it doesn't exist", async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
      exists: false,
    });
    await createFolder();
    expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
      "file://mockDocumentDirectory/userData/",
      { intermediates: true }
    );
  });

  it("should not create the folder if it already exists", async () => {
    (FileSystem.getInfoAsync as jest.Mock).mockResolvedValueOnce({
      exists: true,
    });
    await createFolder();
    expect(FileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
  });
});
