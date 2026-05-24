"use client";

import Marquee from "react-fast-marquee";

const logos = [
  { name: "UTO", style: "font-semibold tracking-wide" },
  { name: "EduTest", style: "font-medium" },
  { name: "iTest", style: "font-semibold tracking-wider" },
  { name: "Erudit", style: "font-semibold" },
  { name: "Learning Inc", style: "font-medium" },
  { name: "Academia", style: "font-medium" },
  { name: "Khan Academy", style: "font-medium" },
  { name: "Duolingo", style: "font-medium" },
  { name: "Coursera", style: "font-medium" },
  { name: "edX", style: "font-medium" },
];

export function LogoTicker() {
  return (
    <section className="w-full h-20 border-y border-[#e5e5e5] bg-white flex items-center">
      <Marquee speed={30} gradient={false}>
        {logos.map((logo, i) => (
          <span
            key={i}
            className={`mx-8 text-foreground text-sm md:text-base ${logo.style} opacity-60 hover:opacity-100 hover:grayscale-0 hover:cursor-pointer transition-opacity`}
          >
            {logo.name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}
