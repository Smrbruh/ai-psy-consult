"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TypewriterHeading } from "@/components/ui/TypewriterHeading";
import { ArrowRight } from "lucide-react";

export function TestimonialSection() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="bg-white py-20 lg:py-28">
      <div className="max-w-225 mx-auto px-5 md:px-10">
        {/* Eyebrow */}
        <p className="reveal-up text-sm text-[#999] mb-6">
          But don&apos;t take our word for it
        </p>

        {/* Quote */}
        <div className="reveal-up mb-10">
          <TypewriterHeading
            text="Brainfish freed our Customer Care team from handling routine queries so they could focus on solving the complex challenges our community faces that truly required human expertise."
            italicWords={["focus on solving the complex challenges"]}
            className="text-2xl md:text-3xl lg:text-4xl font-normal leading-[1.2] tracking-[-0.01em] text-foreground"
            as="h2"
          />
        </div>

        {/* Attribution row */}
        <div
          className="reveal-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
          style={{ transitionDelay: "200ms" }}
        >
          {/* Person */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-linear-to-br from-acid to-sky" />
            <div>
              <p className="text-lg font-medium text-foreground">
                Elisha Anderton
              </p>
              <p className="text-sm text-[#666]">COO at CareMaster</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-8">
            {[
              { value: "76%", label: "resolution rate" },
              { value: "2.5\u00d7", label: "resolution lift" },
              { value: "+23%", label: "user growth" },
            ].map((metric, i) => (
              <div key={i}>
                <p className="text-2xl font-medium text-foreground">
                  {metric.value}
                </p>
                <p className="text-sm text-[#999]">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <a
          href="#"
          className="reveal-up inline-flex items-center gap-2 mt-8 text-link text-sm font-medium"
          style={{ transitionDelay: "300ms" }}
        >
          Read more customer stories
          <ArrowRight size={14} />
        </a>
      </div>
    </section>
  );
}
