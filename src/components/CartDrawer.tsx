import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type {
  CartItem,
  CheckoutErrors,
  CheckoutForm,
  OrderReceipt,
  SquarePaymentConfig,
} from '../types/store';
import { loadSquareSdk, SQUARE_CARD_STYLE, type SquareCardInstance } from '../utils/squareSdk';
import {
  calculateTotals,
  formatCurrency,
  FREE_SHIPPING_THRESHOLD,
  validateCheckoutForm,
} from '../utils/store';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveItem: (key: string) => void;
  onClearCart: () => void;
}

const INITIAL_FORM: CheckoutForm = {
  fullName: '',
  email: '',
  address: '',
  city: '',
  postalCode: '',
};

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

  const [paymentConfig, setPaymentConfig] = useState<SquarePaymentConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [cardReady, setCardReady] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardRef = useRef<SquareCardInstance | null>(null);

  const totals = calculateTotals(items);

  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && items.length > 0 && step === 'confirmed') {
      setStep('bag');
      setReceipt(null);
    }
  }, [isOpen, items.length, step]);

  useEffect(() => {
    if (!isOpen || step !== 'checkout') {
      setCardReady(false);
      if (cardRef.current) {
        const instance = cardRef.current;
        cardRef.current = null;
        void instance.destroy().catch(() => {});
      }
      return;
    }

    let cancelled = false;
    setConfigLoading(true);
    setCardReady(false);
    setPaymentError(null);

    async function initSquare() {
      try {
        const res = await fetch('/api/payments/config');
        if (!res.ok) {
          throw new Error('Could not load Square payment configuration.');
        }
        const config = (await res.json()) as SquarePaymentConfig;
        if (cancelled) return;
        setPaymentConfig(config);

        if (!config.configured || !config.applicationId || !config.locationId) {
          setConfigLoading(false);
          return;
        }

        const square = await loadSquareSdk(config.environment);
        if (cancelled) return;

        const payments = await square.payments(config.applicationId, config.locationId);
        const card = await payments.card({ style: SQUARE_CARD_STYLE });
        if (cancelled) {
          await card.destroy().catch(() => {});
          return;
        }

        const container = document.getElementById('square-card-container');
        if (!container) return;
        container.innerHTML = '';
        await card.attach('#square-card-container');

        if (cancelled) {
          await card.destroy().catch(() => {});
          return;
        }

        cardRef.current = card;
        setCardReady(true);
      } catch (err) {
        if (!cancelled) {
          setPaymentError(
            err instanceof Error ? err.message : 'Unable to initialize Square checkout.'
          );
        }
      } finally {
        if (!cancelled) {
          setConfigLoading(false);
        }
      }
    }

    void initSquare();

    return () => {
      cancelled = true;
      setCardReady(false);
      if (cardRef.current) {
        const instance = cardRef.current;
        cardRef.current = null;
        void instance.destroy().catch(() => {});
      }
    };
  }, [isOpen, step]);

  if (!isOpen) return null;

  const progressPct = Math.min(100, Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateCheckoutForm(form);
    setErrors(nextErrors);
    setPaymentError(null);

    if (Object.keys(nextErrors).length > 0) return;

    if (!paymentConfig?.configured) {
      setPaymentError(
        'Square credentials are required on the server before processing card payments.'
      );
      return;
    }

    if (!cardRef.current || !cardReady) {
      setPaymentError('Square card terminal is still initializing. Please try again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const tokenResult = await cardRef.current.tokenize();
      if (tokenResult.status !== 'OK' || !tokenResult.token) {
        const message =
          tokenResult.errors?.[0]?.message || 'Please check your card details and try again.';
        setPaymentError(message);
        return;
      }

      const response = await fetch('/api/payments/square', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: tokenResult.token,
          customer: form,
          items: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            colorway: item.colorway,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        orderNumber?: string;
        paymentId?: string;
        paymentStatus?: string;
        cardSummary?: string;
        receiptUrl?: string;
        subtotal?: number;
        shipping?: number;
        total?: number;
        placedAt?: string;
      } | null;

      if (!response.ok || !data?.orderNumber) {
        setPaymentError(data?.error || 'Square could not complete this payment.');
        return;
      }

      setReceipt({
        orderNumber: data.orderNumber,
        placedAt:
          data.placedAt ??
          new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        customer: { ...form },
        items: [...items],
        subtotal: data.subtotal ?? totals.subtotal,
        shipping: data.shipping ?? totals.shipping,
        total: data.total ?? totals.total,
        paymentId: data.paymentId,
        paymentStatus: data.paymentStatus,
        cardSummary: data.cardSummary,
        receiptUrl: data.receiptUrl,
      });
      onClearCart();
      setForm(INITIAL_FORM);
      setErrors({});
      setStep('confirmed');
    } catch {
      setPaymentError('Network error while contacting Square checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag and checkout"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-white/15 bg-[#121316]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('bag')}
                aria-label="Back to shopping bag"
                className="rounded p-1 text-[#A1A1AA] hover:bg-white/5 hover:text-[#F4F4F2]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <h2 className="font-display text-2xl font-bold tracking-tight text-[#F4F4F2]">
              {step === 'bag' && `Your Bag (${totals.itemCount})`}
              {step === 'checkout' && 'Shipping & Checkout'}
              {step === 'confirmed' && 'Order Confirmed'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-[#A1A1AA] transition-colors hover:bg-white/5 hover:text-[#F4F4F2]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {step === 'confirmed' && receipt ? (
          <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="rounded-lg border border-[#16A34A]/40 bg-[#16A34A]/10 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#F4F4F2]">
                      Order #{receipt.orderNumber} Confirmed — Preparing Shipment
                    </p>
                    <p className="text-xs text-[#D4D4D8]">
                      Confirmation sent to {receipt.customer.email} on {receipt.placedAt}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-b border-white/10 pb-4 text-xs text-[#A1A1AA]">
                <p className="font-semibold text-[#F4F4F2]">Delivering to</p>
                <p>{receipt.customer.fullName}</p>
                <p>
                  {receipt.customer.address}, {receipt.customer.city} {receipt.customer.postalCode}
                </p>
                {(receipt.paymentId || receipt.cardSummary) && (
                  <div className="pt-2 text-xs text-[#A1A1AA]">
                    <p className="font-semibold text-[#F4F4F2]">Square Payment</p>
                    {receipt.cardSummary && <p>{receipt.cardSummary}</p>}
                    {receipt.paymentId && (
                      <p className="font-mono text-[11px] text-[#71717A]">
                        Ref: {receipt.paymentId}
                      </p>
                    )}
                    {receipt.receiptUrl && (
                      <a
                        href={receipt.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 inline-flex items-center gap-1 font-medium text-[#22C55E] hover:underline"
                      >
                        View Square Receipt
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-[#F4F4F2]">Order Summary</p>
                {receipt.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 text-xs text-[#D4D4D8]"
                  >
                    <span>
                      {item.quantity}x {item.name} ({item.size})
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-sm font-semibold text-[#F4F4F2]">
                  <span>Total Paid</span>
                  <span className="tabular-nums">{formatCurrency(receipt.total)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('bag');
                onClose();
              }}
              className="mt-6 min-h-11 w-full rounded-md bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#15803D]"
            >
              Continue Shopping
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-[#52525B]" aria-hidden="true" />
            <p className="mt-4 font-display text-2xl font-bold text-[#F4F4F2]">
              Your bag is empty
            </p>
            <p className="mt-2 max-w-xs text-sm text-[#A1A1AA]">
              Explore Drop 04 heavyweight fleece, utility cargos, and numbered outerwear.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 min-h-11 rounded-md bg-[#16A34A] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#15803D]"
            >
              Browse Drop 04
            </button>
          </div>
        ) : step === 'bag' ? (
          <>
            {/* Free Shipping Progress */}
            <div className="border-b border-white/10 bg-[#181A1C] px-6 py-3.5">
              <p className="text-xs text-[#D4D4D8]">
                {totals.freeShippingRemaining === 0 ? (
                  <span className="font-medium text-[#22C55E]">
                    Complimentary express shipping unlocked
                  </span>
                ) : (
                  <span>
                    Add{' '}
                    <strong className="tabular-nums text-[#F4F4F2]">
                      {formatCurrency(totals.freeShippingRemaining)}
                    </strong>{' '}
                    more for complimentary express shipping
                  </span>
                )}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-[#16A34A] transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Bag Items */}
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-4 border-b border-white/10 pb-4 last:border-b-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 shrink-0 rounded-md border border-white/10 bg-[#1E2024] object-contain p-1"
                  />
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#F4F4F2]">{item.name}</p>
                        <p className="mt-0.5 text-xs text-[#A1A1AA]">
                          Size {item.size} <span aria-hidden="true">·</span> {item.colorway}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.key)}
                        aria-label={`Remove ${item.name} size ${item.size}`}
                        className="rounded p-1 text-[#71717A] transition-colors hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-md border border-white/10 bg-[#181A1C]">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.key, -1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center text-[#D4D4D8] hover:bg-white/5"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-xs font-semibold tabular-nums text-[#F4F4F2]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.key, 1)}
                          disabled={item.quantity >= item.maxStock}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="flex h-8 w-8 items-center justify-center text-[#D4D4D8] hover:bg-white/5 disabled:text-[#52525B]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-semibold tabular-nums text-[#F4F4F2]">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Totals */}
            <div className="border-t border-white/10 bg-[#141517] p-6 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-[#F4F4F2]">
                    {formatCurrency(totals.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#A1A1AA]">
                  <span>Shipping</span>
                  <span className="tabular-nums text-[#F4F4F2]">
                    {totals.shipping === 0 ? 'Complimentary' : formatCurrency(totals.shipping)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold text-[#F4F4F2]">
                  <span>Estimated Total</span>
                  <span className="tabular-nums">{formatCurrency(totals.total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="min-h-12 w-full rounded-md bg-[#16A34A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#15803D]"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleCheckoutSubmit} noValidate className="flex flex-1 flex-col justify-between overflow-y-auto p-6">
            <div className="space-y-4">
              <p className="text-xs text-[#A1A1AA]">
                Enter your shipping details to place your Drop 04 order.
              </p>

              <div>
                <label htmlFor="checkout-name" className="block text-xs font-medium text-[#D4D4D8]">
                  Full Name
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Jordan Reyes"
                  className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-[#181A1C] px-3 text-sm text-[#F4F4F2] placeholder-[#71717A] focus:border-[#16A34A] focus:outline-none"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-400">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label htmlFor="checkout-email" className="block text-xs font-medium text-[#D4D4D8]">
                  Email Address
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jordan@example.com"
                  className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-[#181A1C] px-3 text-sm text-[#F4F4F2] placeholder-[#71717A] focus:border-[#16A34A] focus:outline-none"
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="checkout-address" className="block text-xs font-medium text-[#D4D4D8]">
                  Street Address
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="742 Mercer Street Apt 4B"
                  className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-[#181A1C] px-3 text-sm text-[#F4F4F2] placeholder-[#71717A] focus:border-[#16A34A] focus:outline-none"
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-400">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="checkout-city" className="block text-xs font-medium text-[#D4D4D8]">
                    City
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="New York"
                    className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-[#181A1C] px-3 text-sm text-[#F4F4F2] placeholder-[#71717A] focus:border-[#16A34A] focus:outline-none"
                  />
                  {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city}</p>}
                </div>

                <div>
                  <label htmlFor="checkout-postal" className="block text-xs font-medium text-[#D4D4D8]">
                    Postal Code
                  </label>
                  <input
                    id="checkout-postal"
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    placeholder="10012"
                    className="mt-1.5 h-10 w-full rounded-md border border-white/15 bg-[#181A1C] px-3 text-sm text-[#F4F4F2] placeholder-[#71717A] focus:border-[#16A34A] focus:outline-none"
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-xs text-red-400">{errors.postalCode}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#F4F4F2]">
                    <CreditCard className="h-3.5 w-3.5 text-[#22C55E]" aria-hidden="true" />
                    Square Card Payment
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-[#A1A1AA]">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    {paymentConfig?.environment === 'production' ? 'Encrypted' : 'Square Checkout'}
                  </span>
                </div>

                {configLoading ? (
                  <div className="flex min-h-14 items-center gap-2.5 rounded-md border border-white/15 bg-[#181A1C] px-3.5 py-3 text-xs text-[#A1A1AA]">
                    <Loader2 className="h-4 w-4 animate-spin text-[#22C55E]" aria-hidden="true" />
                    <span>Connecting to Square payment terminal...</span>
                  </div>
                ) : paymentConfig && !paymentConfig.configured ? (
                  <div
                    role="status"
                    className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-amber-200"
                  >
                    <p className="font-semibold text-amber-100">Square Checkout Setup Required</p>
                    <p className="mt-1 text-amber-200/85">
                      {paymentConfig.configIssue ? (
                        paymentConfig.configIssue
                      ) : (
                        <>
                          Add <code className="font-mono">SQUARE_APPLICATION_ID</code>,{' '}
                          <code className="font-mono">SQUARE_LOCATION_ID</code>, and{' '}
                          <code className="font-mono">SQUARE_ACCESS_TOKEN</code> in environment
                          secrets to enable live or sandbox Square card processing.
                        </>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border border-white/15 bg-[#181A1C] p-3">
                    <div
                      id="square-card-container"
                      data-ready={cardReady ? 'true' : 'false'}
                      className="min-h-12"
                    />
                  </div>
                )}

                {paymentError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"
                  >
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{paymentError}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-sm font-semibold text-[#F4F4F2]">
                  <span>Order Total</span>
                  <span className="tabular-nums">{formatCurrency(totals.total)}</span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || configLoading}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-[#16A34A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#15803D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Processing Square Payment...
                    </>
                  ) : (
                    `Pay with Square — ${formatCurrency(totals.total)}`
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
