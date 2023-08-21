import { useEffect } from "react";
import { createPortal } from "react-dom";

export interface OverlayProps {
  open?: boolean;
  removePadding?: boolean;
  enableCloseOnEsc?: boolean;
  children?: React.ReactNode;
  onClose?: () => void;
}

export default function Overlay(props: OverlayProps) {
  const { open, enableCloseOnEsc, onClose } = props;

  // Close on escape key
  useEffect(() => {
    if (!open || !enableCloseOnEsc) {
      return;
    }

    function closeOnEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (onClose) {
          onClose();
        }
      }
    }

    document.addEventListener("keyup", closeOnEsc);
    return () => {
      document.removeEventListener("keyup", closeOnEsc);
    };
  }, [open, enableCloseOnEsc, onClose]);

  return createPortal(
    <div
      className={`fixed flex top-0 left-0 w-screen h-screen justify-center z-100 ${
        props.open ? "" : "invisible"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute w-full h-full bg-black opacity-50"
        onClick={props.onClose ? props.onClose : undefined}
      />
      {/* Body */}
      <div className="absolute flex w-full h-full justify-center items-center">
        {props.open ? props.children : null}
      </div>
    </div>,
    document.body
  );
}
