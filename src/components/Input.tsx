import { twMerge } from "tailwind-merge";

export interface InputProps {
  type?: React.HTMLInputTypeAttribute;
  label?: string;
  value?: string;
  icon?: React.ReactNode;
  error?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  pattern?: string;
  inputProps?: React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >;
  onRef?: (ref: HTMLInputElement | null) => void;
  onChange?: (value: string) => void;
  onClearError?: () => void;
  onEnterPressed?: () => void;
}

export default function Input(props: InputProps) {
  return (
    <>
      {/* Label */}
      {props.label && (
        <>
          <div className="text-dim text-sm">{props.label}</div>
          <div className="h-2" />
        </>
      )}

      <div className="relative flex flex-row justify-center items-center">
        {/* Input control */}
        <input
          className={twMerge(
            "w-full",
            !props.error ? "input" : "input-error",
            props.icon ? "pl-10" : "",
            props.className
          )}
          ref={props.onRef}
          type={props.type}
          pattern={props.pattern}
          disabled={props.disabled}
          autoFocus={props.autoFocus}
          autoComplete={props.autoComplete}
          value={props.value ?? ""}
          onClick={props.onClearError}
          onChange={(e) => {
            if (props.onChange) {
              props.onChange(e.target.value);
            }
            if (props.onClearError) {
              props.onClearError();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === "Enter" && props.onEnterPressed) {
              props.onEnterPressed();
            }
          }}
          onWheel={(e) => {
            // Fix for type==="number" where user could inadventently change the value while scrolling
            (e.target as HTMLElement).blur();
          }}
          {...props.inputProps}
        />

        {/* Icon */}
        {props.icon && (
          <div className="absolute flex top-0 left-0 h-full pl-2 justify-center items-center">
            <div className="w-6 h-6 text-disabled">{props.icon}</div>
          </div>
        )}
      </div>

      {/* Error message */}
      {!!props.error && (
        <div className="py-1 text-error text-sm">{props.error}</div>
      )}
    </>
  );
}
