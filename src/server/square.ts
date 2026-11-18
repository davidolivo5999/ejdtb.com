export type SquareEnvironment = 'sandbox' | 'production';

export interface ServerCatalogProduct {
  id: string;
  name: string;
  priceDollars: number;
  stockBySize: Record<string, number>;
}

export const FREE_SHIPPING_THRESHOLD_CENTS = 25000;
export const STANDARD_SHIPPING_FEE_CENTS = 1500;
export const SQUARE_API_VERSION = '2025-10-16';

export const SERVER_CATALOG_ITEMS: Record<string, ServerCatalogProduct> = {
  'ej-01': {
    id: 'ej-01',
    name: 'EJDTB 11 Varsity Zip & Denim Set',
    priceDollars: 340,
    stockBySize: { S: 5, M: 8, L: 7, XL: 4 },
  },
  'ej-02': {
    id: 'ej-02',
    name: 'Graveyard Moss Zip & Shorts Set',
    priceDollars: 295,
    stockBySize: { S: 4, M: 6, L: 5, XL: 3 },
  },
  'ej-03': {
    id: 'ej-03',
    name: 'Jackpot 777 Heavyweight Tee',
    priceDollars: 85,
    stockBySize: { S: 10, M: 14, L: 12, XL: 8 },
  },
  'ej-04': {
    id: 'ej-04',
    name: 'Members Only Flame Skull Tee',
    priceDollars: 95,
    stockBySize: { S: 7, M: 11, L: 9, XL: 5 },
  },
};

export interface SquarePublicConfig {
  configured: boolean;
  environment: SquareEnvironment;
  applicationId: string | null;
  locationId: string | null;
  configIssue?: string | null;
}

export interface SquareServerConfig extends SquarePublicConfig {
  accessToken: string | null;
}

export interface CheckoutLineInput {
  productId: string;
  size: string;
  colorway?: string;
  quantity: number;
}

