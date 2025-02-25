import React, {
  createContext,
  useContext,
  ReactNode,
  ReactElement,
} from "react";

type AppContextType = {
  saveFileModalVisible: boolean;
  setSaveFileModalVisible: (modalVisible: boolean) => void;
};
const AppContext = createContext<AppContextType | undefined>(undefined);

function useAppContext(): AppContextType {
  console.log("use app context is used");
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a AppProvider");
  }
  return context;
}

const AppProvider = (props: { children: ReactNode }): ReactElement => {
  const [saveFileModalVisible, setSaveFileModalVisible] =
    React.useState<boolean>(false);

  console.log("save filed inside app provider is");
  return (
    <AppContext.Provider
      value={{ saveFileModalVisible, setSaveFileModalVisible }}
    >
      {props.children}
    </AppContext.Provider>
  );
};
export { AppProvider, useAppContext };
