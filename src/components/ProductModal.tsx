import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { GarmentSize, Product } from '../types/store';
import { formatCurrency } from '../utils/store';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToBag: (product: Product, size: GarmentSize, colorway: string) => void;
}

export function ProductModal({ product, onClose, onAddToBag }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<GarmentSize>('L');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showSizing, setShowSizing] = useState(false);

  useEffect(() => {
    if (!product) return;
    const firstAvailableSize =
      product.sizes.find((s) => s === 'L' && (product.stockBySize[s] ?? 0) > 0) ??
      product.sizes.find((s) => (product.stockBySize[s] ?? 0) > 0) ??
      product.sizes[0];
    setSelectedSize(firstAvailableSize);
    setSelectedColor(product.colorways[0]);
    setShowSizing(false);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  const stockCount = product.stockBySize[selectedSize] ?? 0;
  const stockLabel =
    stockCount === 0
      ? 'Out of Stock'
      : stockCount <= 4
      ? `Low Stock · ${stockCount} Left`
      : 'In Stock · Ready to Ship';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative grid max-h-[90vh] w-full max-w-4xl grid-cols-1 overflow-y-auto rounded-lg border border-white/15 bg-[#141517] lg:grid-cols-12">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-[#0D0E10]/90 text-[#F4F4F2] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A]"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Image Pane */}
        <div className="flex items-center justify-center bg-[radial-gradient(circle_at_50%_45%,#2B2E34_0%,#181A1D_75%,#131518_100%)] p-6 lg:col-span-6">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="max-h-[480px] min-h-[280px] w-full object-contain object-center"
          />
        </div>

        {/* Right Contiguous Purchase Module */}
        <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:col-span-6">
          <div className="space-y-5">
            <div className="space-y-1.5 pr-10">
              <p className="text-xs font-medium text-[#A1A1AA]">
                {product.category} <span aria-hidden="true">·</span> {product.fit}
              </p>
              <h2
                id="pdp-modal-title"
                className="font-display text-3xl font-bold tracking-tight text-[#F4F4F2]"
              >
                {product.name}
              </h2>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xl font-semibold tabular-nums text-[#F4F4F2]">
                  {formatCurrency(product.price)}
                </span>
                <span
                  className={`text-xs font-medium ${
                    stockCount <= 4 ? 'text-amber-400' : 'text-[#22C55E]'
                  }`}
                >
                  {stockLabel}
                </span>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-[#D4D4D8]">{product.description}</p>

            {/* Colorway Selection */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#A1A1AA]">
                Colorway: <span className="text-[#F4F4F2]">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colorways.map((color) => {
                  const active = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-pressed={active}
                      className={`min-h-9 whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? 'border-[#16A34A] bg-[#16A34A]/15 text-[#F4F4F2]'
                          : 'border-white/10 bg-[#181A1C] text-[#A1A1AA] hover:border-white/25 hover:text-[#F4F4F2]'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#A1A1AA]">
                  Select Size: <span className="text-[#F4F4F2]">{selectedSize}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowSizing((prev) => !prev)}
                  aria-expanded={showSizing}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#22C55E] hover:underline"
                >
                  <span>Fit &amp; Measurements</span>
                  {showSizing ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((size) => {
                  const count = product.stockBySize[size] ?? 0;
                  const active = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={count === 0}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={active}
                      className={`min-h-10 rounded-md border text-xs font-semibold tabular-nums transition-colors ${
                        count === 0
                          ? 'cursor-not-allowed border-white/5 bg-[#101113] text-[#52525B] line-through'
                          : active
                          ? 'border-[#16A34A] bg-[#16A34A] text-white'
                          : 'border-white/15 bg-[#181A1C] text-[#E4E4E7] hover:border-white/30'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {showSizing && (
                <p className="rounded-md border border-white/10 bg-[#0D0E10] p-3 text-xs leading-relaxed text-[#A1A1AA]">
                  {product.measurements}
                </p>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 text-xs text-[#A1A1AA]">
              <p className="font-medium text-[#E4E4E7]">Construction</p>
              <p className="mt-1">{product.fabricSpec}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={stockCount === 0}
            onClick={() => {
              onAddToBag(product, selectedSize, selectedColor);
              onClose();
            }}
            className="min-h-12 w-full whitespace-nowrap rounded-md bg-[#16A34A] px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#15803D] disabled:cursor-not-allowed disabled:bg-[#27272A] disabled:text-[#71717A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#22C55E]"
          >
            {stockCount === 0
              ? 'Out of Stock'
              : `Add to Bag — ${formatCurrency(product.price)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
