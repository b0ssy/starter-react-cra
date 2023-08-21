import { useRef, useState, useEffect } from "react";

// Handle click events outside a component
export function useClickOutside(initialActive: boolean) {
  const [isActive, setActive] = useState(initialActive);
  const ref = useRef(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !(ref.current as any).contains(event.target)) {
      setActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return { ref, isActive, setActive };
}
