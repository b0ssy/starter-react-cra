import { CheckIcon, MinusIcon } from "@heroicons/react/24/solid";

export type CheckboxState = "checked" | "partial" | "unchecked";

export interface CheckboxProps {
  state?: CheckboxState;
  label?: string;
  disabled?: boolean;
  onClick?: (state: CheckboxState) => void;
}

export default function Checkbox(props: CheckboxProps) {
  function handleClick() {
    if (props.disabled) {
      return;
    }
    if (props.onClick) {
      props.onClick(props.state === "checked" ? "unchecked" : "checked");
    }
  }

  return (
    <div
      className={`flex flex-row gap-2 items-center select-none ${
        !props.disabled ? "cursor-pointer" : ""
      }`}
      onClick={handleClick}
    >
      <div
        className={`w-4 h-4 rounded-sm ring-2 transition ${
          !props.disabled
            ? "hover:ring-primary-900 hover:dark:ring-primary-900"
            : "ring-base-200 dark:ring-base-700"
        } ${
          props.state === "checked"
            ? "bg-primary-900 ring-primary-900"
            : "ring-base-400 dark:ring-base-500"
        }`}
      >
        {props.state === "checked" && (
          <CheckIcon className="icon p-px text-white stroke-white" />
        )}
        {props.state === "partial" && (
          <MinusIcon className="icon p-px text-white stroke-white" />
        )}
      </div>
      {!!props.label && <span className="text-dim text-sm">{props.label}</span>}
    </div>
  );
}
