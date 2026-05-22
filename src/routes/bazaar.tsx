"use client";

import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, Plus, CheckCircle2, Clock, User } from "lucide-react";
import { toast } from "sonner";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import heroBg from "@/assets/pixel-hero-bg.jpg";
import type { Listing, ListingCategory } from "@/lib/listing-store";

const CATEGORIES: { value: ListingCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "selling", label: "Selling" },
  { value: "buying", label: "Buying" },
  { value: "trading", label: "Trading" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export const Route = createFileRoute("/bazaar")({
  loader: async () => {
    const { getListings } = await import("@/lib/listing-store");
    return await getListings();
  },
  head: () => ({
    meta: [
      { title: "Bazaar — Crystal Realms Trading Hub" },
      {
        name: "description",
        content:
          "Browse player listings in the Crystal Realms Bazaar. Buy, sell, and trade items with the community.",
      },
    ],
  }),
  component: BazaarPage,
});

function BazaarPage() {
  const listings = Route.useLoaderData();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ListingCategory | "all">("all");

  const filtered = useMemo(() => {
    const result = listings.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.sellerName.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || l.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    return result;
  }, [listings, search, categoryFilter]);

  const categoryLabels: Record<string, string> = {
    selling: "Selling",
    buying: "Buying",
    trading: "Trading",
  };

  const categoryColors: Record<string, string> = {
    selling: "text-crystal border-crystal/40",
    buying: "text-loot border-loot/40",
    trading: "text-mystic border-mystic/40",
  };

  const categoryBgColors: Record<string, string> = {
    selling: "bg-crystal/10 text-crystal border-crystal/40",
    buying: "bg-loot/10 text-loot border-loot/40",
    trading: "bg-mystic/10 text-mystic border-mystic/40",
  };

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
                  ◆ Bazaar ◆
                </span>
              </div>
              <h1 className="pixel-title text-5xl sm:text-6xl md:text-7xl mb-4 text-glow-crystal">
                PLAYER
              </h1>
              <h1 className="pixel-title text-4xl sm:text-5xl md:text-6xl mb-6 text-glow-violet">
                BAZAAR
              </h1>
              <p className="text-mist text-base max-w-xl mx-auto mb-8">
                Browse listings from players — buy, sell, and trade items and services.
              </p>
              <CreateListingDialog onCreated={() => window.location.reload()} />
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
                      Search listings by title or seller
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
                        placeholder="Search listings..."
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
                            {categoryFilter === "all" ? "Category" : categoryLabels[categoryFilter]}
                          </span>
                        </button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      className="font-pixel text-[8px] tracking-wider text-mist bg-deep-space border border-crystal/20"
                    >
                      Filter by category
                    </TooltipContent>
                  </Tooltip>
                  <PopoverContent
                    side="bottom"
                    className="w-48 bg-deep-space border-crystal/20 p-3"
                  >
                    <div className="flex flex-col gap-1">
                      {CATEGORIES.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => setCategoryFilter(c.value as ListingCategory | "all")}
                          className={`text-left font-pixel text-[9px] tracking-wider uppercase px-3 py-2 border transition-colors cursor-pointer ${
                            categoryFilter === c.value
                              ? "bg-crystal/20 text-crystal border-crystal/60"
                              : "text-mist border-transparent hover:border-crystal/30 hover:text-frost"
                          }`}
                        >
                          {c.label}
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
                  <rect
                    x="12"
                    y="8"
                    width="40"
                    height="48"
                    rx="4"
                    fill="#1a1a2e"
                    stroke="#00e5ff"
                    stroke-width="2"
                  />
                  <rect x="20" y="18" width="24" height="4" fill="#00e5ff" />
                  <rect x="20" y="26" width="24" height="2" fill="#4ffbff" />
                  <rect x="20" y="32" width="24" height="2" fill="#4ffbff" />
                  <rect x="20" y="38" width="16" height="2" fill="#4ffbff" />
                  <circle cx="32" cy="48" r="4" fill="#ffd700" />
                </svg>
                <p className="font-pixel text-[11px] tracking-widest text-mist uppercase">
                  No listings found.
                </p>
                <p className="font-pixel text-[8px] tracking-wider text-mist/60 mt-2 uppercase">
                  Be the first to create one!
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((listing, i) => (
                  <div
                    key={listing.id}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className="h-full animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-backwards"
                  >
                    <ListingCard
                      listing={listing}
                      categoryBgColors={categoryBgColors}
                      categoryLabels={categoryLabels}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-10 text-center text-mist font-pixel text-[9px] tracking-widest uppercase pb-4">
              Showing {filtered.length} of {listings.length} active listings
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}

function ListingCard({
  listing,
  categoryBgColors,
  categoryLabels,
}: {
  listing: Listing;
  categoryBgColors: Record<string, string>;
  categoryLabels: Record<string, string>;
}) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const maxDescLen = 120;
  const isLong = listing.description.length > maxDescLen;

  return (
    <div className="bg-deep-space pixel-border-violet p-5 flex flex-col h-full transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3 gap-2">
        <h3 className="font-pixel text-[10px] leading-[1.5] tracking-wider uppercase text-frost flex-1">
          {listing.title}
        </h3>
        <span
          className={`font-pixel text-[7px] tracking-widest uppercase whitespace-nowrap px-2 py-1 border ${categoryBgColors[listing.category]}`}
        >
          {categoryLabels[listing.category]}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <User className="size-3 text-mist shrink-0" />
        <span className="font-pixel text-[7px] tracking-widest text-mist uppercase truncate">
          {listing.sellerName}
        </span>
        <span className="font-pixel text-[7px] tracking-widest text-mist/50 uppercase ml-auto whitespace-nowrap flex items-center gap-1">
          <Clock className="size-2.5" />
          {timeAgo(listing.createdAt)}
        </span>
      </div>

      {listing.image && (
        <div className="relative aspect-square bg-abyss border-2 border-crystal/20 mb-4 overflow-hidden">
          <img
            src={listing.image}
            alt={listing.title}
            className="w-full h-full object-contain pixelated"
            loading="lazy"
          />
        </div>
      )}

      <div className="bg-abyss border border-crystal/10 p-3 mb-4 flex-1">
        <p className="font-sans text-[11px] text-mist leading-relaxed">
          {showFullDesc || !isLong
            ? listing.description
            : `${listing.description.slice(0, maxDescLen)}…`}
        </p>
        {isLong && (
          <button
            onClick={() => setShowFullDesc(!showFullDesc)}
            className="font-pixel text-[7px] tracking-widest text-crystal uppercase mt-1 hover:text-aqua transition-colors cursor-pointer"
          >
            [{showFullDesc ? "Show less" : "Read more"}]
          </button>
        )}
      </div>

      <div className="rune-divider my-3" />

      <div className="flex items-center justify-between">
        <div className="text-right">
          <div className="font-pixel text-[7px] tracking-widest text-mist uppercase mb-0.5">
            Price
          </div>
          <div className="font-pixel text-sm text-loot text-glow-soft">{listing.price}</div>
        </div>
      </div>
    </div>
  );
}

function CreateListingDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ListingCategory>("selling");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authState, setAuthState] = useState<"loading" | "authed" | "unauthed">("loading");
  const [authUser, setAuthUser] = useState<{ username: string; global_name: string | null } | null>(
    null,
  );

  useEffect(() => {
    if (!open) return;
    setAuthState("loading");
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authed) {
          setAuthState("authed");
          setAuthUser(data.user);
        } else {
          setAuthState("unauthed");
        }
      })
      .catch(() => {
        setAuthState("unauthed");
      });
  }, [open]);

  function handleVerify() {
    window.location.href = "/api/auth/discord";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !price.trim() || !description.trim()) {
      toast.error("Title, price, and description are required");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          price: price.trim(),
          description: description.trim(),
          image: image.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      toast.success("Listing created!");
      setTitle("");
      setCategory("selling");
      setPrice("");
      setDescription("");
      setImage("");
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  }

  const categoryOptions: { value: ListingCategory; label: string }[] = [
    { value: "selling", label: "Selling" },
    { value: "buying", label: "Buying" },
    { value: "trading", label: "Trading" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="btn-pixel inline-flex items-center gap-3 px-6 py-4 text-[10px] tracking-[0.25em] uppercase">
          <Plus className="size-4" strokeWidth={3} />
          Create Listing
        </button>
      </DialogTrigger>
      <DialogContent className="bg-deep-space border-crystal/30 pixel-border-violet max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-pixel text-[11px] tracking-[0.3em] text-crystal uppercase">
            New Listing
          </DialogTitle>
          <DialogDescription className="font-pixel text-[8px] tracking-wider text-mist">
            {authState === "unauthed"
              ? "Verify your Discord membership to create a listing."
              : "Fill in the details of your offer."}
          </DialogDescription>
        </DialogHeader>

        {authState === "loading" ? (
          <div className="flex items-center justify-center py-12">
            <div className="font-pixel text-[9px] tracking-widest text-mist uppercase animate-pulse">
              Checking...
            </div>
          </div>
        ) : authState === "unauthed" ? (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <svg
                viewBox="0 0 64 64"
                width="64"
                height="64"
                className="mx-auto mb-4"
                shape-rendering="crispEdges"
              >
                <rect
                  x="16"
                  y="12"
                  width="32"
                  height="40"
                  rx="4"
                  fill="#1a1a2e"
                  stroke="#8b5cf6"
                  stroke-width="2"
                />
                <rect x="20" y="18" width="24" height="4" fill="#8b5cf6" />
                <rect x="20" y="26" width="24" height="2" fill="#4ffbff" />
                <rect x="20" y="32" width="24" height="2" fill="#4ffbff" />
                <rect x="20" y="38" width="16" height="2" fill="#4ffbff" />
                <circle cx="42" cy="44" r="7" fill="#5865F2" />
                <text
                  x="42"
                  y="48"
                  text-anchor="middle"
                  fill="white"
                  font-size="10"
                  font-weight="bold"
                >
                  D
                </text>
              </svg>
              <p className="font-pixel text-[9px] tracking-wider text-frost mb-6">
                You need to verify your Discord membership to create listings.
              </p>
              <button
                onClick={handleVerify}
                className="font-pixel text-[9px] tracking-widest uppercase bg-[#5865F2] text-white px-6 py-3 border-2 border-[#5865F2] hover:bg-[#4752C4] transition-colors cursor-pointer"
              >
                ◆ Verify with Discord ◆
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="font-pixel text-[8px] tracking-widest text-mist uppercase mb-1">
                Title *
              </div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What are you offering?"
                className="bg-abyss border-crystal/20 text-frost font-pixel text-[9px] tracking-wider placeholder:text-mist/40"
                required
              />
            </div>

            <div>
              <div className="font-pixel text-[8px] tracking-widest text-mist uppercase mb-1">
                Category *
              </div>
              <div className="flex gap-2">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCategory(opt.value)}
                    className={`flex-1 font-pixel text-[8px] tracking-wider uppercase px-3 py-2 border transition-colors cursor-pointer ${
                      category === opt.value
                        ? "bg-crystal/20 text-crystal border-crystal/60"
                        : "text-mist border-crystal/20 hover:border-crystal/40 hover:text-frost"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="font-pixel text-[8px] tracking-widest text-mist uppercase mb-1">
                Price *
              </div>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 25k, negotiable"
                className="bg-abyss border-crystal/20 text-frost font-pixel text-[9px] tracking-wider placeholder:text-mist/40"
                required
              />
            </div>

            <div>
              <div className="font-pixel text-[8px] tracking-widest text-mist uppercase mb-1">
                Description *
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your offer..."
                rows={4}
                className="w-full bg-abyss border-2 border-crystal/20 text-frost font-pixel text-[9px] tracking-wider p-3 outline-none focus:border-crystal/60 transition-colors placeholder:text-mist/40 resize-none"
                required
              />
            </div>

            <div>
              <div className="font-pixel text-[8px] tracking-widest text-mist uppercase mb-1">
                Image URL (optional)
              </div>
              <Input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/item.png"
                className="bg-abyss border-crystal/20 text-frost font-pixel text-[9px] tracking-wider placeholder:text-mist/40"
              />
            </div>

            <div className="font-pixel text-[7px] tracking-widest text-aqua uppercase flex items-center gap-2">
              <CheckCircle2 className="size-3" />
              Verified as {authUser?.global_name || authUser?.username}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="font-pixel text-[8px] tracking-widest text-mist uppercase hover:text-frost"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="font-pixel text-[8px] tracking-widest text-crystal uppercase bg-deep-space border-2 border-crystal/40 hover:bg-crystal/10 hover:border-crystal"
              >
                {submitting ? "Posting..." : "Post Listing"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
