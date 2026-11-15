import type { Product } from '../types/store';
import heroCampaign from '../assets/images/hero_ejdtb_campaign_1794769755608.jpg';
import craftAtelier from '../assets/images/lookbook_craft_studio_clean_1794769776693.jpg';

export const BRAND_LOGO_SRC = '/assets/aistudio/image_1cc14ec6.png';
export const HERO_CAMPAIGN_SRC = heroCampaign;
export const CRAFT_ATELIER_SRC = craftAtelier;

export const CATEGORIES = ['All', 'Sets', 'Tees'] as const;

export const DROP_PRODUCTS: Product[] = [
  {
    id: 'ej-01',
    slug: 'ejdtb-11-patch-zip-denim-set',
    name: 'EJDTB 11 Varsity Zip & Denim Set',
    category: 'Sets',
    fit: 'Zip & Denim',
    price: 340,
    image: '/assets/aistudio/ejdtb_hoodie_jeans_1a2b0b3e.png',
    fallbackLabel: 'EJDTB 11 Zip & Denim Set',
    tag: 'Signature Set',
    colorways: ['Ash White / Vintage Wash'],
    sizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 5, M: 8, L: 7, XL: 4 },
    fabricSpec: '500gsm fleece zip hoodie with chenille patches · 14oz distressed plaid-lined denim',
    description:
      'Complete two-piece uniform pairing a cropped ash-grey full-zip hoodie with heavyweight chenille EJDTB 11 chest lettering, sleeve insignia patches, and distressed wide-leg denim with gothic leg print and tartan knee inlays.',
    measurements: 'Boxy cropped hoodie length with relaxed straight-wide 32" inseam denim.',
    featuredRank: 1,
  },
  {
    id: 'ej-02',
    slug: 'ejdtb-moss-distressed-zip-short-set',
    name: 'Graveyard Moss Zip & Shorts Set',
    category: 'Sets',
    fit: 'Zip & Shorts',
    price: 295,
    image: '/assets/aistudio/ejdtb_graveyard_green_set_cab8dbf7.png',
    fallbackLabel: 'Graveyard Moss Set',
    tag: 'Limited Run',
    colorways: ['Moss Camo Mineral Wash'],
    sizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 4, M: 6, L: 5, XL: 3 },
    fabricSpec: '480gsm acid-washed French terry · Raw-edge woven patches · Double-layer waistband',
    description:
      'Hand-dyed moss and charcoal mineral wash two-piece set detailed with distressed chest graphic panels, gothic sleeve script prints, and matching below-knee raw-hem fleece shorts with stacked EJDTB appliques.',
    measurements: 'Cropped zip silhouette paired with 11" inseam wide-cut sweatshorts.',
    featuredRank: 2,
  },
  {
    id: 'ej-03',
    slug: 'ejdtb-jackpot-777-graphic-tee',
    name: 'Jackpot 777 Heavyweight Tee',
    category: 'Tees',
    fit: 'Boxy Tee',
    price: 85,
    image: '/assets/aistudio/ejdtb_jackpot_tee_bad00f45.png',
    fallbackLabel: 'Jackpot 777 Tee',
    tag: 'Drop 04 Core',
    colorways: ['Jet Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 10, M: 14, L: 12, XL: 8 },
    fabricSpec: '300gsm 100% combed cotton jersey · High-density plastisol front & back print',
    description:
      'Heavyweight boxy tee featuring full-color front EJDTB slot-machine artwork and oversized ELJEFEDETUBARIO 777 Jackpot back hit on a thick-collared vintage black blank.',
    measurements: 'Dropped-shoulder boxy cut. Take your true size for an oversized fit.',
    featuredRank: 3,
  },
  {
    id: 'ej-04',
    slug: 'ejdtb-members-only-flame-tee',
    name: 'Members Only Flame Skull Tee',
    category: 'Tees',
    fit: 'Mineral Wash',
    price: 95,
    image: '/assets/aistudio/ejdtb_members_only_tee_c243e1ab.png',
    fallbackLabel: 'Members Only Flame Tee',
    tag: 'Made in NY',
    colorways: ['Distressed Charcoal'],
    sizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 7, M: 11, L: 9, XL: 5 },
    fabricSpec: '310gsm enzyme-washed jersey · Hand-distressed rib edges · Discharge screenprint',
    description:
      'Sun-faded charcoal tee stamped with blazing EJDTB flame lettering, skeletal artwork, and Members Only Made in New York U.S.A. lower-hem print with subtle grinding along the collar and cuffs.',
    measurements: 'Vintage boxy fit with 1.25" ribbed crew collar and dropped sleeves.',
    featuredRank: 4,
  },
];
