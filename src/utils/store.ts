import type {
  CartItem,
  Category,
  CheckoutErrors,
  CheckoutForm,
  GarmentSize,
  Product,
  SortOption,
} from '../types/store';

export const FREE_SHIPPING_THRESHOLD = 250;
export const STANDARD_SHIPPING_FEE = 15;

export function filterAndSortProducts(
  products: Product[],
  options: {
    category: Category;
    query: string;
    sort: SortOption;
  }
): Product[] {
  const normalizedQuery = options.query.trim().toLowerCase();

  const filtered = products.filter((product) => {
    const matchesCategory = options.category === 'All' || product.category === options.category;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;
    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery) ||
      product.fit.toLowerCase().includes(normalizedQuery) ||
      product.fabricSpec.toLowerCase().includes(normalizedQuery)
    );
  });

  const sorted = [...filtered];
  if (options.sort === 'price-asc') {
    sorted.sort((a, b) => a.price - b.price || a.featuredRank - b.featuredRank);
  } else if (options.sort === 'price-desc') {
    sorted.sort((a, b) => b.price - a.price || a.featuredRank - b.featuredRank);
  } else {
    sorted.sort((a, b) => a.featuredRank - b.featuredRank);
  }

  return sorted;
}

export function makeCartKey(productId: string, size: GarmentSize, colorway: string): string {
  return `${productId}__${size}__${colorway}`;
}

export function addCartItem(
  cart: CartItem[],
  product: Product,
  size: GarmentSize,
  colorway: string
): CartItem[] {
  const maxStock = product.stockBySize[size] ?? 0;
  if (maxStock <= 0) return cart;

  const key = makeCartKey(product.id, size, colorway);
  const existingIndex = cart.findIndex((item) => item.key === key);

  if (existingIndex >= 0) {
    const existing = cart[existingIndex];
    const nextQty = Math.min(existing.quantity + 1, maxStock);
    if (nextQty === existing.quantity) return cart;
    return cart.map((item, idx) =>
      idx === existingIndex ? { ...item, quantity: nextQty } : item
    );
  }

  return [
    ...cart,
    {
      key,
      productId: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      image: product.image,
      size,
      colorway,
      quantity: 1,
      maxStock,
    },
  ];
}

export function updateCartItemQty(cart: CartItem[], key: string, delta: number): CartItem[] {
  return cart
    .map((item) => {
      if (item.key !== key) return item;
      const nextQty = Math.min(item.quantity + delta, item.maxStock);
      return { ...item, quantity: nextQty };
    })
    .filter((item) => item.quantity > 0);
}

export function removeCartItem(cart: CartItem[], key: string): CartItem[] {
  return cart.filter((item) => item.key !== key);
}

export function calculateTotals(cart: CartItem[]) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const freeShippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const total = subtotal + shipping;

  return {
    itemCount,
    subtotal,
    shipping,
    freeShippingRemaining,
    total,
  };
}

export function validateCheckoutForm(form: CheckoutForm): CheckoutErrors {
  const errors: CheckoutErrors = {};

  if (form.fullName.trim().length < 2) {
    errors.fullName = 'Enter your full name.';
  }

  const email = form.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (form.address.trim().length < 5) {
    errors.address = 'Enter a street address.';
  }

  if (form.city.trim().length < 2) {
    errors.city = 'Enter a city.';
  }

  if (form.postalCode.trim().length < 3) {
    errors.postalCode = 'Enter a valid postal code.';
  }

  return errors;
}

export function validateMemberEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'Please enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
