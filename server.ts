import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import {
  buildSquareCreatePaymentPayload,
  computeAuthoritativeOrder,
  extractSquareErrorMessage,
  getSquareApiBaseUrl,
  getSquareConfigStatus,
  SQUARE_API_VERSION,
  toPublicSquareConfig,
  validateCustomerInput,
  type CheckoutCustomerInput,
} from './src/server/square.ts';

dotenv.config();

function resolvePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = Number(process.argv[portArgIndex + 1]);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }

  if (process.env.DEFAULT_APP_PORT) {
    const parsed = Number(process.env.DEFAULT_APP_PORT);
    if (Number.isInteger(parsed) && parsed > 0) return parsed;
  }

  const envPort = Number(process.env.PORT);
  if (
    Number.isInteger(envPort) &&
    envPort > 0 &&
    process.env.PORT !== process.env.NGINX_PORT
  ) {
    return envPort;
  }

  return 3000;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = resolvePort();
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/payments/config', (_req, res) => {
    const config = getSquareConfigStatus(process.env);
    res.json(toPublicSquareConfig(config));
  });

  app.post('/api/payments/square', async (req, res) => {
    const config = getSquareConfigStatus(process.env);
    if (!config.configured || !config.accessToken || !config.locationId) {
      res.status(503).json({
        error:
          config.configIssue ??
          'Square payments are not configured yet. Add SQUARE_APPLICATION_ID, SQUARE_LOCATION_ID, and SQUARE_ACCESS_TOKEN in Secrets.',
      });
      return;
    }

    const body = req.body as {
      sourceId?: unknown;
      customer?: Partial<CheckoutCustomerInput>;
      items?: unknown;
    };

    if (typeof body?.sourceId !== 'string' || body.sourceId.trim().length < 4) {
      res.status(400).json({ error: 'A valid card payment token is required.' });
      return;
    }

    const customerError = validateCustomerInput(body.customer);
    if (customerError) {
      res.status(400).json({ error: customerError });
      return;
    }

    const orderResult = computeAuthoritativeOrder(body.items);
    if (!orderResult.ok) {
      res.status(400).json({ error: orderResult.error });
      return;
    }

    const customer: CheckoutCustomerInput = {
      fullName: body.customer!.fullName!.trim(),
      email: body.customer!.email!.trim(),
      address: body.customer!.address!.trim(),
      city: body.customer!.city!.trim(),
      postalCode: body.customer!.postalCode!.trim(),
    };

    const orderNumber = `EJ-${crypto.randomInt(1000, 9999)}`;
    const idempotencyKey = crypto.randomUUID();
    const payload = buildSquareCreatePaymentPayload({
      sourceId: body.sourceId.trim(),
      locationId: config.locationId,
      idempotencyKey,
      orderNumber,
      order: orderResult.order,
      customer,
    });

    try {
      const squareResponse = await fetch(`${getSquareApiBaseUrl(config.environment)}/v2/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.accessToken}`,
          'Square-Version': SQUARE_API_VERSION,
        },
        body: JSON.stringify(payload),
      });

      const squareJson = (await squareResponse.json().catch(() => null)) as {
        payment?: {
          id?: string;
          status?: string;
          receipt_url?: string;
          card_details?: {
            card?: {
              card_brand?: string;
              last_4?: string;
            };
          };
        };
      } | null;

      if (!squareResponse.ok || !squareJson?.payment?.id) {
        const message = extractSquareErrorMessage(squareJson);
        res.status(squareResponse.status >= 400 && squareResponse.status < 500 ? 400 : 502).json({
          error: message,
        });
        return;
      }

      const card = squareJson.payment.card_details?.card;
      const cardSummary =
        card?.card_brand && card?.last_4 ? `${card.card_brand} •••• ${card.last_4}` : undefined;

      res.status(200).json({
        orderNumber,
        paymentId: squareJson.payment.id,
        paymentStatus: squareJson.payment.status ?? 'COMPLETED',
        receiptUrl: squareJson.payment.receipt_url,
        cardSummary,
        subtotal: orderResult.order.subtotalDollars,
        shipping: orderResult.order.shippingDollars,
        total: orderResult.order.totalDollars,
        placedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      });
    } catch {
      res.status(502).json({
        error: 'Unable to reach Square payment servers. Please try again in a moment.',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EJDTB storefront server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
