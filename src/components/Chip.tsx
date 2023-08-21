import React from "react";
import { twMerge } from "tailwind-merge";

export interface ChipProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  > {
  color?: "info" | "success" | "warn" | "error";
}

export default function Chip(props: ChipProps) {
  const classes: string[] = [
    "px-2 py-1 rounded-lg text-xs text-base-50 bg-primary-900 disabled:text-disabled transition",
  ];

  switch (props.color) {
    case "info":
      classes.push("bg-info-200 dark:bg-info-300 ring-1 ring-info-500 text-black");
      break;
    case "success":
      classes.push("bg-success-200 dark:bg-success-300 ring-1 ring-success-500 text-black");
      break;
    case "warn":
      classes.push("bg-warn-200 dark:bg-warn-300 ring-1 ring-warn-500 text-black");
      break;
    case "error":
      classes.push("bg-error-200 dark:bg-error-300 ring-1 ring-error-500 text-black");
      break;
    default:
      break;
  }

  return (
    <span
      {...props}
      className={twMerge(classes.join(" "), props.className ?? "")}
    >
      {props.children}
    </span>
  );
}
