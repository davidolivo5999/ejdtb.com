import { BRAND_LOGO_SRC } from '../data/catalog';

export function Footer() {
  return (
    <footer className="bg-[#0D0E10] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-8 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <img
              src={BRAND_LOGO_SRC}
              alt="EJDTB Members Only logo"
              referrerPolicy="no-referrer"
              className="h-14 w-14 rounded-sm bg-[#141414] object-contain"
            />
            <div>
              <p className="font-display text-xl font-bold tracking-wide text-[#F4F4F2]">
                EJDTB Members Only
              </p>
              <p className="text-xs text-[#A1A1AA]">
                Independent Heavyweight Streetwear · Small-Batch Atelier
              </p>
            </div>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-6 text-xs text-[#A1A1AA]">
            <a href="#collection" className="hover:text-[#F4F4F2]">
              Drop 04 Catalog
            </a>
            <a href="#craft" className="hover:text-[#F4F4F2]">
              Craftsmanship
            </a>
            <a href="#sizing" className="hover:text-[#F4F4F2]">
              Fit &amp; Care
            </a>
            <a href="#members" className="hover:text-[#F4F4F2]">
              Members Access
            </a>
          </nav>
        </div>

        <div className="mt-6 flex flex-col justify-between gap-3 text-xs text-[#71717A] sm:flex-row sm:items-center">
          <p>© 2026 EJDTB Members Only. All rights reserved.</p>
          <p>Free express shipping on orders over $250 · 14-day unworn returns</p>
        </div>
      </div>
    </footer>
  );
}
