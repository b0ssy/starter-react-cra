import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

import IconButton from "./IconButton";

export interface ThemeIconProps {
  themeMode: "light" | "dark";
  onChange: (themeMode: "light" | "dark") => void;
}

export default function ThemeIcon(props: ThemeIconProps) {
  return (
    <IconButton
      size="lg"
      onClick={() => {
        props.onChange(props.themeMode === "light" ? "dark" : "light");
      }}
    >
      {props.themeMode === "light" && <SunIcon />}
      {props.themeMode === "dark" && <MoonIcon />}
    </IconButton>
  );
}
