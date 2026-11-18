export interface SquareTokenError {
  message?: string;
  field?: string;
}

export interface SquareTokenResult {
  status: 'OK' | 'Cancel' | 'Error' | string;
  token?: string;
  errors?: SquareTokenError[];
}

export interface SquareCardInstance {
  attach: (selector: string) => Promise<void>;
  tokenize: () => Promise<SquareTokenResult>;
  destroy: () => Promise<void>;
}

export interface SquarePaymentsInstance {
  card: (options?: { style?: Record<string, Record<string, string>> }) => Promise<SquareCardInstance>;
}

export interface SquareGlobal {
  payments: (applicationId: string, locationId: string) => Promise<SquarePaymentsInstance> | SquarePaymentsInstance;
}

declare global {
  interface Window {
    Square?: SquareGlobal;
  }
}

export const SQUARE_CARD_STYLE: Record<string, Record<string, string>> = {
  '.input-container': {
    borderColor: '#2E3136',
    borderRadius: '6px',
    borderWidth: '1px',
  },
  '.input-container.is-focus': {
    borderColor: '#16A34A',
  },
  '.input-container.is-error': {
    borderColor: '#F87171',
  },
  input: {
    backgroundColor: '#181A1C',
    color: '#F4F4F2',
    fontSize: '14px',
  },
  'input::placeholder': {
    color: '#71717A',
  },
  '.message-text': {
    color: '#A1A1AA',
  },
  '.message-text.is-error': {
    color: '#F87171',
  },
};

export function getSquareScriptUrl(environment: 'sandbox' | 'production'): string {
  return environment === 'production'
    ? 'https://web.squareup.com/v2/square.js'
    : 'https://sandbox.web.squareup.com/v2/square.js';
}

export function loadSquareSdk(environment: 'sandbox' | 'production'): Promise<SquareGlobal> {
  const scriptSrc = getSquareScriptUrl(environment);
  const existing = document.querySelector<HTMLScriptElement>('script[data-square-sdk="true"]');

  if (window.Square && existing?.src === scriptSrc) {
    return Promise.resolve(window.Square);
  }

  if (existing && existing.src !== scriptSrc) {
    existing.remove();
    delete window.Square;
  }

  return new Promise((resolve, reject) => {
    const script =
      document.querySelector<HTMLScriptElement>('script[data-square-sdk="true"]') ??
      document.createElement('script');

    const handleLoad = () => {
      if (window.Square) {
        resolve(window.Square);
      } else {
        reject(new Error('Square Web Payments SDK loaded without Square global.'));
      }
    };

    const handleError = () => {
      reject(new Error('Unable to load Square Web Payments SDK. Check network access.'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!script.parentNode) {
      script.src = scriptSrc;
      script.async = true;
      script.dataset.squareSdk = 'true';
      document.head.appendChild(script);
    }
  });
}
