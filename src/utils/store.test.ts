import test from 'node:test';
import assert from 'node:assert/strict';
import { DROP_PRODUCTS } from '../data/products';
import {
  addCartItem,
  calculateTotals,
  filterAndSortProducts,
  FREE_SHIPPING_THRESHOLD,
  removeCartItem,
  STANDARD_SHIPPING_FEE,
  updateCartItemQty,
  validateCheckoutForm,
  validateMemberEmail,
} from './store';

test('filterAndSortProducts filters by category and search query', () => {
  const sets = filterAndSortProducts(DROP_PRODUCTS, {
    category: 'Sets',
    query: '',
    sort: 'featured',
  });
  assert.equal(sets.length, 2);
  assert.equal(sets[0].id, 'ej-01');

  const jackpotSearch = filterAndSortProducts(DROP_PRODUCTS, {
    category: 'All',
    query: 'jackpot',
    sort: 'featured',
  });
  assert.equal(jackpotSearch.length, 1);
  assert.equal(jackpotSearch[0].id, 'ej-03');
});

test('filterAndSortProducts sorts ascending and descending by price', () => {
  const asc = filterAndSortProducts(DROP_PRODUCTS, {
    category: 'All',
    query: '',
    sort: 'price-asc',
  });
  assert.ok(asc[0].price <= asc[asc.length - 1].price);
  assert.equal(asc[0].id, 'ej-03');

  const desc = filterAndSortProducts(DROP_PRODUCTS, {
    category: 'All',
    query: '',
    sort: 'price-desc',
  });
  assert.ok(desc[0].price >= desc[desc.length - 1].price);
  assert.equal(desc[0].id, 'ej-01');
});

test('cart operations add, merge, clamp stock, step, and remove items', () => {
  const setOne = DROP_PRODUCTS[0];
  let cart = addCartItem([], setOne, 'L', setOne.colorways[0]);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 1);

  cart = addCartItem(cart, setOne, 'L', setOne.colorways[0]);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);

  cart = addCartItem(cart, setOne, 'M', setOne.colorways[0]);
  assert.equal(cart.length, 2);

  cart = updateCartItemQty(cart, cart[1].key, -1);
  assert.equal(cart.length, 1);

  cart = removeCartItem(cart, cart[0].key);
  assert.equal(cart.length, 0);
});

test('calculateTotals applies free shipping threshold accurately', () => {
  const tee = DROP_PRODUCTS[2]; // $85
  const setTwo = DROP_PRODUCTS[1]; // $295

  const emptyTotals = calculateTotals([]);
  assert.equal(emptyTotals.subtotal, 0);
  assert.equal(emptyTotals.shipping, 0);
  assert.equal(emptyTotals.total, 0);

  const underThresholdCart = addCartItem([], tee, 'M', tee.colorways[0]);
  const underTotals = calculateTotals(underThresholdCart);
  assert.equal(underTotals.subtotal, 85);
  assert.equal(underTotals.shipping, STANDARD_SHIPPING_FEE);
  assert.equal(underTotals.freeShippingRemaining, FREE_SHIPPING_THRESHOLD - 85);
  assert.equal(underTotals.total, 85 + STANDARD_SHIPPING_FEE);

  const overThresholdCart = addCartItem(underThresholdCart, setTwo, 'L', setTwo.colorways[0]);
  const overTotals = calculateTotals(overThresholdCart);
  assert.equal(overTotals.subtotal, 380);
  assert.equal(overTotals.shipping, 0);
  assert.equal(overTotals.freeShippingRemaining, 0);
  assert.equal(overTotals.total, 380);
});

test('validateCheckoutForm rejects empty or invalid inputs and accepts valid data', () => {
  const emptyErrors = validateCheckoutForm({
    fullName: '',
    email: 'not-an-email',
    address: '123',
    city: '',
    postalCode: '',
  });
  assert.ok(emptyErrors.fullName);
  assert.ok(emptyErrors.email);
  assert.ok(emptyErrors.address);
  assert.ok(emptyErrors.city);
  assert.ok(emptyErrors.postalCode);

  const validErrors = validateCheckoutForm({
    fullName: 'Jordan Reyes',
    email: 'jordan@ejdtb.com',
    address: '742 Mercer Street Apt 4B',
    city: 'New York',
    postalCode: '10012',
  });
  assert.deepEqual(validErrors, {});
});

test('validateMemberEmail checks presence and format', () => {
  assert.ok(validateMemberEmail(''));
  assert.ok(validateMemberEmail('invalid'));
  assert.equal(validateMemberEmail('member@ejdtb.com'), null);
});
