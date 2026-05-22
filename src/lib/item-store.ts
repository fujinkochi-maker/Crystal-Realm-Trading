import { ITEMS, type Item } from "@/data/items";

type PriceOverride = {
  price: string;
  updatedBy: string;
  updatedAt: string;
};

export type ItemOverride = {
  name?: string;
  type?: ItemType;
  price?: string;
  rarity?: string;
  image?: string | null;
  updatedBy: string;
  updatedAt: string;
};

const CUSTOM_ITEMS_KEY = "custom-items";

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

async function getCustomItems(): Promise<Item[]> {
  const kv = getKv();
  if (!kv) return [];
  try {
    const raw = await kv.get(CUSTOM_ITEMS_KEY, "json");
    if (Array.isArray(raw)) return raw as Item[];
    return [];
  } catch {
    return [];
  }
}

async function saveCustomItems(items: Item[]): Promise<boolean> {
  const kv = getKv();
  if (!kv) return false;
  try {
    await kv.put(CUSTOM_ITEMS_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export async function getItems(): Promise<Item[]> {
  const kv = getKv();
  if (!kv) return ITEMS;

  const staticItems = ITEMS.map((item) => ({ ...item }));
  const customItems = await getCustomItems();

  const allItems = [...staticItems, ...customItems];

  for (const item of allItems) {
    try {
      const priceOverride = (await kv.get(`price:${item.id}`, "json")) as PriceOverride | null;
      if (priceOverride?.price) {
        item.price = priceOverride.price;
      }
    } catch {
      /* skip */
    }
    try {
      const itemOverride = (await kv.get(`item:${item.id}`, "json")) as ItemOverride | null;
      if (itemOverride) {
        if (itemOverride.name !== undefined) item.name = itemOverride.name;
        if (itemOverride.type !== undefined) item.type = itemOverride.type;
        if (itemOverride.rarity !== undefined) item.rarity = itemOverride.rarity;
        if (itemOverride.price !== undefined) item.price = itemOverride.price;
        if (itemOverride.image !== undefined) item.image = itemOverride.image ?? undefined;
      }
    } catch {
      /* skip */
    }
  }

  return allItems;
}

export async function updateItemPrice(
  itemId: number,
  price: string,
  updatedBy: string,
): Promise<boolean> {
  const kv = getKv();
  if (!kv) return false;

  const override: PriceOverride = {
    price,
    updatedBy,
    updatedAt: new Date().toISOString(),
  };

  try {
    await kv.put(`price:${itemId}`, JSON.stringify(override));
    return true;
  } catch {
    return false;
  }
}

export async function updateItem(
  itemId: number,
  overrides: Omit<ItemOverride, "updatedBy" | "updatedAt">,
  updatedBy: string,
): Promise<boolean> {
  const kv = getKv();
  if (!kv) return false;

  const existing: ItemOverride | null = (await kv
    .get(`item:${itemId}`, "json")
    .catch(() => null)) as ItemOverride | null;

  const merged: ItemOverride = {
    ...(existing || {}),
    ...overrides,
    updatedBy,
    updatedAt: new Date().toISOString(),
  };

  try {
    await kv.put(`item:${itemId}`, JSON.stringify(merged));
    return true;
  } catch {
    return false;
  }
}

export async function addCustomItem(item: Omit<Item, "id">): Promise<Item | null> {
  const kv = getKv();
  if (!kv) return null;

  const customItems = await getCustomItems();
  const maxId = customItems.reduce((max, i) => Math.max(max, i.id), 999);
  const newItem: Item = { id: maxId + 1, ...item };

  customItems.push(newItem);
  const saved = await saveCustomItems(customItems);
  return saved ? newItem : null;
}

export async function removeCustomItem(itemId: number): Promise<boolean> {
  const kv = getKv();
  if (!kv) return false;

  const customItems = await getCustomItems();
  const filtered = customItems.filter((i) => i.id !== itemId);
  if (filtered.length === customItems.length) return false;
  return saveCustomItems(filtered);
}

export async function getItem(itemId: number): Promise<Item | undefined> {
  const items = await getItems();
  return items.find((i) => i.id === itemId);
}

export function getAdminPassword(): string {
  const env = (globalThis as Record<string, unknown>).__cloudflare_env as
    | Record<string, unknown>
    | undefined;
  const wranglerPw = typeof env?.ADMIN_PASSWORD === "string" ? env.ADMIN_PASSWORD : "";
  const vitePw = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;
  return wranglerPw || vitePw || "";
}
