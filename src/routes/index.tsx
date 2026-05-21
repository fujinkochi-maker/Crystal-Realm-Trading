import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Crown,
  Shield,
  Target,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

import heroBg from "@/assets/pixel-hero-bg.jpg";
import admin1 from "@/assets/pixel-admin-1.png";
import admin2 from "@/assets/pixel-admin-2.png";
import admin3 from "@/assets/pixel-admin-3.png";

const DISCORD_URL = "https://discord.gg/TJfR5EpzUw";

export const Route = createFileRoute("/")({
  loader: async () => {
    const { getItems } = await import("@/lib/item-store");
    return await getItems();
  },
  head: () => ({
    meta: [
      { title: "Crystal Realms Trading Hub — Join the Discord" },
      {
        name: "description",
        content:
          "The official Crystal Realms trading Discord. Buy, sell, and trade rare items, gear, and mounts with thousands of verified players.",
      },
      { property: "og:title", content: "Crystal Realms Trading Hub" },
      {
        property: "og:description",
        content: "Trade rare items, gear & mounts with the largest Crystal Realms community.",
      },
      { property: "og:image", content: heroBg },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroBg },
    ],
  }),
  component: Index,
});

function Index() {
  const items = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-abyss text-frost font-sans selection:bg-crystal/30 selection:text-frost overflow-x-hidden animate-in fade-in duration-700">
      <Nav />
      <Hero />
      <About />
      <Staff />
      <TopItems items={items} />
      <Footer />
    </div>
  );
}

