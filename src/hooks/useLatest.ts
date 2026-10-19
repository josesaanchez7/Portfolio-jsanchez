import { useEffect, useRef } from "react";

/** Referencia que siempre apunta al último valor, para usarlo en efectos sin volver a suscribirlos. */
export const useLatest = <T,>(value: T) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
};
