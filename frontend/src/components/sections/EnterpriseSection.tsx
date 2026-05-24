"use client";

import { useEffect, useRef } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TypewriterHeading } from "@/components/ui/TypewriterHeading";

const complianceCards = [
  {
    title: "SOC 2 Type II",
    description: "Audited annually by an independent third party.",
  },
  {
    title: "GDPR",
    description: "EU data residency. Right-to-delete built in.",
  },
  {
    title: "ISO 27001",
    description: "Information security management certified.",
  },
  {
    title: "Data residency",
    description: "Choose US, EU, or AU hosting. Your data stays in-region.",
  },
];

const integrations = [
  { name: "Slack", action: "Ask in Slack", color: "#4A154B" },
  { name: "Zendesk", action: "Draft & deflect", color: "#03363D" },
  { name: "Intercom", action: "Live conversations", color: "#1F8DED" },
  { name: "Microsoft Teams", action: "Answers in Teams", color: "#6264A7" },
  { name: "Hubspot", action: "Customer context", color: "#FF7A59" },
  { name: "Notion", action: "Docs as source", color: "#000000" },
  { name: "Google Drive", action: "Shared drives", color: "#4285F4" },
  { name: "ReadMe", action: "API & dev docs", color: "#0D0D0D" },
  { name: "Claude MCP", action: "Native MCP", color: "#D4A574" },
];

export function EnterpriseSection() {
  const sectionRef = useScrollReveal<HTMLElement>();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dot grid background
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
    >
      {/* Dot grid background */}
      <div
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{ background: "#1a1a1a" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-300 mx-auto px-5 md:px-10 py-20 lg:py-28">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-6 lg:gap-12 mb-12">
          <div className="lg:w-[50%]">
            <TypewriterHeading
              text="Enterprise-ready on day one."
              italicWords={["on day one"]}
              className="text-3xl md:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-[-0.02em] text-white"
              as="h2"
            />
          </div>
          <p className="lg:w-[50%] text-lg text-white/70 leading-relaxed lg:text-right">
            Private tenants. Regional data residency. SSO. Sources on every
            answer. Your knowledge stays yours.
          </p>
        </div>

        {/* Compliance grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {complianceCards.map((card, i) => (
            <div
              key={i}
              className="reveal-up bg-white/6 border border-white/12 rounded-xl p-6 transition-all duration-150 hover:bg-white/10 hover:border-white/20"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <CheckCircle2 size={24} className="text-acid mb-3" />
              <h3 className="text-xl font-medium text-white mb-2">
                {card.title}
              </h3>
              <p className="text-base text-white/60">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Integrations */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left text */}
          <div className="lg:w-[40%]">
            <TypewriterHeading
              text="Plugs into the stack you already pay for."
              italicWords={["already pay for"]}
              className="text-3xl md:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-[-0.02em] text-white mb-4"
              as="h2"
            />
            <p className="text-base text-white/60 leading-relaxed mb-6">
              Brainfish doesn&apos;t replace Zendesk, Intercom, or your
              knowledge base. It makes them smarter. It reads from and writes to
              the tools your team already uses.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-white border-b border-white text-sm font-medium hover:border-b-2 transition-all"
            >
              Browse all integrations
              <ArrowRight size={14} />
            </a>
          </div>

          {/* Integration grid */}
          <div className="lg:w-[60%] grid grid-cols-2 md:grid-cols-3 gap-3">
            {integrations.map((app, i) => (
              <div
                key={i}
                className="reveal-up bg-white/6 border border-white/12 rounded-xl p-5 transition-all duration-150 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 cursor-pointer"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div
                  className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: app.color }}
                >
                  {app.name[0]}
                </div>
                <h4 className="text-base font-medium text-white mb-1">
                  {app.name}
                </h4>
                <p className="text-sm text-white/50">{app.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
