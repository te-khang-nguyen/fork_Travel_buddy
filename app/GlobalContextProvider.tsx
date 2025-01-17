import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";

// Define the role type
export type Role = "business" | "user";

// Define the interface for the context
interface GlobalContextType {
  jwtToken: string;
  setJwtToken: React.Dispatch<React.SetStateAction<string>>;
  role: Role;
  setRole: React.Dispatch<React.SetStateAction<Role>>;
  userId: string;
  setUserId: React.Dispatch<React.SetStateAction<string>>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [jwtToken, setJwtToken] = useState<string>("");
  const [role, setRole] = useState<Role>("user"); // Default role is `null`
  const [userId, setUserId] = useState<string>("");

  const contextValue = useMemo(
    () => ({ jwtToken, setJwtToken, role, setRole, setUserId, userId }),
    [jwtToken, role]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
