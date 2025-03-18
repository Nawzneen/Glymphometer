# Glymphometer Application (GlymphoLink)

The development of the Glymphometer application (GlymphoLink) has moved to a private repository for legal and proprietary reasons. This public repository does not contain the latest changes or sensitive configuration details such as Firebase credentials.

This application requires a physical device called the Glymphometer, developed within the OPEM research group at the University of Oulu. The device is a Bluetooth Low Energy (BLE) sensor suite that measures various brain activities. The mobile application communicates with these BLE devices and provides features including:

- Data Streaming
- Adjusting the LED light
- Data recording and storage
- Real-time processing of incoming packets
- Post-processing of stored packets
- Signal quality analysis of incoming NIRS data
- Demonstrating packet loss and buffering status
- Uploading data to a database via API endpoints for further research

---

<p>
    <img src="https://github.com/user-attachments/assets/7a37e259-3874-4e1b-9de0-f70fbe12d51f" width="240" hspace="3" >
    <img src="https://github.com/user-attachments/assets/6e03cb5e-83ea-490c-a266-aac2a3259a09" width="240" hspace="3" >
   <img src="https://github.com/user-attachments/assets/16612a4a-1966-4692-9f97-5d5130c3539c"  width="240" hspace="3" >
   <img src="https://github.com/user-attachments/assets/09971ece-5002-47d9-a979-d27202a0aab4"  width="240" hspace="3" >
</p>
<p>   
   <img src="https://github.com/user-attachments/assets/3bceeeb0-99b8-4cdf-b3da-52c5cc1bde69"  width="240"  hspace="3" > 
   <img src="https://github.com/user-attachments/assets/59f56723-8de1-43e3-b5e3-9d35026a1845"  width="240"  hspace="3" >
   <img src="https://github.com/user-attachments/assets/9711c8d9-0bf6-42d0-9761-fc6d89fa96d7" width="240"  hspace="3" >
</p>






## Prerequisites

- A physical Glymphometer device (full features require the hardware).
- A development environment set up with Node.js and npm.
- An Android device with USB debugging enabled.
- A Firebase project for backend services.

> **Note:** This repository does not include the Firebase configuration or the `.env` file, as these contain sensitive information that should not be publicly available. You must create and configure these locally.

---

## Environment Setup

### Firebase Configuration

1. **Create a Firebase Project:**  
   If you haven’t already, go to [Firebase Console](https://console.firebase.google.com/) and create a new project.

2. **Obtain Configuration Details:**  
   In your Firebase project settings, find your Firebase configuration keys (e.g., `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, etc.).

3. **Create a `.env` File:**  
   In the root directory of your project, create a file named `.env` and add your Firebase configuration. For example:

   ```bash
   # .env file example
   FIREBASE_API_KEY=your_api_key
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_APP_ID=your_app_id


## Get Started

#Clone the Repository:

git clone [<repository_url>](https://github.com/Nawzneen/Glymphometer/)
cd Glymphometer

#Install Dependencies:

```
bash
npm install
```

### Connect Your Android Device:

   1.Connect your phone via USB.
   2. Enable Developer Mode and USB Debugging on your phone ([instructions](https://developer.android.com/studio/debug/dev-options)).

### Run the Application:

    npx expo run:android

### Begin Development:
    With the application running on your device, you can now start modifying and testing your code.

### Building the APK Package

To build an APK package for Android devices, run:
```build
eas build -p android --profile preview
```
This command uses Expo Application Services (EAS) to build your app. Ensure your EAS configuration is set up properly before running the build.
Additional Notes

### Security:
    Sensitive data like Firebase credentials is stored in a .env file which is excluded from version control. Make sure you maintain this practice to protect your configuration details.

### Repository Management:
    Since the repository does not include the latest changes and sensitive packages, make sure you coordinate with your team to obtain any missing components or private configurations if needed.

### BLE-PLX Library:
    The application uses the BLE-PLX library, and development is performed on a custom app (not the Expo managed workflow).
