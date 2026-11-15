import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { BRAND_LOGO_SRC } from '../data/catalog';

interface NavbarProps {
  itemCount: number;
  onOpenBag: () => void;
}

const NAV_LINKS = [
  { label: 'Collection', href: '#collection' },
  { label: 'Craft', href: '#craft' },
  { label: 'Sizing', href: '#sizing' },
  { label: 'Members', href: '#members' },
];

export function Navbar({ itemCount, onOpenBag }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0D0E10]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Lockup */}
        <a
          href="#top"
          className="flex items-center gap-3 whitespace-nowrap shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16A34A]"
        >
          <img
            src={BRAND_LOGO_SRC}
            alt="EJDTB Members Only crest"
            referrerPolicy="no-referrer"
            className="h-10 w-10 rounded-md bg-[#121212] object-contain"
          />
          <span className="font-display text-2xl font-bold tracking-wider text-[#F4F4F2]">
            EJDTB
          </span>
        </a>

        {/* Zone 2: 4 Concise Single-Line Nav Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-7 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap shrink-0 text-sm font-medium text-[#A1A1AA] underline-offset-8 transition-colors duration-150 hover:text-[#F4F4F2] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#16A34A]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            aria-label={`Open shopping bag, ${itemCount} items`}
            className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap shrink-0 rounded-md bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#15803D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22C55E]"
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            <span className="tabular-nums">Bag ({itemCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 text-[#F4F4F2] transition-colors hover:bg-white/5 md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-white/10 bg-[#121316] px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-[#E4E4E7] hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
