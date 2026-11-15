import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { BRAND_LOGO_SRC, CRAFT_ATELIER_SRC } from '../data/catalog';
import { validateMemberEmail } from '../utils/store';

export function CraftSection() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateMemberEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubscribedEmail(email.trim());
    setEmail('');
  };

  return (
    <section
      id="craft"
      className="border-b border-white/10 bg-[#111214] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12">
          {/* Left Atelier Documentary Photograph */}
          <div className="overflow-hidden rounded-lg border border-white/10 bg-[#181A1C] lg:col-span-6">
            <img
              src={CRAFT_ATELIER_SRC}
              alt="EJDTB atelier cutting table with stacked 500gsm black fleece, dark green thread spools, and forged shears"
              referrerPolicy="no-referrer"
              className="h-full min-h-[320px] w-full object-cover object-center"
            />
          </div>

          {/* Right Craftsmanship & Members Only Access */}
          <div className="flex flex-col justify-between gap-8 lg:col-span-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#A1A1AA]">
                  02. Atelier &amp; Standards
                </p>
                <h2 className="font-display text-3xl font-bold tracking-tight text-[#F4F4F2] sm:text-4xl">
                  Built for Longevity, Not Cycles
                </h2>
              </div>

              <p className="text-base leading-relaxed text-[#D4D4D8]">
                Every EJDTB Members Only garment starts from raw custom-knitted yardage.
                We mill our 500gsm French terry for minimal shrinkage and pair each cut with
                bar-tacked stress seams, Riri brushed hardware, and numbered woven interior tags.
              </p>

              {/* Sizing & Construction Reference */}
              <div id="sizing" className="grid grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <h3 className="font-sans text-sm font-semibold text-[#F4F4F2]">
                    Boxy Architectural Block
                  </h3>
                  <p className="text-xs leading-relaxed text-[#A1A1AA]">
                    Dropped shoulders and cropped body lengths create clean drape over cargos.
                    Take your true size for the intended silhouette.
                  </p>
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans text-sm font-semibold text-[#F4F4F2]">
                    Care &amp; Enzyme Wash
                  </h3>
                  <p className="text-xs leading-relaxed text-[#A1A1AA]">
                    Pre-shrunk through cold enzyme baths. Machine wash cold inside-out and
                    dry flat to preserve heavy rib tension.
                  </p>
                </div>
              </div>
            </div>

            {/* Members Only Private Drop Dispatch */}
            <div
              id="members"
              className="rounded-lg border border-white/10 bg-[#181A1C] p-6"
            >
              <div className="flex items-center gap-4">
                <img
                  src={BRAND_LOGO_SRC}
                  alt="EJDTB Members Only emblem"
                  referrerPolicy="no-referrer"
                  className="h-14 w-14 shrink-0 rounded-md bg-[#121212] object-contain"
                />
                <div>
                  <h3 className="font-display text-xl font-bold text-[#F4F4F2]">
                    Members Only Private Dispatch
                  </h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Receive 24-hour early access codes before public release of Drop 05.
                  </p>
                </div>
              </div>

              {subscribedEmail ? (
                <div className="mt-4 flex items-center gap-2.5 rounded-md border border-[#16A34A]/40 bg-[#16A34A]/10 px-4 py-3 text-xs font-medium text-[#E4E4E7]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                  <span>
                    Access registered for <strong>{subscribedEmail}</strong>. Watch your inbox before Drop 05.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleDispatchSubmit} noValidate className="mt-4">
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <label htmlFor="members-email" className="sr-only">
                      Email address for Members Only early access
                    </label>
                    <input
                      id="members-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email for private access"
                      className="h-11 flex-1 rounded-md border border-white/15 bg-[#0D0E10] px-3.5 text-sm text-[#F4F4F2] placeholder-[#71717A] focus:border-[#16A34A] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="min-h-11 whitespace-nowrap shrink-0 rounded-md bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#15803D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22C55E]"
                    >
                      Request Access
                    </button>
                  </div>
                  {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
