"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TypewriterHeading } from "@/components/ui/TypewriterHeading";
import { ArrowRight } from "lucide-react";

export function BrainfishDifferenceSection() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      className="py-20 lg:py-28"
      style={{
        background: "linear-gradient(180deg, #fce5b1 0%, #fcd683 100%)",
      }}
    >
      <div className="max-w-300 mx-auto px-5 md:px-10 text-center">
        {/* Eyebadge */}
        <div className="reveal-up inline-flex mb-6">
          <span className="px-4 py-2 bg-white border-[1.5px] border-foreground rounded-full text-sm font-medium text-foreground">
            THE LOGO DIFFERENCE
          </span>
        </div>

        {/* Headline */}
        <div className="reveal-up mb-6" style={{ transitionDelay: "200ms" }}>
          <TypewriterHeading
            text="Great agents start with the right context."
            italicWords={["right context"]}
            className="text-3xl md:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-[-0.02em] text-foreground max-w-175 mx-auto"
            as="h2"
          />
        </div>

        {/* Body */}
        <p
          className="reveal-up text-lg md:text-xl text-foreground max-w-160 mx-auto leading-relaxed mb-8"
          style={{ transitionDelay: "400ms" }}
        >
          Brainfish gives every AI agent the right context to answer well. We
          turn your demos, calls, tickets, and Slack into living knowledge, and
          route the exact slice each agent needs at the moment of the question.
        </p>

        {/* CTA */}
        <a
          href="#"
          className="reveal-up btn-ghost inline-flex items-center gap-2 mb-12"
          style={{ transitionDelay: "500ms" }}
        >
          Explore the product
          <ArrowRight size={16} />
        </a>

        {/* Image */}
        <div
          className="reveal-up max-w-225 mx-auto"
          style={{ transitionDelay: "600ms" }}
        >
          <div className="card-base shadow-offset-lg overflow-hidden">
            <Image
              src="/images/knowledge.jpg"
              alt="Knowledge Review Dashboard"
              width={900}
              height={500}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
