"use client";
import { Play } from "lucide-react";
import { TypewriterHeading } from "@/components/ui/TypewriterHeading";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function HeroSection() {
  const sectionRef = useScrollReveal<HTMLElement>();

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen lg:min-h-175 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #89e5f0 0%, #c5f3f8 50%, #e8f9fb 100%)",
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(184,247,54,0.08), transparent)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-300 mx-auto px-5 md:px-10 pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-8">
          {/* Left: Text */}
          <div className="w-full lg:w-[45%] flex flex-col gap-6">
            {/* Badge */}
            <div className="reveal-up revealed inline-flex self-start">
              <span className="px-4 py-2 bg-white border-[1.5px] border-foreground rounded-full text-sm text-foreground">
                AI helper for exam testing
              </span>
            </div>

            {/* Headline */}
            <div className="reveal-up" style={{ transitionDelay: "200ms" }}>
              <TypewriterHeading
                text="AI teachers that actually help students learn."
                italicWords={["every"]}
                className="text-4xl md:text-5xl lg:text-[56px] font-normal leading-[1.1] tracking-[-0.02em] text-foreground"
                as="h1"
              />
            </div>

            {/* Subheadline */}
            <p
              className="reveal-up text-lg md:text-xl text-[#444] max-w-120 leading-relaxed"
              style={{ transitionDelay: "400ms" }}
            >
              Not a chatbot. Intelligent AI agents, personalized per student,
              with wildly high accuracy.
            </p>

            {/* CTAs */}
            <div
              className="reveal-up flex flex-wrap items-center gap-4"
              style={{ transitionDelay: "600ms" }}
            >
              <a href="#" className="btn-primary">
                Book a demo
                <svg
                  width="14"
                  height="14"
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
              <a href="#" className="btn-ghost">
                <Play size={16} fill="currentColor" />
                Join webinar
              </a>
            </div>

            {/* Trust bar */}
            <div
              className="reveal-up flex flex-wrap items-center gap-6 mt-4"
              style={{ transitionDelay: "800ms" }}
            >
              <span className="text-sm text-foreground">Trusted by</span>
              <div className="flex items-center gap-6">
                <span className="text-sm font-semibold tracking-wide">
                  UTO
                </span>
                <span className="text-sm font-medium">EduTest</span>
                <span className="text-sm font-semibold tracking-wider">
                  iTest
                </span>
                <span className="text-sm font-semibold">Erudit</span>
              </div>
            </div>
          </div>

          {/* Right: Chat demo */}
          <div
            className="w-full lg:w-[55%] lg:relative"
          >
            <div
              className="reveal-up lg:absolute lg:right-0 lg:top-0 w-full max-w-90 mx-auto lg:mx-0"
              style={{ transitionDelay: "800ms" }}
            >
              <div className="card-base shadow-offset-lg overflow-hidden bg-white">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e5e5e5]">
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-acid to-sky" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Bot (AI Teacher)
                    </p>
                    <span className="text-xs text-[#999]">AI Teacher</span>
                  </div>
                </div>

                {/* Chat content */}
                <div className="p-4 space-y-3">
                  {/* AI response */}
                  <div className="bg-white border border-[#e5e5e5] rounded-xl rounded-tr-sm p-3 max-w-[95%] ml-auto">
                    <p className="text-sm text-foreground leading-relaxed">
                      What is the formula for calculating the area of a circle?
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-[#999]">
                      <span className="font-mono">
                        Sources: Khan Academy, MathWorld
                      </span>
                    </div>
                  </div>

                  {/* User message */}
                  <div className="bg-saffron rounded-xl rounded-tl-sm p-3 max-w-[90%]">
                    <p className="text-sm text-foreground">
                      Formula is A = πr², where r is the radius of the circle.
                    </p>
                  </div>

                  {/* Context tags */}
                  <div className="pt-2">
                    <p className="text-xs text-[#999] mb-2 font-mono">
                      Personalizing for student · 1849ms
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 bg-lavender rounded-full text-xs text-foreground">
                        Role: Student
                      </span>
                      <span className="px-2.5 py-1 bg-mint rounded-full text-xs text-foreground">
                        Topic: Geometry
                      </span>
                      <span className="px-2.5 py-1 bg-saffron rounded-full text-xs text-foreground">
                        Difficulty: Medium
                      </span>
                      <span className="px-2.5 py-1 bg-pink rounded-full text-xs text-foreground">
                        Time: Afternoon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
