"use client";
import { useRef, useEffect, useState } from "react";

export default function SectionPreview({ children }: { children: React.ReactNode }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(300);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setHeight(el.scrollHeight * 0.5);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="rounded-2xl border border-neutral-800 bg-white overflow-hidden"
      style={{ height }}
    >
      <div
        ref={innerRef}
        style={{
          transform: "scale(0.5)",
          transformOrigin: "top left",
          width: "200%",
          pointerEvents: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
