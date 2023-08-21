import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import Button from "./Button";
import Popover from "./Popover";

export interface SelectButtonProps {
  options: {
    label: string;
    onClick: () => void;
  }[];
  popupWrapperClassName?: string;
  onOpen?: (open: boolean) => void;
  children?: React.ReactNode;
}

export default function SelectButton(props: SelectButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      element={
        <Button className="flex items-center" size="sm">
          {props.children}
          <ChevronDownIcon className="w-4 h-4 ml-2" />
        </Button>
      }
      popupWrapperClassName={props.popupWrapperClassName}
      popup={
        <div className="paper text divider-border flex flex-col mt-2 py-2 select-none">
          {props.options.map((options) => {
            return (
              <Button
                key={options.label}
                variant="text-bg"
                size="sm"
                className="flex flex-row items-center gap-4 py-2 text-left rounded-none"
                onClick={() => {
                  options.onClick();
                  setOpen(false);
                }}
              >
                {options.label}
              </Button>
            );
          })}
        </div>
      }
      onChange={(open) => {
        setOpen(open);
        if (props.onOpen) {
          props.onOpen(open);
        }
      }}
    />
  );
}
