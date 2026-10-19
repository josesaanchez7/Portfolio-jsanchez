import { createContext } from "react";

export interface DebugModeContextValue {
  enabled: boolean;
  toggle: () => void;
}

export const DebugModeContext = createContext<DebugModeContextValue | undefined>(undefined);
