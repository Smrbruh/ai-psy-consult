"use client";

const productLinks = [
  "AI Support Agents",
  "Knowledge",
  "Channels",
  "Analytics",
];

const companyLinks = [
  "Customers",
  "Pricing",
  "About",
  "Blog",
];

export function Footer() {
  return (
    <footer className="bg-ash border-t border-[#e5e5e5]">
      {/* Main content */}
      <div className="max-w-300 mx-auto px-5 md:px-10 pt-16 pb-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left */}
          <div className="lg:w-[50%]">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-semibold text-foreground">
                Logo
              </span>
            </div>

            <p className="text-base text-[#666] mb-4">
              AI exam helper.
              <br />
              Built in Astana. Deployed globally.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-4">
              {/* LinkedIn */}
              <a href="#" className="text-[#999] hover:text-foreground transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* X / Twitter */}
              <a href="#" className="text-[#999] hover:text-foreground transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right - Links */}
          <div className="lg:w-[50%] flex gap-12 lg:gap-16">
            {/* Product */}
            <div>
              <h4 className="text-sm font-medium text-[#999] uppercase tracking-wider mb-4">
                Product
              </h4>
              <ul className="space-y-3">
                {productLinks.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-foreground hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-medium text-[#999] uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-foreground hover:underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#e5e5e5]">
        <div className="max-w-300 mx-auto px-5 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#999]">
            &copy; 2026 Logo. Kazakstan, Astana. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-[#999]">
            <a href="#" className="hover:text-foreground hover:underline">
              Terms
            </a>
            <a href="#" className="hover:text-foreground hover:underline">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
