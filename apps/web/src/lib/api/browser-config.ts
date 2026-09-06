import { parsePublicWebConfig } from './public-config';

// Keep the access statically named: Next.js substitutes NEXT_PUBLIC_* values at
// build time. The resulting object contains the only configuration exposed to
// client code and is intentionally frozen into the browser bundle.
export const publicWebConfig = parsePublicWebConfig({
  // eslint-disable-next-line no-restricted-syntax -- This is the single approved browser environment read.
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
