import React from "react";
import { Slot } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";

export default function SavedFilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
