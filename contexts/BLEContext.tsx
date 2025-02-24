import React, { createContext, useContext, ReactNode } from "react";
import useBLE from "@/utils/useBLE"; // adjust the import path as needed

type BLEContextType = ReturnType<typeof useBLE>;

const BLEContext = createContext<BLEContextType | undefined>(undefined);

export const BLEProvider = ({
  children,
  isRecordingRef,
}: {
  children: ReactNode;
  isRecordingRef: React.MutableRefObject<boolean>;
}) => {
  const ble = useBLE(isRecordingRef);
  return <BLEContext.Provider value={ble}>{children}</BLEContext.Provider>;
};

export const useBLEContext = () => {
  const context = useContext(BLEContext);
  if (!context) {
    throw new Error("useBLEContext must be used within a BLEProvider");
  }
  return context;
};