/* ============================== HERO ============================== */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Pixel parallax background */}
      <div
        className="absolute inset-0 pixelated"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          imageRendering: "pixelated",
        }}
      />
      {/* Vignette + scanline */}
      <div className="absolute inset-0 bg-gradient-to-b from-abyss/40 via-abyss/30 to-abyss" />
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Floating pixel shards */}
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-shard pixelated"
          style={{
            left: `${(i * 73) % 100}%`,
            top: `${(i * 47) % 90}%`,
            width: `${8 + (i % 4) * 4}px`,
            height: `${12 + (i % 4) * 6}px`,
            background: i % 2 === 0 ? "#00E5FF" : "#8B5CF6",
            boxShadow: `0 0 18px ${i % 2 === 0 ? "#00E5FF" : "#8B5CF6"}`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${6 + (i % 5)}s`,
            transform: "rotate(45deg)",
          }}
        />
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="inline-block mb-10 px-4 py-2 bg-abyss/80 pixel-border-violet">
          <span className="font-pixel text-[9px] tracking-[0.3em] text-mystic uppercase">
            ◆ Official Trading Hub ◆
          </span>
        </div>

        <h1 className="pixel-title text-7xl sm:text-8xl md:text-9xl mb-6 text-glow-crystal">
          CRYSTAL
        </h1>

        <h1 className="pixel-title text-7xl sm:text-8xl md:text-9xl realms-text mb-10">REALMS</h1>

        <p className="font-pixel text-[10px] sm:text-xs tracking-[0.25em] text-aqua uppercase mb-10">
          Trading · Server · Discord
        </p>

        <p className="font-sans text-mist text-base md:text-lg max-w-xl mx-auto mb-12 leading-relaxed">
          The largest player-run marketplace for rare items, legendary gear, and mythical items.
          Trade safely with verified merchants from across the realm.
        </p>

        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pixel-discord inline-flex items-center gap-4 px-8 py-5 text-[11px] sm:text-sm tracking-[0.25em] uppercase"
        >
          <MessageCircle className="size-5" strokeWidth={3} />
          Join the Discord
          <ExternalLink className="size-4" strokeWidth={3} />
        </a>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-mist">
          <Stat icon={<Users className="size-4 text-crystal" />} label="100+ Traders" />
          <Stat icon={<TrendingUp className="size-4 text-loot" />} label="50 Daily Trades" />
          <Stat icon={<Zap className="size-4 text-mystic" />} label="24/7 Active Mods" />
        </div>
      </div>

      {/* Pixel ground bar */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-abyss border-t-4 border-crystal/40" />
    </section>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 font-pixel text-[9px] sm:text-[10px] tracking-widest uppercase">
      {icon}
      {label}
    </div>
  );
}

/* ============================== ABOUT ============================== */
function About() {
  return (
    <section className="relative py-28 px-6 checker-bg border-y-4 border-crystal/20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-block mb-6 px-3 py-2 bg-deep-space pixel-border">
          <span className="font-pixel text-[9px] tracking-[0.3em] text-crystal uppercase">
            ▌ About the Hub ▐
          </span>
        </div>

        <h2 className="font-pixel text-2xl md:text-4xl text-frost mb-10 leading-[1.5] text-glow-soft">
          A Marketplace
          <br />
          <span className="gradient-text-crystal">For Adventurers</span>
        </h2>

        <p className="text-mist text-base md:text-lg mb-6 leading-relaxed max-w-2xl mx-auto">
          Crystal Realms Trading Hub is a community-driven Discord server where players gather to
          trade the their loot in the game. Whether you're hunting for a legendary weapon, listing a
          item, or just looking for fair market prices — we've got the realm covered.
        </p>

        <div className="rune-divider my-12 max-w-md mx-auto" />

        <div className="grid sm:grid-cols-3 gap-6 mt-10">
          {[
            {
              icon: <Shield className="size-6 text-crystal" />,
              t: "Verified Trades",
              d: "Be secured by the goat Regas.",
            },
            {
              icon: <TrendingUp className="size-6 text-loot" />,
              t: "Live Price Index",
              d: "Daily market reports and item value tracking.",
            },
            {
              icon: <Sparkles className="size-6 text-mystic" />,
              t: "CRM Discord Bot",
              d: "Find listings of players selling items.",
            },
          ].map((f) => (
            <div key={f.t} className="bg-deep-space p-6 pixel-border-violet text-left">
              <div className="mb-3">{f.icon}</div>
              <h3 className="font-pixel text-[10px] tracking-widest uppercase text-frost mb-2">
                {f.t}
              </h3>
              <p className="text-mist text-sm leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================== STAFF ============================== */
const STAFF = [
  {
    name: "Staphii",
    role: "CRT Founder",
    img: admin1,
    icon: <Crown className="size-4 text-loot" />,
    accent: "gold",
  },
  {
    name: "Novkin",
    role: "CRT Lead Admin",
    img: admin2,
    icon: <Shield className="size-4 text-crystal" />,
    accent: "crystal",
  },
  {
    name: "Regas [MOD]",
    role: "Mod",
    img: admin3,
    icon: <Target className="size-4 text-mystic" />,
    accent: "violet",
  },
] as const;

function Staff() {
  return (
    <section className="relative py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-3 py-2 bg-deep-space pixel-border-gold">
            <span className="font-pixel text-[9px] tracking-[0.3em] text-loot uppercase">
              ◆ The Council ◆
            </span>
          </div>
          <h2 className="font-pixel text-2xl md:text-4xl text-frost leading-[1.5]">
            Admins & <span className="gradient-text-crystal">Mods</span>
          </h2>
          <p className="text-mist mt-4 max-w-lg mx-auto">
            The trusted keepers of the realm — handling disputes, verifying trades, and keeping the
            marketplace safe.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {STAFF.map((s) => {
            const border =
              s.accent === "gold"
                ? "pixel-border-gold"
                : s.accent === "violet"
                  ? "pixel-border-violet"
                  : "pixel-border";
            return (
              <div key={s.name} className="text-center group">
                <div
                  className={`relative aspect-square bg-deep-space ${border} mb-8 overflow-hidden transition-transform duration-300 group-hover:-translate-y-2`}
                >
                  <div className="absolute inset-0 checker-bg opacity-50" />
                  <img
                    src={s.img}
                    alt={`${s.name} pixel portrait`}
                    width={512}
                    height={512}
                    loading="lazy"
                    className="relative w-full h-full object-contain pixelated animate-bounce-soft"
                  />
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  {s.icon}
                  <h3 className="font-pixel text-xs tracking-widest uppercase text-frost">
                    {s.name}
                  </h3>
                </div>
                <p className="font-pixel text-[9px] tracking-[0.25em] text-mist uppercase">
                  {s.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function parsePriceMax(p: string): number {
  const beforePlus = p.split("+")[0].trim();
  const parts = beforePlus.split(/[-–—]/);
  const lastPart = parts[parts.length - 1].trim();
  const hasK = /k/i.test(lastPart);
  const cleaned = lastPart.replace(/[^0-9.]/g, "");
  const val = parseFloat(cleaned);
  if (isNaN(val)) return 0;
  return hasK ? val * 1000 : val;
}

const rarityBorders: Record<string, string> = {
  Mythic: "pixel-border-gold",
  Legendary: "pixel-border-gold",
  Epic: "pixel-border-violet",
};

const rarityColors: Record<string, string> = {
  Mythic: "text-loot text-glow-soft",
  Legendary: "text-loot",
  Epic: "text-mystic",
  Rare: "text-crystal",
  Uncommon: "text-aqua",
  Common: "text-mist",
};

function TopItems({ items }: { items: typeof import("@/data/items").ITEMS }) {
  const topItems = useMemo(
    () =>
      [...items]
        .sort((a, b) => parsePriceMax(b.price) - parsePriceMax(a.price))
        .slice(0, 3)
        .map((item, i) => ({ ...item, rank: i + 1 })),
    [items],
  );

  return (
    <section className="relative py-28 px-6 checker-bg border-y-4 border-crystal/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block mb-6 px-3 py-2 bg-deep-space pixel-border-gold">
            <span className="font-pixel text-[9px] tracking-[0.3em] text-loot uppercase">
              ★ Loot Vault ★
            </span>
          </div>
          <h2 className="font-pixel text-2xl md:text-4xl text-frost leading-[1.5]">
            Top 3 <span className="gradient-text-crystal">Expensive Items</span>
          </h2>
          <p className="text-mist mt-4 max-w-lg mx-auto">
            The crown jewels currently listed on the trading hub. Prices in Crystal Gold, verified
            by our market team.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {topItems.map((it) => {
            const border = rarityBorders[it.rarity] ?? "pixel-border";
            const rarityColor = rarityColors[it.rarity] ?? "text-mist";
            return (
              <div
                key={it.id}
                className={`bg-deep-space ${border} p-6 flex flex-col transition-transform duration-300 hover:-translate-y-2`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-pixel text-[10px] tracking-widest text-mist uppercase">
                    #{it.rank} Ranked
                  </span>
                  <span
                    className={`font-pixel text-[9px] tracking-widest uppercase ${rarityColor}`}
                  >
                    [{it.rarity}]
                  </span>
                </div>

                <div className="relative aspect-square bg-abyss border-2 border-crystal/20 mb-5 overflow-hidden">
                  <div className="absolute inset-0 checker-bg opacity-40" />
                  <img
                    src={it.image}
                    alt={`${it.name} pixel icon`}
                    width={512}
                    height={512}
                    loading="lazy"
                    className="relative w-full h-full object-contain pixelated p-6 animate-float-shard-slow"
                  />
                </div>

                <h3 className="font-pixel text-[11px] leading-[1.6] tracking-wider uppercase text-frost mb-5 flex-1">
                  {it.name}
                </h3>

                <div className="border-t-2 border-dashed border-crystal/20 pt-4 flex items-end justify-between">
                  <div>
                    <div className="font-pixel text-[8px] tracking-widest text-mist uppercase mb-1">
                      Price
                    </div>
                    <div className="font-pixel text-sm text-loot text-glow-soft">{it.price}rt</div>
                  </div>
                  <a
                    href={DISCORD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-pixel text-[9px] tracking-widest text-crystal uppercase border-2 border-crystal/40 px-3 py-2 hover:bg-crystal/10 hover:border-crystal transition-colors"
                  >
                    Inquire →
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pixel inline-flex items-center gap-4 px-8 py-5 text-[11px] tracking-[0.25em] uppercase"
          >
            <MessageCircle className="size-5" strokeWidth={3} />
            See All Listings on Discord
          </a>
        </div>
      </div>
    </section>
  );
}
