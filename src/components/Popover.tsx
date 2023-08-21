import { twMerge } from "tailwind-merge";

import ClickOutside from "./ClickOutside";

export interface PopoverProps {
  className?: string;
  open?: boolean;
  disableClick?: boolean;
  element?: React.ReactNode;
  popupWrapperClassName?: string;
  popup?: React.ReactNode;
  onChange?: (open: boolean) => void;
}

export default function Popover(props: PopoverProps) {
  return (
    <ClickOutside
      onClickOutside={() => {
        if (props.onChange) {
          props.onChange(false);
        }
      }}
    >
      <div
        className={twMerge("relative select-none transition", props.className)}
      >
        <div
          className={`${!props.disableClick ? "cursor-pointer" : ""}`}
          onClick={
            !props.disableClick
              ? () => {
                  if (props.onChange) {
                    props.onChange(!props.open);
                  }
                }
              : undefined
          }
        >
          {props.element}
        </div>
        <div
          className={twMerge(
            "absolute z-50 transition",
            props.open ? "opacity-100" : "opacity-70",
            props.popupWrapperClassName ?? ""
          )}
        >
          {props.open && props.popup}
        </div>
      </div>
    </ClickOutside>
  );
}
