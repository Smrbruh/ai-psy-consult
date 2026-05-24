"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    const elements = el.querySelectorAll(".reveal-up");
    if (elements.length === 0) {
      observer.observe(el);
    } else {
      elements.forEach((child) => observer.observe(child));
    }

    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
