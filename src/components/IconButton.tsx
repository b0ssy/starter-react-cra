import { twMerge } from "tailwind-merge";

export interface IconButtonProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  > {
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function IconButton(props: IconButtonProps) {
  const classes: string[] = [
    "text hover:opacity-50 cursor-pointer select-none",
  ];

  // Size
  switch (props.size ?? "md") {
    case "sm":
      classes.push("w-4 h-4");
      break;
    case "md":
      classes.push("w-5 h-5");
      break;
    case "lg":
      classes.push("w-6 h-6");
      break;
    default:
      break;
  }

  return (
    <span {...props} className={twMerge(classes.join(" "), props.className)}>
      {props.children}
    </span>
  );
}
