import { useState } from 'react';
import { Shirt } from 'lucide-react';
import type { GarmentSize, Product } from '../types/store';
import { formatCurrency } from '../utils/store';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product, size: GarmentSize) => void;
}

export function ProductCard({ product, onSelect, onQuickAdd }: ProductCardProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const defaultSize: GarmentSize =
    product.sizes.find((s) => s === 'L' && (product.stockBySize[s] ?? 0) > 0) ??
    product.sizes.find((s) => (product.stockBySize[s] ?? 0) > 0) ??
    product.sizes[0];

  const handleQuickAdd = () => {
    onQuickAdd(product, defaultSize);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-[#181A1C] transition-transform duration-200 hover:-translate-y-0.5 hover:border-white/20">
      {/* Studio Product Image (4:5 uncropped cutout stage) */}
      <button
        type="button"
        onClick={() => onSelect(product)}
        aria-label={`Inspect ${product.name}`}
        className="relative aspect-[4/5] w-full overflow-hidden bg-[radial-gradient(circle_at_50%_45%,#2B2E34_0%,#181A1D_72%,#131518_100%)] p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]"
      >
        {!imgFailed ? (
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#181A1C] to-[#111214] p-6 text-center">
            <Shirt className="h-8 w-8 text-[#22C55E]" aria-hidden="true" />
            <span className="text-sm font-medium text-[#D4D4D8]">{product.fallbackLabel}</span>
          </div>
        )}
      </button>

      {/* Clean Unboxed Metadata & Purchase Actions */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs text-[#A1A1AA]">
            <span className="truncate whitespace-nowrap">
              {product.category} <span aria-hidden="true">·</span> {product.fit}
            </span>
            {product.tag && (
              <span className="shrink-0 whitespace-nowrap font-medium text-[#22C55E]">
                {product.tag}
              </span>
            )}
          </div>

          <div className="flex min-h-[2.75rem] items-start justify-between gap-3">
            <h3 className="font-sans text-base font-semibold leading-snug text-[#F4F4F2]">
              <button
                type="button"
                onClick={() => onSelect(product)}
                className="text-left hover:text-[#22C55E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]"
              >
                {product.name}
              </button>
            </h3>
            <span className="shrink-0 text-[15px] font-semibold tabular-nums text-[#F4F4F2]">
              {formatCurrency(product.price)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => onSelect(product)}
            className="min-h-10 flex-1 whitespace-nowrap rounded-md border border-white/15 px-3 py-2 text-xs font-medium text-[#E4E4E7] transition-colors duration-150 hover:border-white/30 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]"
          >
            Select Size
          </button>
          <button
            type="button"
            onClick={handleQuickAdd}
            className="min-h-10 flex-1 whitespace-nowrap rounded-md bg-[#16A34A] px-3 py-2 text-xs font-semibold text-white transition-colors duration-150 hover:bg-[#15803D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22C55E]"
          >
            {justAdded ? `Added (${defaultSize})` : `Quick Add · ${defaultSize}`}
          </button>
        </div>
      </div>
    </article>
  );
}
