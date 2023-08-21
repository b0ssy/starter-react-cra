import { useRef, useEffect } from "react";

export interface ClickOutsideProps {
  children: React.ReactNode;
  onClickOutside?: () => void;
}

export default function ClickOutside(props: ClickOutsideProps) {
  const ref = useRef(null);

  const { onClickOutside } = props;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !(ref.current as any).contains(event.target)) {
        if (onClickOutside) {
          onClickOutside();
        }
      }
    };

    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [onClickOutside]);

  return <div ref={ref}>{props.children}</div>;
}
