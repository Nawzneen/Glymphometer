const API_BASE_URL = "https://storage-api-glymphaticresearch.2.rahtiapp.fi/api";

interface DatasetDetails {
  country: string;
  description: string;
}
interface FileMetaData{
  name:string;
  format:string;
  datasetId: string;
}
export async function uploadDataset(dataset:DatasetDetails, token:string) {
  //POST to dataset
  try {
    // Make the API call
    const response = await fetch(`${API_BASE_URL}/datasets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataset),
    });

    if (!response.ok) {
      const errorDetails = await response.text(); // Read the response body for error details
      //console.error("API error details:", errorDetails);
      throw new Error(`Failed to upload dataset. Status: ${response.status} - ${errorDetails}`);
    }

    const responseData = await response.json();
    //console.log("Dataset uploaded successfully:", responseData.id);
    return responseData;

  } catch (error) {
    // Log and rethrow the error for further handling
    //console.error("Error during dataset upload:", error);
    throw error;
  }

}

export async function uploadFileMetadata(file: FileMetaData, token: string) {
  try {
    // POST to file Metadata
    const response = await fetch(`${API_BASE_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([file]),
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      const errorMessage = `Failed to upload metadata for ${file.name}. Status: ${response.status}, Message: ${errorDetails}`;
      //console.error(errorMessage);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    //console.error(`Error during metadata upload for file ${file.name}:`, error);
    throw error; // error to handle it in the calling function
  }
}

export async function uploadFileContent(fileUri: string, fileId: string, token: string) {

  // upload the files themselvies
  try {
    console.log("fileId:", fileId);
    console.log("file URI being sent:", fileUri);

    const file = {
      uri: fileUri,
      type: "text/plain", // fix this to the correct file type
      name: fileUri.split("/").pop(), // Extract file name from the URI
    };

    const formData = new FormData();
    formData.append("file", file as any);

    const response = await fetch(`${API_BASE_URL}/files/${fileId}/file`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      const errorMessage = `Failed to upload file content for fileId: ${fileId}. Status: ${response.status}, Message: ${errorDetails}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log("File uploaded successfully for fileId:", fileId);
    //return await response.json();

  } catch (error) {
    console.error(`Error during file upload for fileId ${fileId}:`, error);
    throw error; // Rethrow to handle in calling function
  }
}

