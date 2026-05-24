"use client";

import { useEffect, useRef, useState } from "react";

export function useTypewriter<T extends HTMLElement>(
  text: string,
  enabled: boolean,
  charDelay = 40
) {
  const ref = useRef<T>(null);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!enabled) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayed(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, charDelay);

    return () => clearInterval(interval);
  }, [enabled, text, charDelay]);

  return { ref, displayed };
}
