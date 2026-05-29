import { ClothingAnalysisResult } from './ai.js';

const EBAY_SANDBOX_API = 'https://api.sandbox.ebay.com';
const EBAY_SANDBOX_AUTH = 'https://auth.sandbox.ebay.com';
const MERCHANT_LOCATION_KEY = 'tailor-ai-default';

const OAUTH_SCOPES = [
  'https://api.ebay.com/oauth/api_scope',
  'https://api.ebay.com/oauth/api_scope/sell.inventory',
  'https://api.ebay.com/oauth/api_scope/sell.account',
].join(' ');

export interface EbayOAuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: Date;
}

export interface PublishListingParams {
  result: ClothingAnalysisResult;
  price: number;
}

// In-memory token storage — replace with DB for multi-user persistence
let storedToken: EbayOAuthToken | null = null;

const MOCK_TOKEN: EbayOAuthToken = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 86400,
  expiresAt: new Date(Date.now() + 86400 * 1000),
};

export function isMockMode(): boolean {
  return process.env.MOCK_EBAY === 'true';
}

export function getStoredToken(): EbayOAuthToken | null {
  if (isMockMode()) return MOCK_TOKEN;
  if (!storedToken) return null;
  if (new Date() >= storedToken.expiresAt) return null;
  return storedToken;
}

export function getEbayAuthUrl(): string {
  const clientId = process.env.EBAY_SANDBOX_CLIENT_ID;
  const redirectUri =
    process.env.EBAY_SANDBOX_REDIRECT_URI ?? 'http://localhost:4000/api/auth/ebay/callback';

  if (!clientId) throw new Error('EBAY_SANDBOX_CLIENT_ID not configured');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: OAUTH_SCOPES,
  });

  return `${EBAY_SANDBOX_AUTH}/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<EbayOAuthToken> {
  const clientId = process.env.EBAY_SANDBOX_CLIENT_ID;
  const clientSecret = process.env.EBAY_SANDBOX_CLIENT_SECRET;
  const redirectUri =
    process.env.EBAY_SANDBOX_REDIRECT_URI ?? 'http://localhost:4000/api/auth/ebay/callback';

  if (!clientId || !clientSecret) throw new Error('eBay sandbox credentials not configured');

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${EBAY_SANDBOX_API}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`eBay token exchange failed (${response.status}): ${body}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  storedToken = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
  };

  return storedToken;
}

const CONDITION_MAP: Record<ClothingAnalysisResult['conditionGrade'], string> = {
  NWT: 'NEW_WITH_TAGS',
  NWOT: 'NEW_WITHOUT_TAGS',
  EUC: 'USED_EXCELLENT',
  GUC: 'USED_GOOD',
  Fair: 'USED_ACCEPTABLE',
};

const CATEGORY_MAP: Record<string, string> = {
  women: '15724',
  men: '1059',
  unisex: '11450',
  kids: '3866',
};

function buildTitle(result: ClothingAnalysisResult): string {
  return [
    result.brand !== 'Unknown' ? result.brand : '',
    result.itemType,
    result.color.join('/'),
    result.size !== 'Unknown' ? `Size ${result.size}` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, 80);
}

function buildDescription(result: ClothingAnalysisResult): string {
  return [
    `${result.brand} ${result.itemType}`,
    '',
    `Condition: ${result.condition}`,
    result.conditionNotes ? `Flaws: ${result.conditionNotes}` : null,
    '',
    `Size: ${result.size}`,
    `Color: ${result.color.join(', ')}`,
    result.material !== 'Unknown' ? `Material: ${result.material}` : null,
    `Style: ${result.style}`,
    '',
    `Keywords: ${result.keywords.join(', ')}`,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');
}

interface EbayPolicies {
  fulfillmentPolicyId?: string;
  paymentPolicyId?: string;
  returnPolicyId?: string;
}

async function fetchPolicies(accessToken: string): Promise<EbayPolicies> {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const base = `${EBAY_SANDBOX_API}/sell/account/v1`;

  const [fulfillment, payment, returns] = await Promise.all([
    fetch(`${base}/fulfillment_policy?marketplace_id=EBAY_US`, { headers })
      .then((r) =>
        r.ok
          ? (r.json() as Promise<{ fulfillmentPolicies?: { fulfillmentPolicyId: string }[] }>)
          : null,
      )
      .catch(() => null),
    fetch(`${base}/payment_policy?marketplace_id=EBAY_US`, { headers })
      .then((r) =>
        r.ok
          ? (r.json() as Promise<{ paymentPolicies?: { paymentPolicyId: string }[] }>)
          : null,
      )
      .catch(() => null),
    fetch(`${base}/return_policy?marketplace_id=EBAY_US`, { headers })
      .then((r) =>
        r.ok
          ? (r.json() as Promise<{ returnPolicies?: { returnPolicyId: string }[] }>)
          : null,
      )
      .catch(() => null),
  ]);

  return {
    fulfillmentPolicyId: fulfillment?.fulfillmentPolicies?.[0]?.fulfillmentPolicyId,
    paymentPolicyId: payment?.paymentPolicies?.[0]?.paymentPolicyId,
    returnPolicyId: returns?.returnPolicies?.[0]?.returnPolicyId,
  };
}

async function ensureMerchantLocation(accessToken: string): Promise<void> {
  const checkRes = await fetch(
    `${EBAY_SANDBOX_API}/sell/inventory/v1/location/${MERCHANT_LOCATION_KEY}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (checkRes.ok) return;

  const createRes = await fetch(
    `${EBAY_SANDBOX_API}/sell/inventory/v1/location/${MERCHANT_LOCATION_KEY}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: {
          address: {
            addressLine1: '2145 Hamilton Avenue',
            city: 'San Jose',
            stateOrProvince: 'CA',
            postalCode: '95125',
            country: 'US',
          },
        },
        locationEnabled: true,
        merchantLocationStatus: 'ENABLED',
        name: 'Tailor AI Default Location',
      }),
    },
  );

  if (!createRes.ok) {
    const body = await createRes.text();
    throw new Error(`Failed to create merchant location (${createRes.status}): ${body}`);
  }
}

