import { useState } from "react";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

import DatePicker, { DatePickerProps } from "./DatePicker";
import Popover from "./Popover";

export interface SelectDatePickerProps extends DatePickerProps {
  selectedText?: string;
  onRemove?: () => void;
}

export default function SelectDatePicker(props: SelectDatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      element={
        <div className="input flex flex-row items-center">
          {props.selectedDate && (
            <XMarkIcon
              className="w-4 h-4 mr-1 hover:text-disabled"
              onClick={(event) => {
                event.stopPropagation();
                if (props.onRemove) {
                  props.onRemove();
                }
              }}
            />
          )}
          <span className="text text-sm h-5 mr-3">
            {props.selectedText ?? "Select Date"}
          </span>
          <div className="flex-grow" />
          <ChevronDownIcon className="w-4 h-4" />
        </div>
      }
      popup={
        <div className="py-2">
          <DatePicker {...props} />
        </div>
      }
      onChange={(open) => setOpen(open)}
    />
  );
}
