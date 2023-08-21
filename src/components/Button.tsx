import React from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  variant?: "text" | "text-bg" | "filled" | "filled-dim" | "outlined";
  size?: "sm" | "md";
  color?: "info" | "success" | "warn" | "error";
}

export default function Button(props: ButtonProps) {
  const classes: string[] = ["rounded-lg", "select-none"];

  switch (props.variant ?? "filled") {
    case "text":
      classes.push(
        `
        text
        enabled:hover:text-primary-600
        dark:enabled:hover:text-primary-400
        disabled:text-disabled
        transition
        `
      );
      break;
    case "text-bg":
      classes.push(
        `
          text
          enabled:hover:bg-base-200
          dark:enabled:hover:bg-base-700
          disabled:text-disabled
          transition
          `
      );
      break;
    case "filled":
      classes.push(
        `
        bg-primary-800
        text-base-50
        enabled:hover:bg-primary-700
        disabled:text-disabled
        transition
        `
      );
      break;
    case "filled-dim":
      classes.push(
        `
          text-black
          bg-primary-200
          enabled:hover:bg-primary-300
          disabled:text-disabled
          dark:bg-primary-300
          dark:enabled:hover:bg-primary-400
          transition
          `
      );
      break;
    case "outlined":
      classes.push(
        `
        text
        ring-1
        ring-base-400
        enabled:hover:bg-base-200
        dark:ring-base-600
        dark:enabled:hover:bg-base-700
        disabled:text-disabled
        transition
        `
      );
      break;
    default:
      break;
  }

  switch (props.size ?? "md") {
    case "sm":
      classes.push("px-4 py-2 text-sm");
      break;
    case "md":
      classes.push("px-8 py-3");
      break;
    default:
      break;
  }

  switch (props.color) {
    case "info":
      classes.push(
        "bg-info-500 enabled:hover:bg-info-800 enabled:active:bg-info-700"
      );
      break;
    case "success":
      classes.push(
        "bg-success-500 enabled:hover:bg-success-800 enabled:active:bg-success-700"
      );
      break;
    case "warn":
      classes.push(
        "bg-warn-500 enabled:hover:bg-warn-800 enabled:active:bg-warn-700"
      );
      break;
    case "error":
      classes.push(
        "bg-error-500 enabled:hover:bg-error-800 enabled:active:bg-error-700"
      );
      break;
    default:
      break;
  }

  return (
    <button
      {...props}
      className={twMerge(classes.join(" "), props.className ?? "")}
    >
      {props.children}
    </button>
  );
}
