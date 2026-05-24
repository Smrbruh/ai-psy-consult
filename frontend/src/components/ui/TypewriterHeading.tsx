"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterHeadingProps {
  text: string;
  italicWords?: string[];
  className?: string;
  as?: "h1" | "h2" | "h3";
  enabled?: boolean;
}

export function TypewriterHeading({
  text,
  italicWords = [],
  className = "",
  as: Tag = "h2",
  enabled = true,
}: TypewriterHeadingProps) {
  const [displayed, setDisplayed] = useState(enabled ? "" : text);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLHeadingElement>(null);
  const visibleText = enabled ? displayed : text;

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled, started, text]);

  useEffect(() => {
    if (!started) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayed(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [started, text]);

  const renderText = () => {
    if (!visibleText) return <span className="opacity-0">{text[0]}</span>;

    let remaining = visibleText;
    const parts: React.ReactNode[] = [];
    let key = 0;

    while (remaining.length > 0) {
      let foundItalic = false;

      for (const word of italicWords) {
        const idx = remaining.indexOf(word);
        if (idx === 0) {
          parts.push(
            <em
              key={key++}
              className="font-serif italic"
            >
              {word}
            </em>
          );
          remaining = remaining.slice(word.length);
          foundItalic = true;
          break;
        } else if (idx > 0) {
          parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
          parts.push(
            <em
              key={key++}
              className="font-serif italic"
            >
              {word}
            </em>
          );
          remaining = remaining.slice(idx + word.length);
          foundItalic = true;
          break;
        }
      }

      if (!foundItalic) {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
    }

    return parts;
  };

  return (
    <Tag ref={ref as React.Ref<HTMLHeadingElement>} className={className}>
      {renderText()}
      {started && enabled && displayed.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </Tag>
  );
}
