export interface SwitchProps {
  checked?: boolean;
  label?: string;
  onChecked?: (checked: boolean) => void;
}

export default function Switch(props: SwitchProps) {
  return (
    <div
      className="flex flex-row items-center gap-2 cursor-pointer select-none"
      onClick={() => {
        if (props.onChecked) {
          props.onChecked(!props.checked);
        }
      }}
    >
      <div
        className={`flex flex-row items-center w-[40px] h-[24px] rounded-full text ring-1 ring-base-300 dark:ring-base-600 transition ${
          props.checked ? "bg-success-500" : "bg-base-400"
        }`}
      >
        <div
          className={`w-[18px] h-[18px] rounded-full bg-base-100 ring-1 ring-base-300 transition ${
            props.checked ? "translate-x-[18px]" : "translate-x-[4px]"
          }`}
        />
      </div>
      {props.label && <span className="text-dim text-sm">{props.label}</span>}
    </div>
  );
}
