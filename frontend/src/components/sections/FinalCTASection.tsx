"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TypewriterHeading } from "@/components/ui/TypewriterHeading";

export function FinalCTASection() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className="py-32 lg:py-48"
      style={{
        background:
          "linear-gradient(135deg, #d2fae5 0%, #b8f736 40%, #89e5f0 100%)",
      }}
    >
      <div className="max-w-200 mx-auto px-5 md:px-10 text-center">
        <TypewriterHeading
          text="Build an AI agent that knows your customers."
          italicWords={["knows your customers"]}
          className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-[-0.02em] text-foreground mb-6"
          as="h2"
        />

        <p
          className="reveal-up text-lg md:text-xl text-foreground max-w-140 mx-auto leading-relaxed mb-8"
          style={{ transitionDelay: "200ms" }}
        >
          We&apos;ll use your actual docs and customer data. No sales theatre.
          You&apos;ll leave with a working agent against your own content.
        </p>

        <a
          href="#"
          className="reveal-up btn-primary text-base px-8 py-3.5 hover:scale-[1.02]"
          style={{ transitionDelay: "300ms" }}
        >
          Book a demo
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
