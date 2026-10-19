import { useContext } from "react";
import { DebugModeContext, type DebugModeContextValue } from "./debug-context";

export const useDebugMode = (): DebugModeContextValue => {
  const context = useContext(DebugModeContext);
  if (!context) {
    throw new Error("useDebugMode must be used within a DebugModeProvider");
  }
  return context;
};
