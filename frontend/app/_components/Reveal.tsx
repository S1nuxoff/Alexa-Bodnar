"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

type RevealVariant = "up" | "softScale";

function getInitialState(variant: RevealVariant) {
  switch (variant) {
    case "softScale":
      return { opacity: 0, y: 24, scale: 1.02 };
    default:
      return { opacity: 0, y: 32, scale: 0.992 };
  }
}

export default function Reveal({
  children,
  delay = 0,
  className = "",
  variant = "up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [allowAnimation, setAllowAnimation] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px) and (pointer: fine)");

    const sync = () => setAllowAnimation(media.matches);
    sync();

    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (prefersReducedMotion || !allowAnimation) {
    return <div className={className}>{children}</div>;
  }

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className={className}
        initial={getInitialState(variant)}
        whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.18, margin: "0px 0px -5% 0px" }}
        transition={{
          duration: 0.55,
          delay: delay / 1000,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{ willChange: "transform, opacity" }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
