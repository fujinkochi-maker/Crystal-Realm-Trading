export type ListingCategory = "selling" | "buying" | "trading";

export type Listing = {
  id: number;
  sellerId: string;
  sellerName: string;
  category: ListingCategory;
  title: string;
  price: string;
  description: string;
  image?: string;
  status: "active" | "sold";
  createdAt: string;
};

const LISTINGS_KEY = "listings";

function getKv() {
  const env = (globalThis as Record<string, unknown>).__cloudflare_env as
    | Record<string, unknown>
    | undefined;
  return (env?.PRICE_OVERRIDES ?? null) as {
    get: (key: string, type: string) => Promise<Record<string, unknown> | null>;
    put: (key: string, value: string) => Promise<void>;
    delete: (key: string) => Promise<void>;
    list: () => Promise<{ keys: { name: string }[] }>;
  } | null;
}

async function getAllListings(): Promise<Listing[]> {
  const kv = getKv();
  if (!kv) return [];
  try {
    const raw = await kv.get(LISTINGS_KEY, "json");
    if (Array.isArray(raw)) return raw as Listing[];
    return [];
  } catch {
    return [];
  }
}

async function saveAllListings(listings: Listing[]): Promise<boolean> {
  const kv = getKv();
  if (!kv) return false;
  try {
    await kv.put(LISTINGS_KEY, JSON.stringify(listings));
    return true;
  } catch {
    return false;
  }
}

export async function getListings(): Promise<Listing[]> {
  const listings = await getAllListings();
  return listings
    .filter((l) => l.status === "active")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getMyListings(sellerId: string): Promise<Listing[]> {
  const listings = await getAllListings();
  return listings
    .filter((l) => l.sellerId === sellerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createListing(
  data: Omit<Listing, "id" | "createdAt" | "status" | "sellerId" | "sellerName">,
  user: { id: string; username: string; global_name: string | null },
): Promise<Listing | null> {
  const listings = await getAllListings();
  const maxId = listings.reduce((max, l) => Math.max(max, l.id), 0);
  const newListing: Listing = {
    id: maxId + 1,
    sellerId: user.id,
    sellerName: user.global_name || user.username,
    status: "active",
    createdAt: new Date().toISOString(),
    ...data,
  };
  listings.push(newListing);
  const saved = await saveAllListings(listings);
  return saved ? newListing : null;
}

export async function markListingSold(listingId: number, userId: string): Promise<boolean> {
  const listings = await getAllListings();
  const idx = listings.findIndex((l) => l.id === listingId);
  if (idx === -1) return false;
  if (listings[idx].sellerId !== userId) return false;
  listings[idx].status = "sold";
  return saveAllListings(listings);
}

export async function deleteListing(listingId: number, userId: string): Promise<boolean> {
  const listings = await getAllListings();
  const idx = listings.findIndex((l) => l.id === listingId);
  if (idx === -1) return false;
  if (listings[idx].sellerId !== userId) return false;
  listings.splice(idx, 1);
  return saveAllListings(listings);
}

export async function getListing(listingId: number): Promise<Listing | undefined> {
  const listings = await getAllListings();
  return listings.find((l) => l.id === listingId);
}
