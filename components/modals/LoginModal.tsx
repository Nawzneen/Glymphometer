import React, { useState, useContext } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { AuthContext } from "@/contexts/AuthContext";
import LoginForm from "@/components/LoginForm";
import SignUpForm from "@/components/SignUpForm"; // Create this component

interface LoginModalProps {
  isModalVisible: boolean;
  setIsModalVisible: (isVisible: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isModalVisible,
  setIsModalVisible,
}) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login"); // Track active tab
  const { signIn, signUp } = useContext(AuthContext);
  const handleLoginSuccess = () => {
    // after successfull login/signup, close the modal
    setIsModalVisible(false);
  };

  const handleDiscard = () => {
    setIsModalVisible(false); // Close the modal
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={handleDiscard}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleDiscard}
        className="flex-1 bg-black/90 justify-center items-center"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="w-[90%] h-[500px] bg-white rounded-lg overflow-hidden"
        >
          <SafeAreaView className="flex-1 bg-[#ffffff]">
            {/* Tab Navigation */}
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
              <TouchableOpacity
                onPress={() => setActiveTab("login")}
                style={{
                  flex: 1,
                  padding: 15,
                  alignItems: "center",
                  backgroundColor: activeTab === "login" ? "#ccc" : "#fff",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab("signup")}
                style={{
                  flex: 1,
                  padding: 15,
                  alignItems: "center",
                  backgroundColor: activeTab === "signup" ? "#ccc" : "#fff",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Render the active form */}
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
              }}
            >
              {activeTab === "login" ? (
                <LoginForm onLoginSuccess={handleLoginSuccess} />
              ) : (
                <SignUpForm onSignUpSuccess={handleLoginSuccess} />
              )}
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default LoginModal;
