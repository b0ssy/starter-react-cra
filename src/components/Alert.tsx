import {
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export interface AlertProps {
  variant?: "filled";
  color?: "info" | "success" | "warn" | "error";
  title?: string;
  message?: string;
}

export default function Alert(props: AlertProps) {
  const classes: string[] = [];

  const color = props.color ?? "info";
  switch (props.variant ?? "filled") {
    case "filled":
      switch (color) {
        case "info":
          classes.push("bg-info-200 ring-info-500");
          break;
        case "success":
          classes.push("bg-success-200 ring-success-500");
          break;
        case "warn":
          classes.push("bg-warn-200 ring-warn-500");
          break;
        case "error":
          classes.push("bg-error-200 ring-error-500");
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }

  return (
    <div
      className={`flex flex-row items-start gap-4 w-full pr-6 p-4 rounded-md ring-1 ${classes.join(
        " "
      )}`}
    >
      {color === "info" && <InformationCircleIcon className="w-6 h-6" />}
      {color === "success" && <CheckCircleIcon className="w-6 h-6" />}
      {color === "warn" && <ExclamationTriangleIcon className="w-6 h-6" />}
      {color === "error" && <ExclamationCircleIcon className="w-6 h-6" />}
      <div>
        {props.title && (
          <div className="text-sm font-bold">{props.title}</div>
        )}
        {props.message && (
          <div className={`text-sm ${props.title ? "mt-2" : ""}`}>
            {props.message}
          </div>
        )}
      </div>
    </div>
  );
}