export async function publishListing(
  accessToken: string,
  { result, price }: PublishListingParams,
): Promise<string> {
  if (isMockMode()) {
    await new Promise((r) => setTimeout(r, 1500)); // simulate network delay
    const mockId = Date.now();
    console.log(`[mock] Would publish: ${result.brand} ${result.itemType} at $${price}`);
    return `https://www.sandbox.ebay.com/itm/${mockId}`;
  }

  await ensureMerchantLocation(accessToken);

  const sku = `tailor-${Date.now()}`;
  const policies = await fetchPolicies(accessToken);

  // 1. Create/update inventory item
  const itemRes = await fetch(
    `${EBAY_SANDBOX_API}/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'Accept-Language': 'en-US',
      },
      body: JSON.stringify({
        availability: { shipToLocationAvailability: { quantity: 1 } },
        condition: CONDITION_MAP[result.conditionGrade],
        conditionDescription:
          result.condition + (result.conditionNotes ? ` ${result.conditionNotes}` : ''),
        product: {
          title: buildTitle(result),
          description: buildDescription(result),
          aspects: {
            Brand: [result.brand],
            Size: [result.size],
            Color: result.color,
            Material: [result.material],
            Style: [result.style],
          },
        },
      }),
    },
  );

  if (!itemRes.ok && itemRes.status !== 204) {
    const body = await itemRes.text();
    throw new Error(`Failed to create inventory item (${itemRes.status}): ${body}`);
  }

  // 2. Create offer
  const offerBody: Record<string, unknown> = {
    sku,
    marketplaceId: 'EBAY_US',
    format: 'FIXED_PRICE',
    availableQuantity: 1,
    categoryId: CATEGORY_MAP[result.gender] ?? CATEGORY_MAP['unisex'],
    listingDescription: buildDescription(result),
    pricingSummary: {
      price: { currency: 'USD', value: price.toFixed(2) },
    },
    merchantLocationKey: MERCHANT_LOCATION_KEY,
  };

  if (policies.fulfillmentPolicyId || policies.paymentPolicyId || policies.returnPolicyId) {
    offerBody['listingPolicies'] = {
      ...(policies.fulfillmentPolicyId && {
        fulfillmentPolicyId: policies.fulfillmentPolicyId,
      }),
      ...(policies.paymentPolicyId && { paymentPolicyId: policies.paymentPolicyId }),
      ...(policies.returnPolicyId && { returnPolicyId: policies.returnPolicyId }),
    };
  }

  const offerRes = await fetch(`${EBAY_SANDBOX_API}/sell/inventory/v1/offer`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Language': 'en-US',
      'Accept-Language': 'en-US',
    },
    body: JSON.stringify(offerBody),
  });

  if (!offerRes.ok) {
    const body = await offerRes.text();
    throw new Error(`Failed to create offer (${offerRes.status}): ${body}`);
  }

  const { offerId } = (await offerRes.json()) as { offerId: string };

  // 3. Publish offer
  const publishRes = await fetch(
    `${EBAY_SANDBOX_API}/sell/inventory/v1/offer/${offerId}/publish`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'en-US',
      },
    },
  );

  if (!publishRes.ok) {
    const body = await publishRes.text();
    throw new Error(`Failed to publish offer (${publishRes.status}): ${body}`);
  }

  const { listingId } = (await publishRes.json()) as { listingId: string };
  return `https://www.sandbox.ebay.com/itm/${listingId}`;
}
