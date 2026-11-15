import { Search, X } from 'lucide-react';
import { CATEGORIES } from '../data/catalog';
import type { Category, GarmentSize, Product, SortOption } from '../types/store';
import { ProductCard } from './ProductCard';

interface CollectionSectionProps {
  products: Product[];
  category: Category;
  query: string;
  sort: SortOption;
  onCategoryChange: (category: Category) => void;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: SortOption) => void;
  onResetFilters: () => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product, size: GarmentSize) => void;
}

export function CollectionSection({
  products,
  category,
  query,
  sort,
  onCategoryChange,
  onQueryChange,
  onSortChange,
  onResetFilters,
  onSelectProduct,
  onQuickAdd,
}: CollectionSectionProps) {
  return (
    <section
      id="collection"
      className="border-b border-white/10 bg-[#0D0E10] py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#A1A1AA]">
              01. Autumn / Winter Release
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#F4F4F2] sm:text-4xl">
              Drop 04 Collection
            </h2>
          </div>

          <p className="text-sm tabular-nums text-[#A1A1AA]">
            Showing {products.length} {products.length === 1 ? 'garment' : 'garments'}
          </p>
        </div>

        {/* Interactive Filter Tabs, Search & Sort Toolbar */}
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            role="group"
            aria-label="Filter garments by category"
            className="flex flex-wrap items-center gap-1.5 rounded-lg bg-[#141517] p-1 border border-white/10"
          >
            {CATEGORIES.map((cat) => {
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategoryChange(cat)}
                  aria-pressed={active}
                  className={`min-h-9 whitespace-nowrap shrink-0 rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#16A34A] ${
                    active
                      ? 'bg-[#16A34A] text-white'
                      : 'text-[#A1A1AA] hover:text-[#F4F4F2]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:w-64">
              <label htmlFor="catalog-search" className="sr-only">
                Search garments
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]"
                aria-hidden="true"
              />
              <input
                id="catalog-search"
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search sets, tees, jackpot..."
                className="h-10 w-full rounded-md border border-white/10 bg-[#141517] pl-9 pr-9 text-sm text-[#F4F4F2] placeholder-[#71717A] focus:border-[#16A34A] focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => onQueryChange('')}
                  aria-label="Clear search query"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#A1A1AA] hover:text-[#F4F4F2]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="catalog-sort" className="text-xs text-[#A1A1AA] whitespace-nowrap">
                Sort by
              </label>
              <select
                id="catalog-sort"
                value={sort}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="h-10 rounded-md border border-white/10 bg-[#141517] px-3 text-sm text-[#F4F4F2] focus:border-[#16A34A] focus:outline-none"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4-Column Product Grid or Empty State */}
        {products.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-white/10 bg-[#141517] px-6 py-16 text-center">
            <p className="font-display text-2xl font-bold text-[#F4F4F2]">
              No matching garments found
            </p>
            <p className="mt-2 max-w-md text-sm text-[#A1A1AA]">
              Adjust your category filter or search term to browse the full Drop 04 collection.
            </p>
            <button
              type="button"
              onClick={onResetFilters}
              className="mt-6 min-h-10 rounded-md bg-[#16A34A] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#15803D]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
