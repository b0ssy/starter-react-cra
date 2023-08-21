import { useEffect } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  open?: boolean;
  removePadding?: boolean;
  disableCloseOnEsc?: boolean;
  title?: string;
  subtitle?: string;
  container?: Element;
  children?: React.ReactNode;
  onClose?: () => void;
}

export default function Modal(props: ModalProps) {
  // Close on escape key
  useEffect(() => {
    if (!props.open || props.disableCloseOnEsc) {
      return;
    }

    function closeOnEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (props.onClose) {
          props.onClose();
        }
      }
    }

    document.addEventListener("keyup", closeOnEsc);
    return () => {
      document.removeEventListener("keyup", closeOnEsc);
    };
  }, [props, props.open, props.disableCloseOnEsc, props.onClose]);

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
      <div
        className={`paper absolute ${
          props.removePadding ? "" : "p-6"
        } max-h-[calc(100vh-3rem)] overflow-y-auto ${
          props.open ? "translate-y-6" : "translate-y-2"
        } transition`}
      >
        {/* Title */}
        {props.title && (
          <>
            <div className="text text-lg font-bold">{props.title}</div>
          </>
        )}

        {/* Subtitle */}
        {props.subtitle && (
          <>
            <div className="h-2" />
            <div className="text text-md text-disabled font-bold">
              {props.subtitle}
            </div>
          </>
        )}

        {/* Title/subtitle divider */}
        {(props.title || props.subtitle) && (
          <>
            <div className="h-4" />
            <div className="divider" />
            <div className="h-4" />
          </>
        )}

        {/* Content */}
        {props.open ? props.children : null}
      </div>
    </div>,
    props.container ?? document.body
  );
}
