"use client";

import Marquee from "react-fast-marquee";
import { CheckCircle } from "lucide-react";

const items = [
  "100% guaranteed uptime",
  "End-to-end encryption",
  "All data stays in your environment",
  "No third-party access",
  "Regular security audits",
  "Compliance certifications",
  "No training on your data",
  "Data ownership control",
];

export function SecurityStrip() {
  return (
    <section className="w-full h-14 bg-acid flex items-center overflow-hidden">
      <Marquee speed={45} direction="right" gradient={false}>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 mx-4">
            <CheckCircle size={16} className="text-foreground" />
            <span className="text-sm sm:text-base font-medium text-foreground whitespace-nowrap">
              {item}
            </span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}
