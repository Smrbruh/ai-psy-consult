"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TypewriterHeading } from "@/components/ui/TypewriterHeading";

const stats = [
  {
    value: "92%",
    label: "resolution rate across customer queries",
    company: "Smokeball [Legaltech]",
  },
  {
    value: "2\u00d7",
    label: "qualified leads from self-serve, with the overnight queue cleared",
    company: "Coassemble [EdTech]",
  },
  {
    value: "+37",
    label: "point lift in NPS after deploying in product",
    company: "Smokeball [Legaltech]",
  },
  {
    value: "60%",
    label: "of ops time reclaimed, with 1 in 4 customers self-serving",
    company: "ChangeEngine [HR Tech]",
  },
];

export function StatsSection() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="bg-white py-20 lg:py-24">
      <div className="max-w-300 mx-auto px-5 md:px-10">
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-12 mb-12">
          <div className="lg:w-[60%]">
            <TypewriterHeading
              text="Agents your customers actually trust."
              italicWords={["actually"]}
              className="text-3xl md:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-[-0.02em] text-foreground"
              as="h2"
            />
          </div>
          <p className="lg:w-[40%] text-base text-[#444] leading-relaxed lg:text-right">
            Not a chatbot. Intelligent AI agents, personalized per customer,
            with wildly high accuracy.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="reveal-up bg-saffron border-[1.5px] border-foreground rounded-xl p-6 shadow-offset-lg cursor-default"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <p className="text-3xl md:text-4xl font-medium text-foreground mb-3">
                {stat.value}
              </p>
              <p className="text-base text-foreground leading-snug mb-4">
                {stat.label}
              </p>
              <p className="text-[13px] font-mono text-[#999]">
                {stat.company}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
