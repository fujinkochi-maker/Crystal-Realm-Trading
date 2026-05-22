import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { type Item, type ItemType } from "@/data/items";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import heroBg from "@/assets/pixel-hero-bg.jpg";
import { Save, Shield, Lock, Unlock, Search, Plus, Trash2, X } from "lucide-react";

const ITEM_TYPES: { value: ItemType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "wings", label: "Wings" },
  { value: "blocks", label: "Blocks" },
  { value: "clothing", label: "Clothing" },
  { value: "consumable", label: "Consumable" },
  { value: "faces", label: "Faces" },
  { value: "farms", label: "Farms" },
  { value: "tools", label: "Tools" },
];

const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic"];

const addItem = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const data = ctx.data as {
    name: string;
    type: string;
    price: string;
    rarity: string;
    image: string;
    password: string;
  };
  const { addCustomItem, getAdminPassword } = await import("@/lib/item-store");
  if (data.password !== getAdminPassword()) {
    return { ok: false as const, error: "Invalid password" };
  }
  const item = await addCustomItem({
    name: data.name,
    type: data.type as Item["type"],
    price: data.price,
    rarity: data.rarity,
    image: data.image || undefined,
  });
  return { ok: true as const, item };
});

const deleteItem = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const data = ctx.data as { itemId: number; password: string };
  const { removeCustomItem, getAdminPassword } = await import("@/lib/item-store");
  if (data.password !== getAdminPassword()) {
    return { ok: false as const, error: "Invalid password" };
  }
  const success = await removeCustomItem(data.itemId);
  return { ok: success as true };
});

const updatePrice = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const { itemId, price, password } = ctx.data as {
    itemId: number;
    price: string;
    password: string;
  };
  const { updateItemPrice, getAdminPassword } = await import("@/lib/item-store");
  if (password !== getAdminPassword()) {
    return { ok: false as const, error: "Invalid password" };
  }
  const success = await updateItemPrice(itemId, price, "admin");
  return { ok: success as true };
});

const updateItem = createServerFn({ method: "POST" }).handler(async (ctx) => {
  const data = ctx.data as {
    itemId: number;
    name?: string;
    type?: string;
    price?: string;
    rarity?: string;
    image?: string | null;
    password: string;
  };
  const { updateItem: storeUpdateItem, getAdminPassword } = await import("@/lib/item-store");
  if (data.password !== getAdminPassword()) {
    return { ok: false as const, error: "Invalid password" };
  }
  const success = await storeUpdateItem(
    data.itemId,
    {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type as import("@/data/items").ItemType }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.rarity !== undefined && { rarity: data.rarity }),
      ...(data.image !== undefined && { image: data.image }),
    },
    "admin",
  );
  return { ok: success as true };
});

