import React from "react";
import { Slot } from "expo-router";

export default function SavedFilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <BLEProvider>
    <Slot />
    // </BLEProvider>
  );
}
