import { ArrowDownRight } from 'lucide-react';
import { BRAND_LOGO_SRC, HERO_CAMPAIGN_SRC } from '../data/catalog';

export function HeroSection() {
  return (
    <section
      id="top"
      className="border-b border-white/10 bg-[#0D0E10]"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Editorial Column */}
          <div className="flex flex-col justify-between gap-8 lg:col-span-5 lg:py-4">
            <div className="space-y-6">
              <div className="flex items-center gap-5">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#121212] p-1.5 sm:h-32 sm:w-32">
                  <img
                    src={BRAND_LOGO_SRC}
                    alt="EJDTB Members Only official brand mark"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium tracking-wide text-[#A1A1AA]">
                    Drop 04 · Autumn / Winter
                  </p>
                  <p className="font-display text-xl font-bold tracking-wide text-[#22C55E]">
                    EJDTB Members Only
                  </p>
                </div>
              </div>

              <h1 className="font-display text-[clamp(2.5rem,4.5vw,4.25rem)] font-bold leading-[0.95] tracking-tight text-[#F4F4F2] [text-wrap:balance]">
                Architectural Weight. Uncompromising Cut.
              </h1>

              <p className="max-w-lg text-base leading-relaxed text-[#A1A1AA]">
                Small-batch streetwear engineered from custom-milled 500gsm combed fleece,
                dry-waxed Japanese twill, and full-grain Melton wool. Built to hold
                structure season after season.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1">
                <a
                  href="#collection"
                  className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap shrink-0 rounded-md bg-[#16A34A] px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#15803D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22C55E]"
                >
                  <span>Shop Drop 04</span>
                  <ArrowDownRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="#craft"
                  className="inline-flex min-h-11 items-center whitespace-nowrap shrink-0 rounded-md border border-white/15 px-5 py-2.5 text-sm font-medium text-[#F4F4F2] transition-colors duration-150 hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]"
                >
                  Explore Craftsmanship
                </a>
              </div>
            </div>

            {/* Clean Typographic Garment Strip */}
            <dl className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              <div className="flex flex-col justify-between">
                <dt className="whitespace-nowrap text-xs text-[#A1A1AA]">Fleece Weight</dt>
                <dd className="mt-1 font-display text-xl font-bold tabular-nums text-[#F4F4F2]">
                  500 GSM
                </dd>
              </div>
              <div className="flex flex-col justify-between">
                <dt className="whitespace-nowrap text-xs text-[#A1A1AA]">Production</dt>
                <dd className="mt-1 font-display text-xl font-bold text-[#F4F4F2]">
                  Numbered
                </dd>
              </div>
              <div className="flex flex-col justify-between">
                <dt className="whitespace-nowrap text-xs text-[#A1A1AA]">Free Shipping</dt>
                <dd className="mt-1 font-display text-xl font-bold tabular-nums text-[#F4F4F2]">
                  $250+
                </dd>
              </div>
            </dl>
          </div>

          {/* Right Campaign Imagery Column */}
          <div className="relative min-h-[340px] overflow-hidden rounded-lg border border-white/10 bg-[#181A1C] lg:col-span-7 lg:min-h-[540px]">
            <img
              src={HERO_CAMPAIGN_SRC}
              alt="EJDTB Drop 04 model wearing heavyweight washed obsidian hoodie and waxed utility cargo trousers"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center lg:h-full"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0D0E10]/85 via-[#0D0E10]/15 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[#D4D4D8]">
                  Look 01 · Brutalist Concrete Series
                </p>
                <p className="text-sm font-semibold text-white">
                  Obsidian 500gsm Hoodie &amp; Waxed Utility Cargo
                </p>
              </div>
              <a
                href="#collection"
                className="whitespace-nowrap shrink-0 text-xs font-semibold text-[#22C55E] underline-offset-4 hover:underline"
              >
                Shop Look
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
