import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, ArrowUpDown, Filter } from "lucide-react";
import { ITEMS, type ItemType } from "@/data/items";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import heroBg from "@/assets/pixel-hero-bg.jpg";
import { ReportPriceDialog } from "@/components/report-price-dialog";

const DISCORD_URL = "https://discord.gg/TJfR5EpzUw";
const ITEM_TYPES: { value: ItemType | "all"; label: string }[] = [
  { value: "all", label: "All Items" },
  { value: "wings", label: "Wings" },
  { value: "blocks", label: "Blocks" },
  { value: "clothing", label: "Clothing" },
  { value: "consumable", label: "Consumable" },
  { value: "faces", label: "Faces" },
  { value: "farms", label: "Farms" },
  { value: "tools", label: "Tools" },
];

export const Route = createFileRoute("/items")({
  validateSearch: (search: Record<string, string | undefined>) => ({
    search: search.search ?? "",
    type: (search.type as ItemType | "all") ?? "all",
    sort: (search.sort as "none" | "low" | "high") ?? "none",
  }),
  loader: async () => {
    const { getItems } = await import("@/lib/item-store");
    return await getItems();
  },
  head: () => ({
    meta: [
      { title: "Item Catalog — Crystal Realms Trading Hub" },
      {
        name: "description",
        content:
          "Browse the Crystal Realms item catalog. View prices, rarities, and types for wings, blocks, clothing, consumables, faces, farms, and tools.",
      },
    ],
  }),
  component: ItemsPage,
});

