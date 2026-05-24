"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TypewriterHeading } from "@/components/ui/TypewriterHeading";

const features = [
  {
    number: "1. Build",
    title: "Solve complex support this week.",
    italic: ["complex"],
    body: "Go from zero to a fully deployed AI support agent in hours, not months. No engineering sprint required.",
    bullets: [
      "Connect your existing docs and knowledge base in minutes",
      "Configure your agent's scope, tone, and escalation rules",
      "Deploy to your support channels the same day",
      "Iterate live without taking anything offline",
    ],
    image: "/images/build.jpg",
    imageLeft: false,
  },
  {
    number: "2. Grow",
    title: "Make support your best growth tool.",
    italic: ["growth tool"],
    body: "Personalize every answer with live account, product, and user context. Turn questions into qualified pipeline, deeper adoption, and higher NPS, without lifting a finger.",
    bullets: [
      "Tailor answers by plan, role, region, or account health",
      "Surface upsells and next-best actions inside the chat",
      "Route high-value accounts straight to a human owner",
      "Keep customer data scoped, audited, and never used for training",
    ],
    image: "/images/grow.jpg",
    imageLeft: true,
  },
  {
    number: "3. Refine",
    title: "Measure what works. Fix what doesn't.",
    italic: ["works"],
    body: "Built-in evaluation analytics show you exactly where your agents are performing and how to fix gaps, so every update makes a real difference.",
    bullets: [
      "Track resolution rates, deflection, and customer satisfaction",
      "Surface the questions your knowledge layer isn't answering",
      "Get recommendations to improve specific agent responses",
      "Close the loop between insights and content updates",
    ],
    image: "/images/refine.jpg",
    imageLeft: false,
  },
];

export function B2BComplexitySection() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section ref={ref} className="bg-white py-20 lg:py-28">
      <div className="max-w-300 mx-auto px-5 md:px-10">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <TypewriterHeading
            text="Brainfish AI agents are designed for B2B complexity"
            italicWords={["B2B complexity"]}
            className="text-3xl md:text-4xl lg:text-5xl font-normal leading-[1.15] tracking-[-0.02em] text-foreground max-w-175 mx-auto"
            as="h2"
          />
          <p className="mt-4 text-lg md:text-xl text-[#444] max-w-160 mx-auto leading-relaxed">
            Deliver winning agents into any B2B channel; chat, email, in-product,
            and Slack. Personalize them to every customer.
          </p>
        </div>

        {/* Feature blocks */}
        <div className="space-y-20 lg:space-y-28">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`reveal-up flex flex-col ${
                feature.imageLeft ? "lg:flex-row-reverse" : "lg:flex-row"
              } gap-10 lg:gap-16 items-center`}
            >
              {/* Text */}
              <div className="w-full lg:w-[45%]">
                <p className="text-sm font-medium text-[#999] mb-3">
                  {feature.number}
                </p>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-foreground leading-[1.2] mb-4">
                  {feature.title.split(" ").map((word, wi) => {
                    const cleanWord = word.replace(/\.$/, "");
                    const isItalic = feature.italic.some(
                      (iw) =>
                        cleanWord.toLowerCase().includes(iw.toLowerCase()) ||
                        iw.toLowerCase().includes(cleanWord.toLowerCase())
                    );
                    return (
                      <span key={wi}>
                        {isItalic ? (
                          <em className="font-serif italic">
                            {word}
                          </em>
                        ) : (
                          word
                        )}{" "}
                      </span>
                    );
                  })}
                </h3>
                <p className="text-base text-[#444] leading-relaxed mb-6">
                  {feature.body}
                </p>
                <ul className="space-y-3">
                  {feature.bullets.map((bullet, bi) => (
                    <li
                      key={bi}
                      className="flex items-start gap-3 text-base text-foreground"
                    >
                      <span className="text-acid mt-1 shrink-0">—</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image */}
              <div className="w-full lg:w-[55%]">
                <div className="card-base shadow-offset-lg overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
