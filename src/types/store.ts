export type Category = 'All' | 'Sets' | 'Tees';

export type SortOption = 'featured' | 'price-asc' | 'price-desc';

export type GarmentSize = 'S' | 'M' | 'L' | 'XL' | 'OS';

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: Exclude<Category, 'All'>;
  fit: string;
  price: number;
  image: string;
  fallbackLabel: string;
  tag?: string;
  colorways: string[];
  sizes: GarmentSize[];
  stockBySize: Partial<Record<GarmentSize, number>>;
  fabricSpec: string;
  description: string;
  measurements: string;
  featuredRank: number;
}

export interface CartItem {
  key: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  size: GarmentSize;
  colorway: string;
  quantity: number;
  maxStock: number;
}

export interface CheckoutForm {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export interface OrderReceipt {
  orderNumber: string;
  placedAt: string;
  customer: CheckoutForm;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
}