function ItemsPage() {
  const items = Route.useLoaderData();
  const { search, type: typeFilter, sort: sortDir } = Route.useSearch();
  const navigate = Route.useNavigate();

  function setSearch(val: string) {
    navigate({ search: (prev) => ({ ...prev, search: val }) });
  }
  function setTypeFilter(val: ItemType | "all") {
    navigate({ search: (prev) => ({ ...prev, type: val }) });
  }
  function setSortDir(val: "none" | "low" | "high") {
    navigate({ search: (prev) => ({ ...prev, sort: val }) });
  }

  function parsePriceFirst(p: string): number {
    const first = p.split(/[-–—+]/)[0].trim();
    const hasK = /k/i.test(first);
    const cleaned = first.replace(/[^0-9.]/g, "");
    const val = parseFloat(cleaned);
    if (isNaN(val)) return 0;
    return hasK ? val * 1000 : val;
  }

  const filtered = useMemo(() => {
    let result = items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      return matchesSearch && matchesType;
    });

    if (sortDir === "low") {
      result = [...result].sort((a, b) => parsePriceFirst(a.price) - parsePriceFirst(b.price));
    } else if (sortDir === "high") {
      result = [...result].sort((a, b) => parsePriceFirst(b.price) - parsePriceFirst(a.price));
    }

    return result;
  }, [items, search, typeFilter, sortDir]);

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
            <div className="text-center mb-12">
              <div className="inline-block mb-10 px-3 py-2 bg-deep-space pixel-border-gold">
                <span className="font-pixel text-[9px] tracking-[0.3em] text-loot uppercase">
                  ◆ Catalog ◆
                </span>
              </div>
              <h1 className="pixel-title text-5xl sm:text-6xl md:text-7xl mb-4 text-glow-crystal">
                ITEM
              </h1>
              <h1 className="pixel-title text-4xl sm:text-5xl md:text-6xl mb-6 text-glow-violet">
                CATALOG
              </h1>
              <p className="text-mist text-base max-w-xl mx-auto">
                Browse all available items, their types, and current market prices.
              </p>
            </div>

            <TooltipProvider>
              <div className="flex items-center justify-center gap-6 max-w-2xl mx-auto mb-12">
                <Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 bg-deep-space border-2 border-crystal/20 px-5 py-3 cursor-pointer hover:border-crystal/60 transition-colors">
                          <Search className="size-4 text-crystal" />
                          <span className="font-pixel text-[9px] tracking-widest text-mist uppercase">
                            Search
                          </span>
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="font-pixel text-[8px] tracking-wider text-mist bg-deep-space border border-crystal/20"
                    >
                      Search items by name
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent
                    side="bottom"
                    className="w-72 bg-deep-space border-crystal/20 p-4"
                  >
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mist pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-abyss border-2 border-crystal/20 text-frost font-pixel text-[10px] tracking-wider uppercase pl-10 pr-4 py-3 outline-none focus:border-crystal/60 transition-colors placeholder:text-mist/40"
                      />
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 bg-deep-space border-2 border-crystal/20 px-5 py-3 cursor-pointer hover:border-crystal/60 transition-colors">
                          <Filter className="size-4 text-mystic" />
                          <span className="font-pixel text-[9px] tracking-widest text-mist uppercase">
                            Type
                          </span>
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="font-pixel text-[8px] tracking-wider text-mist bg-deep-space border border-crystal/20"
                    >
                      Filter by item type
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent
                    side="bottom"
                    className="w-56 bg-deep-space border-crystal/20 p-3"
                  >
                    <div className="flex flex-col gap-1">
                      {ITEM_TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setTypeFilter(t.value as ItemType | "all")}
                          className={`text-left font-pixel text-[9px] tracking-wider uppercase px-3 py-2 border transition-colors cursor-pointer ${
                            typeFilter === t.value
                              ? "bg-crystal/20 text-crystal border-crystal/60"
                              : "text-mist border-transparent hover:border-crystal/30 hover:text-frost"
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <Popover>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <button className="flex items-center gap-2 bg-deep-space border-2 border-crystal/20 px-5 py-3 cursor-pointer hover:border-crystal/60 transition-colors">
                          <ArrowUpDown className="size-4 text-loot" />
                          <span className="font-pixel text-[9px] tracking-widest text-mist uppercase">
                            Sort
                          </span>
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="font-pixel text-[8px] tracking-wider text-mist bg-deep-space border border-crystal/20"
                    >
                      Sort by price
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent
                    side="bottom"
                    className="w-48 bg-deep-space border-crystal/20 p-3"
                  >
                    <div className="flex flex-col gap-1">
                      {[
                        { value: "none", label: "Default" },
                        { value: "low", label: "Price: Low → High" },
                        { value: "high", label: "Price: High → Low" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSortDir(opt.value as "none" | "low" | "high")}
                          className={`text-left font-pixel text-[9px] tracking-wider uppercase px-3 py-2 border transition-colors cursor-pointer ${
                            sortDir === opt.value
                              ? "bg-crystal/20 text-crystal border-crystal/60"
                              : "text-mist border-transparent hover:border-crystal/30 hover:text-frost"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </TooltipProvider>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <svg
                  viewBox="0 0 64 64"
                  width="80"
                  height="80"
                  className="mx-auto mb-6"
                  shape-rendering="crispEdges"
                >
                  <polygon
                    points="32,4 58,22 50,56 14,56 6,22"
                    fill="#1a1a2e"
                    stroke="#00e5ff"
                    stroke-width="2"
                  />
                  <polygon
                    points="32,10 52,26 46,52 18,52 12,26"
                    fill="#0d0d2e"
                    stroke="#4ffbff"
                    stroke-width="1"
                  />
                  <rect x="28" y="20" width="8" height="16" fill="#00e5ff" />
                  <rect x="24" y="36" width="16" height="4" fill="#00e5ff" />
                  <rect x="28" y="40" width="8" height="4" fill="#00e5ff" />
                  <rect x="30" y="44" width="4" height="8" fill="#00e5ff" />
                </svg>
                <p className="font-pixel text-[11px] tracking-widest text-mist uppercase">
                  No items found matching your search.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((item, i) => (
                  <div
                    key={item.id}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
                  >
                    <ItemCard item={item} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 text-center text-mist font-pixel text-[9px] tracking-widest uppercase pb-4">
              Showing {filtered.length} of {items.length} items
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: Item }) {
  const typeColors: Record<string, string> = {
    blocks: "text-crystal border-crystal/40",
    clothing: "text-mystic border-mystic/40",
    consumable: "text-loot border-loot/40",
    faces: "text-shard border-shard/40",
    farms: "text-aqua border-aqua/40",
    tools: "text-neon-blue border-neon-blue/40",
    wings: "text-shard border-shard/40",
  };

  const typeLabels: Record<string, string> = {
    blocks: "Block",
    clothing: "Clothing",
    consumable: "Consumable",
    faces: "Face",
    farms: "Farm",
    tools: "Tool",
    wings: "Wings",
  };

  const rarityColors: Record<string, string> = {
    Common: "text-mist",
    Uncommon: "text-aqua",
    Rare: "text-crystal",
    Epic: "text-mystic",
    Legendary: "text-loot",
    Mythic: "text-loot text-glow-soft",
  };

  return (
    <div className="bg-deep-space pixel-border-violet p-5 flex flex-col h-full transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className="font-pixel text-[10px] leading-[1.5] tracking-wider uppercase text-frost flex-1 min-h-[3em] line-clamp-2">
          {item.name}
        </h3>
        <span
          className={`font-pixel text-[7px] tracking-widest uppercase whitespace-nowrap ${rarityColors[item.rarity]}`}
        >
          [{item.rarity}]
        </span>
      </div>

      {item.image && (
        <div className="relative aspect-square bg-abyss border-2 border-crystal/20 mb-4 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-contain pixelated"
            loading="lazy"
          />
        </div>
      )}

      <div className="mt-auto">
        <div className="rune-divider my-3" />

        <div className="flex items-center justify-between">
          <span
            className={`font-pixel text-[8px] tracking-widest uppercase px-2 py-1 border ${typeColors[item.type]}`}
          >
            {typeLabels[item.type]}
          </span>

          <div className="text-right">
            <div className="font-pixel text-[7px] tracking-widest text-mist uppercase mb-0.5">
              Price
            </div>
            <div className="font-pixel text-sm text-loot text-glow-soft">{item.price}rt</div>
          </div>
        </div>
        <ReportPriceDialog item={item} />
      </div>
    </div>
  );
}
