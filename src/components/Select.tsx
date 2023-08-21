import { useState } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

import Button from "./Button";
import Checkbox from "./Checkbox";
import Popover from "./Popover";

export interface SelectProps {
  multiple?: boolean;
  options: string[];
  selectedOptions?: string[];
  selectedText?: string;
  noOptionsAvailableText?: string;
  disableSameWidth?: boolean;
  enableRemove?: boolean;
  onOpen?: (open: boolean) => void;
  onSelected: (selected: string[]) => void;
  onRemove?: () => void;
}

export default function Select(props: SelectProps) {
  const [open, setOpen] = useState(false);

  const hasOptions = props.options.length > 0;
  const selectedOptions = props.selectedOptions ?? [];
  return (
    <Popover
      open={open}
      disableClick={!hasOptions}
      element={
        <div className="input flex flex-row items-center">
          {!hasOptions && (
            <span className="text text-sm text-disabled h-5">
              {props.noOptionsAvailableText ?? "No options available"}
            </span>
          )}
          {hasOptions && (
            <>
              {props.enableRemove && selectedOptions.length > 0 && (
                <XMarkIcon
                  className="w-4 h-4 mr-1 hover:text-primary-400"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (props.onRemove) {
                      props.onRemove();
                    }
                  }}
                />
              )}
              <span className="text text-sm h-5 mr-3">
                {props.selectedText ?? selectedOptions.join(", ")}
              </span>
            </>
          )}
          <div className="flex-grow" />
          <ChevronDownIcon className="w-4 h-4" />
        </div>
      }
      popupWrapperClassName={!props.disableSameWidth ? "w-full" : undefined}
      popup={
        <div className="paper text divider-border flex flex-col mt-2 py-2 select-none">
          {props.options.map((options) => {
            return (
              <Button
                key={options}
                variant="text"
                size="sm"
                className="flex flex-row items-center gap-4 py-2 text-left rounded-none"
                onClick={() => {
                  const selected = [...(props.selectedOptions ?? [])];
                  const index = selected.indexOf(options);
                  if (index >= 0) {
                    if (props.multiple) {
                      selected.splice(index, 1);
                    }
                  } else {
                    selected.push(options);
                  }
                  props.onSelected(selected);
                  if (!props.multiple) {
                    setOpen(false);
                  }
                }}
              >
                {props.multiple && (
                  <Checkbox
                    state={
                      selectedOptions.includes(options)
                        ? "checked"
                        : "unchecked"
                    }
                  />
                )}
                {options}
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