export const Route = createFileRoute("/admin/prices")({
  loader: async () => {
    const { getItems } = await import("@/lib/item-store");
    return await getItems();
  },
  component: AdminPrices,
  head: () => ({
    meta: [
      { title: "Admin — Item Editor | Crystal Realms" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminPrices() {
  const initialItems = Route.useLoaderData();
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [editedItems, setEditedItems] = useState<Record<number, Item>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<ItemType | "all">("all");
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    type: "wings" as ItemType,
    price: "",
    rarity: "Common",
    image: "",
  });

  const filtered = useMemo(() => {
    return initialItems.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const displayName = (editedItems[item.id]?.name || item.name).toLowerCase();
      const matchesSearch = displayName.includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [initialItems, editedItems, typeFilter, search]);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_pw");
    if (saved) {
      setPassword(saved);
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const initial: Record<number, Item> = {};
    for (const item of initialItems) {
      initial[item.id] = { ...item };
    }
    setEditedItems(initial);
  }, [initialItems]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Enter a password");
      return;
    }
    sessionStorage.setItem("admin_pw", password);
    setAuthenticated(true);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_pw");
    setPassword("");
    setAuthenticated(false);
  }

  async function handleSave(item: Item) {
    const edit = editedItems[item.id];
    if (!edit) return;

    const payload: Record<string, string | number | null> = { itemId: item.id, password };
    const changed: string[] = [];
    if (edit.name !== item.name && edit.name.trim()) {
      payload.name = edit.name;
      changed.push("name");
    }
    if (edit.type !== item.type) {
      payload.type = edit.type;
      changed.push("type");
    }
    if (edit.rarity !== item.rarity) {
      payload.rarity = edit.rarity;
      changed.push("rarity");
    }
    if (edit.price.trim() !== item.price.trim()) {
      if (!edit.price.trim()) {
        toast.error("Price cannot be empty");
        return;
      }
      payload.price = edit.price;
      changed.push("price");
    }
    if (edit.image !== item.image) {
      payload.image = edit.image || null;
      changed.push("image");
    }

    if (changed.length === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving((prev) => ({ ...prev, [item.id]: true }));
    try {
      const result = await updateItem({ data: payload });
      if (result.ok) {
        toast.success(`${item.name} updated (${changed.join(", ")})`);
      } else {
        toast.error(result.error || "Save failed");
        if (result.error === "Invalid password") handleLogout();
      }
    } catch {
      toast.error("Failed to save. Try again.");
    } finally {
      setSaving((prev) => ({ ...prev, [item.id]: false }));
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.price.trim()) {
      toast.error("Name and price are required");
      return;
    }
    setSaving((prev) => ({ ...prev, [-1]: true }));
    try {
      const result = await addItem({
        data: { ...newItem, password },
      });
      if (result.ok) {
        toast.success(`${newItem.name} added`);
        setShowAddForm(false);
        setNewItem({ name: "", type: "wings", price: "", rarity: "Common", image: "" });
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to add item");
        if (result.error === "Invalid password") handleLogout();
      }
    } catch {
      toast.error("Failed to add item");
    } finally {
      setSaving((prev) => ({ ...prev, [-1]: false }));
    }
  }

  async function handleDelete(item: Item) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setSaving((prev) => ({ ...prev, [item.id]: true }));
    try {
      const result = await deleteItem({ data: { itemId: item.id, password } });
      if (result.ok) {
        toast.success(`${item.name} deleted`);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to delete");
        if (result.error === "Invalid password") handleLogout();
      }
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setSaving((prev) => ({ ...prev, [item.id]: false }));
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-abyss text-frost font-sans flex flex-col">
        <Nav />
        <section className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-sm w-full bg-deep-space pixel-border-violet p-8">
            <div className="text-center mb-6">
              <Lock className="size-8 text-crystal mx-auto mb-4" />
              <h1 className="font-pixel text-sm tracking-[0.3em] text-crystal uppercase">
                Admin Access
              </h1>
              <p className="text-mist text-sm mt-3 font-pixel text-[8px] tracking-wider">
                Enter the admin password to manage items.
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-abyss border-2 border-crystal/20 text-frost font-pixel text-[10px] tracking-wider uppercase px-4 py-3 outline-none focus:border-crystal/60 transition-colors placeholder:text-mist/40"
                autoFocus
              />
              <button
                type="submit"
                className="w-full font-pixel text-[9px] tracking-widest text-crystal uppercase border-2 border-crystal/40 px-4 py-3 hover:bg-crystal/10 hover:border-crystal transition-colors cursor-pointer"
              >
                Unlock
              </button>
            </form>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const overriddenIds = new Set<number>();

  return (
    <div className="min-h-screen bg-abyss text-frost font-sans selection:bg-crystal/30 selection:text-frost overflow-x-hidden animate-in fade-in duration-700">
      <div
        className="fixed inset-0 pixelated"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-abyss/90 via-abyss/85 to-abyss" />
      <div className="relative z-10">
        <Nav />
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
              <div>
                <div className="inline-block mb-4 px-3 py-2 bg-deep-space pixel-border-gold">
                  <span className="font-pixel text-[9px] tracking-[0.3em] text-loot uppercase flex items-center gap-2">
                    <Shield className="size-3" /> Admin Panel
                  </span>
                </div>
                <h1 className="font-pixel text-2xl md:text-3xl text-frost">
                  Item <span className="gradient-text-crystal">Editor</span>
                </h1>
              </div>
              <button
                onClick={handleLogout}
                className="font-pixel text-[8px] tracking-widest text-mist uppercase border border-crystal/20 px-3 py-2 hover:border-crystal/60 hover:text-frost transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Unlock className="size-3" /> Logout
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={() => setShowAddForm((p) => !p)}
                className="font-pixel text-[8px] tracking-widest text-crystal uppercase border border-crystal/40 px-3 py-2 hover:bg-crystal/10 hover:border-crystal transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {showAddForm ? <X className="size-3" /> : <Plus className="size-3" />}
                {showAddForm ? "Cancel" : "Add Item"}
              </button>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-mist pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items..."
                  className="w-full bg-abyss border-2 border-crystal/20 text-frost font-pixel text-[8px] tracking-wider uppercase pl-9 pr-3 py-2.5 outline-none focus:border-crystal/60 transition-colors placeholder:text-mist/40"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ITEM_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTypeFilter(t.value as ItemType | "all")}
                    className={`font-pixel text-[7px] tracking-widest uppercase px-2.5 py-1.5 border transition-colors cursor-pointer ${
                      typeFilter === t.value
                        ? "bg-crystal/20 text-crystal border-crystal/60"
                        : "text-mist border-crystal/20 hover:border-crystal/40 hover:text-frost"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {showAddForm && (
              <form
                onSubmit={handleAddItem}
                className="mb-6 bg-deep-space border border-crystal/20 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
              >
                <div>
                  <div className="font-pixel text-[7px] tracking-widest text-mist uppercase mb-1">
                    Name *
                  </div>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Item name"
                    className="w-full bg-abyss border border-crystal/20 text-frost font-pixel text-[8px] tracking-wider px-2.5 py-2 outline-none focus:border-crystal/60 transition-colors placeholder:text-mist/40"
                    required
                  />
                </div>
                <div>
                  <div className="font-pixel text-[7px] tracking-widest text-mist uppercase mb-1">
                    Type
                  </div>
                  <select
                    value={newItem.type}
                    onChange={(e) =>
                      setNewItem((p) => ({ ...p, type: e.target.value as ItemType }))
                    }
                    className="w-full bg-abyss border border-crystal/20 text-frost font-pixel text-[8px] tracking-wider px-2.5 py-2 outline-none focus:border-crystal/60 transition-colors"
                  >
                    {ITEM_TYPES.filter((t) => t.value !== "all").map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="font-pixel text-[7px] tracking-widest text-mist uppercase mb-1">
                    Price *
                  </div>
                  <input
                    type="text"
                    value={newItem.price}
                    onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))}
                    placeholder="e.g. 5k-6k"
                    className="w-full bg-abyss border border-crystal/20 text-loot font-pixel text-[8px] tracking-wider px-2.5 py-2 outline-none focus:border-crystal/60 transition-colors placeholder:text-mist/40"
                    required
                  />
                </div>
                <div>
                  <div className="font-pixel text-[7px] tracking-widest text-mist uppercase mb-1">
                    Rarity
                  </div>
                  <select
                    value={newItem.rarity}
                    onChange={(e) => setNewItem((p) => ({ ...p, rarity: e.target.value }))}
                    className="w-full bg-abyss border border-crystal/20 text-frost font-pixel text-[8px] tracking-wider px-2.5 py-2 outline-none focus:border-crystal/60 transition-colors"
                  >
                    {RARITIES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="font-pixel text-[7px] tracking-widest text-mist uppercase mb-1">
                    Image URL
                  </div>
                  <input
                    type="text"
                    value={newItem.image}
                    onChange={(e) => setNewItem((p) => ({ ...p, image: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-abyss border border-crystal/20 text-frost font-pixel text-[8px] tracking-wider px-2.5 py-2 outline-none focus:border-crystal/60 transition-colors placeholder:text-mist/40"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving[-1]}
                    className="font-pixel text-[8px] tracking-widest text-crystal uppercase border-2 border-crystal/40 px-4 py-2 hover:bg-crystal/10 hover:border-crystal transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="size-3" />
                    {saving[-1] ? "Adding..." : "Add Item"}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto max-h-[75vh] min-h-[300px] overflow-y-auto border-2 border-crystal/10">
              <table className="w-full table-fixed border-collapse">
                <thead className="sticky top-0 bg-abyss z-10">
                  <tr className="border-b-2 border-crystal/20">
                    <th className="w-2/5 font-pixel text-[8px] tracking-widest text-mist uppercase text-left px-3 py-3">
                      Item
                    </th>
                    <th className="w-[12%] font-pixel text-[8px] tracking-widest text-mist uppercase text-left px-3 py-3 hidden sm:table-cell">
                      Type
                    </th>
                    <th className="w-[12%] font-pixel text-[8px] tracking-widest text-mist uppercase text-left px-3 py-3 hidden md:table-cell">
                      Rarity
                    </th>
                    <th className="w-[18%] font-pixel text-[8px] tracking-widest text-mist uppercase text-left px-3 py-3">
                      Price
                    </th>
                    <th className="w-[10%] font-pixel text-[8px] tracking-widest text-mist uppercase text-center px-3 py-3 hidden sm:table-cell">
                      Status
                    </th>
                    <th className="w-[18%] px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const edit = editedItems[item.id] ?? item;
                    const isOverridden =
                      edit.name !== item.name ||
                      edit.type !== item.type ||
                      edit.rarity !== item.rarity ||
                      edit.price.trim() !== item.price.trim() ||
                      (edit.image ?? "") !== (item.image ?? "");
                    if (isOverridden) overriddenIds.add(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`border-b border-crystal/10 hover:bg-crystal/5 transition-colors ${
                          isOverridden ? "bg-loot/5" : ""
                        }`}
                      >
                        <td className="px-3 py-3">
                          <div className="flex flex-col gap-2 max-w-full">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={edit.image || item.image}
                                  alt=""
                                  className="size-9 object-contain pixelated flex-shrink-0"
                                />
                              )}
                              <input
                                type="text"
                                value={edit.name}
                                onChange={(e) =>
                                  setEditedItems((prev) => ({
                                    ...prev,
                                    [item.id]: { ...(prev[item.id] ?? item), name: e.target.value },
                                  }))
                                }
                                className="flex-1 min-w-0 bg-abyss border border-crystal/20 text-frost font-pixel text-[9px] tracking-wider px-2 py-1.5 outline-none focus:border-crystal/60 transition-colors"
                              />
                            </div>
                            <input
                              type="text"
                              value={edit.image ?? ""}
                              onChange={(e) =>
                                setEditedItems((prev) => ({
                                  ...prev,
                                  [item.id]: {
                                    ...(prev[item.id] ?? item),
                                    image: e.target.value || undefined,
                                  },
                                }))
                              }
                              placeholder="Image URL"
                              className="w-full bg-abyss border border-crystal/10 text-mist font-pixel text-[7px] tracking-wider px-2 py-1 outline-none focus:border-crystal/40 transition-colors placeholder:text-mist/30"
                            />
                          </div>
                        </td>
                        <td className="px-3 py-3 hidden sm:table-cell">
                          <select
                            value={edit.type}
                            onChange={(e) =>
                              setEditedItems((prev) => ({
                                ...prev,
                                [item.id]: {
                                  ...(prev[item.id] ?? item),
                                  type: e.target.value as ItemType,
                                },
                              }))
                            }
                            className="w-full bg-abyss border border-crystal/20 text-frost font-pixel text-[8px] tracking-wider px-2 py-1.5 outline-none focus:border-crystal/60 transition-colors"
                          >
                            {ITEM_TYPES.filter((t) => t.value !== "all").map((t) => (
                              <option key={t.value} value={t.value}>
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-3 hidden md:table-cell">
                          <select
                            value={edit.rarity}
                            onChange={(e) =>
                              setEditedItems((prev) => ({
                                ...prev,
                                [item.id]: { ...(prev[item.id] ?? item), rarity: e.target.value },
                              }))
                            }
                            className="w-full bg-abyss border border-crystal/20 text-frost font-pixel text-[8px] tracking-wider px-2 py-1.5 outline-none focus:border-crystal/60 transition-colors"
                          >
                            {RARITIES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="text"
                            value={edit.price}
                            onChange={(e) =>
                              setEditedItems((prev) => ({
                                ...prev,
                                [item.id]: { ...(prev[item.id] ?? item), price: e.target.value },
                              }))
                            }
                            className="w-full bg-abyss border-2 border-crystal/20 text-loot font-pixel text-[9px] tracking-wider px-2 py-1.5 outline-none focus:border-crystal/60 transition-colors"
                          />
                        </td>
                        <td className="px-3 py-3 text-center hidden sm:table-cell">
                          {isOverridden && (
                            <span className="font-pixel text-[7px] tracking-widest text-loot uppercase">
                              Modified
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <div className="flex items-center gap-1.5 justify-end">
                            {item.id >= 1000 && (
                              <button
                                onClick={() => handleDelete(item)}
                                disabled={saving[item.id]}
                                className="font-pixel text-[8px] tracking-widest text-red-400 uppercase border border-red-400/40 px-2 py-1.5 hover:bg-red-400/10 hover:border-red-400/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="size-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleSave(item)}
                              disabled={saving[item.id]}
                              className="font-pixel text-[8px] tracking-widest text-crystal uppercase border border-crystal/40 px-3 py-1.5 hover:bg-crystal/10 hover:border-crystal transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                            >
                              <Save className="size-3" />
                              {saving[item.id] ? "..." : "Save"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-8 text-center text-mist font-pixel text-[8px] tracking-widest uppercase">
              Showing {filtered.length} of {initialItems.length} items
              {overriddenIds.size > 0 && ` · ${overriddenIds.size} modified`}
            </p>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
