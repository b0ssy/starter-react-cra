import { useState, useEffect } from "react";

export interface RenderOnceProps {
  show?: boolean;

  // Force render children even if show===false initially
  force?: boolean;

  children?: React.ReactNode;
}

export default function RenderOnce(props: RenderOnceProps) {
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (!render && props.show) {
      setRender(true);
    }
  }, [render, props.show]);

  return (
    <div className={!props.show ? "hidden" : ""}>
      {render || props.force ? props.children : null}
    </div>
  );
}
