import { useMemo, useState } from 'react';
import { CartDrawer } from './components/CartDrawer';
import { CollectionSection } from './components/CollectionSection';
import { CraftSection } from './components/CraftSection';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { ProductModal } from './components/ProductModal';
import { DROP_PRODUCTS } from './data/catalog';
import type { CartItem, Category, GarmentSize, Product, SortOption } from './types/store';
import {
  addCartItem,
  calculateTotals,
  filterAndSortProducts,
  removeCartItem,
  updateCartItemQty,
} from './utils/store';

export default function App() {
  const [category, setCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('featured');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bagOpen, setBagOpen] = useState(false);

  const visibleProducts = useMemo(
    () => filterAndSortProducts(DROP_PRODUCTS, { category, query, sort }),
    [category, query, sort]
  );

  const totals = useMemo(() => calculateTotals(cart), [cart]);

  const handleQuickAdd = (product: Product, size: GarmentSize) => {
    setCart((prev) => addCartItem(prev, product, size, product.colorways[0]));
  };

  const handleAddToBag = (product: Product, size: GarmentSize, colorway: string) => {
    setCart((prev) => addCartItem(prev, product, size, colorway));
    setBagOpen(true);
  };

  const handleResetFilters = () => {
    setCategory('All');
    setQuery('');
    setSort('featured');
  };

  return (
    <div className="min-h-screen bg-[#0D0E10] text-[#F4F4F2]">
      <Navbar itemCount={totals.itemCount} onOpenBag={() => setBagOpen(true)} />

      <main>
        <HeroSection />

        <CollectionSection
          products={visibleProducts}
          category={category}
          query={query}
          sort={sort}
          onCategoryChange={setCategory}
          onQueryChange={setQuery}
          onSortChange={setSort}
          onResetFilters={handleResetFilters}
          onSelectProduct={setSelectedProduct}
          onQuickAdd={handleQuickAdd}
        />

        <CraftSection />
      </main>

      <Footer />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToBag={handleAddToBag}
      />

      <CartDrawer
        isOpen={bagOpen}
        items={cart}
        onClose={() => setBagOpen(false)}
        onUpdateQty={(key, delta) => setCart((prev) => updateCartItemQty(prev, key, delta))}
        onRemoveItem={(key) => setCart((prev) => removeCartItem(prev, key))}
        onClearCart={() => setCart([])}
      />
    </div>
  );
}
