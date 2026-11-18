import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSquareCreatePaymentPayload,
  computeAuthoritativeOrder,
  extractSquareErrorMessage,
  getSquareApiBaseUrl,
  getSquareConfigStatus,
  toPublicSquareConfig,
  validateCustomerInput,
} from './square.ts';

test('getSquareConfigStatus defaults to sandbox and reports unconfigured when keys are missing', () => {
  const config = getSquareConfigStatus({});
  assert.equal(config.environment, 'sandbox');
  assert.equal(config.configured, false);
  assert.equal(config.applicationId, null);
  assert.equal(config.locationId, null);
  assert.equal(config.accessToken, null);
});

test('getSquareConfigStatus detects full production config and masks access token in public config', () => {
  const config = getSquareConfigStatus({
    SQUARE_ENVIRONMENT: 'production',
    SQUARE_APPLICATION_ID: 'sq0idp-app',
    SQUARE_LOCATION_ID: 'L12345',
    SQUARE_ACCESS_TOKEN: 'EAAAl-secret',
  });
  assert.equal(config.configured, true);
  assert.equal(config.environment, 'production');
  assert.equal(getSquareApiBaseUrl(config.environment), 'https://connect.squareup.com');

  const pub = toPublicSquareConfig(config);
  assert.equal(pub.configured, true);
  assert.equal(pub.applicationId, 'sq0idp-app');
  assert.equal(pub.configIssue, null);
  assert.equal('accessToken' in pub, false);
});

test('getSquareConfigStatus rejects misplaced access tokens, bad location IDs, and env mismatches without leaking values', () => {
  const tokenInAppId = getSquareConfigStatus({
    SQUARE_ENVIRONMENT: 'sandbox',
    SQUARE_APPLICATION_ID: 'EAAAl-secret-token',
    SQUARE_LOCATION_ID: 'Production : sq0idp-123',
    SQUARE_ACCESS_TOKEN: 'something',
  });
  assert.equal(tokenInAppId.configured, false);
  assert.ok(tokenInAppId.configIssue?.includes('SQUARE_APPLICATION_ID'));

  const pub = toPublicSquareConfig(tokenInAppId);
  assert.equal(pub.configured, false);
  assert.equal(pub.applicationId, null);
  assert.equal(pub.locationId, null);

  const envMismatch = getSquareConfigStatus({
    SQUARE_ENVIRONMENT: 'sandbox',
    SQUARE_APPLICATION_ID: 'sq0idp-prod-id',
    SQUARE_LOCATION_ID: 'L12345',
    SQUARE_ACCESS_TOKEN: 'EAAAl-secret',
  });
  assert.equal(envMismatch.configured, false);
  assert.ok(envMismatch.configIssue?.includes('SQUARE_ENVIRONMENT'));
});

test('computeAuthoritativeOrder adds $15 shipping below $250 and free shipping at or above $250', () => {
  const teeOrder = computeAuthoritativeOrder([{ productId: 'ej-03', size: 'L', quantity: 2 }]);
  assert.equal(teeOrder.ok, true);
  if (teeOrder.ok) {
    assert.equal(teeOrder.order.subtotalCents, 17000);
    assert.equal(teeOrder.order.shippingCents, 1500);
    assert.equal(teeOrder.order.totalCents, 18500);
    assert.equal(teeOrder.order.totalDollars, 185);
  }

  const setOrder = computeAuthoritativeOrder([{ productId: 'ej-01', size: 'M', quantity: 1 }]);
  assert.equal(setOrder.ok, true);
  if (setOrder.ok) {
    assert.equal(setOrder.order.subtotalCents, 34000);
    assert.equal(setOrder.order.shippingCents, 0);
    assert.equal(setOrder.order.totalCents, 34000);
  }
});

test('computeAuthoritativeOrder rejects invalid product IDs and over-stock quantities', () => {
  const badProduct = computeAuthoritativeOrder([{ productId: 'unknown', size: 'M', quantity: 1 }]);
  assert.equal(badProduct.ok, false);

  const overStock = computeAuthoritativeOrder([{ productId: 'ej-01', size: 'XL', quantity: 99 }]);
  assert.equal(overStock.ok, false);
});

test('validateCustomerInput enforces required fields', () => {
  assert.notEqual(
    validateCustomerInput({
      fullName: '',
      email: 'bad',
      address: '123',
      city: 'N',
      postalCode: '1',
    }),
    null
  );
  assert.equal(
    validateCustomerInput({
      fullName: 'Jordan Reyes',
      email: 'jordan@example.com',
      address: '742 Mercer Street Apt 4B',
      city: 'New York',
      postalCode: '10012',
    }),
    null
  );
});

test('buildSquareCreatePaymentPayload builds valid USD cents payload and extracts Square errors', () => {
  const result = computeAuthoritativeOrder([{ productId: 'ej-04', size: 'M', quantity: 1 }]);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const payload = buildSquareCreatePaymentPayload({
    sourceId: 'cnon:card-nonce-ok',
    locationId: 'L123',
    idempotencyKey: 'idem-123',
    orderNumber: 'EJ-4201',
    order: result.order,
    customer: {
      fullName: 'Jordan Reyes',
      email: 'jordan@example.com',
      address: '742 Mercer Street',
      city: 'New York',
      postalCode: '10012',
    },
  });

  assert.equal(payload.amount_money.amount, 11000);
  assert.equal(payload.amount_money.currency, 'USD');
  assert.equal(payload.source_id, 'cnon:card-nonce-ok');
  assert.equal(payload.reference_id, 'EJ-4201');

  assert.equal(
    extractSquareErrorMessage({ errors: [{ detail: 'Card declined by issuer.' }] }),
    'Card declined by issuer.'
  );
});