export interface CheckoutCustomerInput {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface ComputedOrder {
  items: Array<{
    productId: string;
    name: string;
    size: string;
    quantity: number;
    unitPriceDollars: number;
  }>;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  subtotalDollars: number;
  shippingDollars: number;
  totalDollars: number;
}

export function normalizeSquareEnvironment(raw?: string): SquareEnvironment {
  return raw?.trim().toLowerCase() === 'production' ? 'production' : 'sandbox';
}

export function validateSquareCredentialShapes(params: {
  environment: SquareEnvironment;
  applicationId: string | null;
  locationId: string | null;
  accessToken: string | null;
}): string | null {
  const { environment, applicationId, locationId, accessToken } = params;
  if (!applicationId || !locationId || !accessToken) {
    return null;
  }

  if (/^eaaa/i.test(applicationId)) {
    return 'SQUARE_APPLICATION_ID appears to contain an Access Token instead of an Application ID (sq0idp-... or sandbox-sq0idb-).';
  }

  const isProdAppId = applicationId.startsWith('sq0idp-');
  const isSandboxAppId = applicationId.startsWith('sandbox-sq0idb-');
  if (!isProdAppId && !isSandboxAppId) {
    return 'SQUARE_APPLICATION_ID must start with sq0idp- (production) or sandbox-sq0idb- (sandbox).';
  }

  if (isProdAppId && environment !== 'production') {
    return 'SQUARE_APPLICATION_ID is a Production ID (sq0idp-...), so SQUARE_ENVIRONMENT must be set to "production".';
  }

  if (isSandboxAppId && environment !== 'sandbox') {
    return 'SQUARE_APPLICATION_ID is a Sandbox ID (sandbox-sq0idb-...), so SQUARE_ENVIRONMENT must be set to "sandbox".';
  }

  if (
    /\s/.test(locationId) ||
    locationId.includes(':') ||
    /^(sq0id|sandbox-sq0id|eaaa)/i.test(locationId)
  ) {
    return 'SQUARE_LOCATION_ID does not look like a Square Location ID (e.g., LXXXXXXXXXXXX). Copy it from Locations in your Square Developer Dashboard.';
  }

  if (/^(sq0id|sandbox-sq0id)/i.test(accessToken)) {
    return 'SQUARE_ACCESS_TOKEN appears to contain an Application ID instead of a Square Access Token.';
  }

  return null;
}

export function getSquareConfigStatus(env: NodeJS.ProcessEnv): SquareServerConfig {
  const environment = normalizeSquareEnvironment(env.SQUARE_ENVIRONMENT);
  const applicationId = env.SQUARE_APPLICATION_ID?.trim() || null;
  const locationId = env.SQUARE_LOCATION_ID?.trim() || null;
  const accessToken = env.SQUARE_ACCESS_TOKEN?.trim() || null;

  const hasAll = Boolean(applicationId && locationId && accessToken);
  const configIssue = validateSquareCredentialShapes({
    environment,
    applicationId,
    locationId,
    accessToken,
  });

  return {
    configured: hasAll && !configIssue,
    environment,
    applicationId,
    locationId,
    accessToken,
    configIssue,
  };
}

export function toPublicSquareConfig(config: SquareServerConfig): SquarePublicConfig {
  return {
    configured: config.configured,
    environment: config.environment,
    applicationId: config.configured ? config.applicationId : null,
    locationId: config.configured ? config.locationId : null,
    configIssue: config.configIssue ?? null,
  };
}

export function getSquareApiBaseUrl(environment: SquareEnvironment): string {
  return environment === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
}

export function validateCustomerInput(
  customer: Partial<CheckoutCustomerInput> | undefined
): string | null {
  if (!customer) return 'Shipping details are required.';
  if (!customer.fullName || customer.fullName.trim().length < 2) {
    return 'Enter your full name.';
  }
  if (!customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
    return 'Enter a valid email address.';
  }
  if (!customer.address || customer.address.trim().length < 5) {
    return 'Enter a street address.';
  }
  if (!customer.city || customer.city.trim().length < 2) {
    return 'Enter a city.';
  }
  if (!customer.postalCode || customer.postalCode.trim().length < 3) {
    return 'Enter a valid postal code.';
  }
  return null;
}

export function computeAuthoritativeOrder(
  rawItems: unknown
): { ok: true; order: ComputedOrder } | { ok: false; error: string } {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, error: 'Your shopping bag is empty.' };
  }

  let subtotalCents = 0;
  const normalizedItems: ComputedOrder['items'] = [];

  for (const entry of rawItems) {
    if (!entry || typeof entry !== 'object') {
      return { ok: false, error: 'Invalid bag item.' };
    }
    const item = entry as Partial<CheckoutLineInput>;
    const product = typeof item.productId === 'string' ? SERVER_CATALOG_ITEMS[item.productId] : undefined;
    if (!product) {
      return { ok: false, error: 'One or more items are no longer in the catalog.' };
    }

    const size = typeof item.size === 'string' ? item.size.trim() : '';
    const availableStock = product.stockBySize[size] ?? 0;
    if (!size || availableStock <= 0) {
      return { ok: false, error: `Selected size is unavailable for ${product.name}.` };
    }

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > availableStock) {
      return { ok: false, error: `Invalid quantity requested for ${product.name}.` };
    }

    subtotalCents += product.priceDollars * 100 * quantity;
    normalizedItems.push({
      productId: product.id,
      name: product.name,
      size,
      quantity,
      unitPriceDollars: product.priceDollars,
    });
  }

  const shippingCents =
    subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
      ? 0
      : STANDARD_SHIPPING_FEE_CENTS;
  const totalCents = subtotalCents + shippingCents;

  return {
    ok: true,
    order: {
      items: normalizedItems,
      subtotalCents,
      shippingCents,
      totalCents,
      subtotalDollars: subtotalCents / 100,
      shippingDollars: shippingCents / 100,
      totalDollars: totalCents / 100,
    },
  };
}

export function buildSquareCreatePaymentPayload(params: {
  sourceId: string;
  locationId: string;
  idempotencyKey: string;
  orderNumber: string;
  order: ComputedOrder;
  customer: CheckoutCustomerInput;
}) {
  const { sourceId, locationId, idempotencyKey, orderNumber, order, customer } = params;
  const summaryNote = order.items
    .map((item) => `${item.quantity}x ${item.name} (${item.size})`)
    .join(', ')
    .slice(0, 480);

  return {
    source_id: sourceId,
    idempotency_key: idempotencyKey,
    location_id: locationId,
    autocomplete: true,
    reference_id: orderNumber,
    note: `EJDTB Members Only ${orderNumber}: ${summaryNote}`,
    buyer_email_address: customer.email.trim(),
    amount_money: {
      amount: order.totalCents,
      currency: 'USD',
    },
    shipping_address: {
      address_line_1: customer.address.trim(),
      locality: customer.city.trim(),
      postal_code: customer.postalCode.trim(),
    },
  };
}

export function extractSquareErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'Square could not process this payment.';
  }
  const record = payload as { errors?: Array<{ detail?: string; code?: string }> };
  const firstError = record.errors?.[0];
  if (firstError?.detail) return firstError.detail;
  if (firstError?.code) return `Square declined the payment (${firstError.code}).`;
  return 'Square could not process this payment.';
}
