import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

const DISCORD_URL = "https://discord.gg/TJfR5EpzUw";

export function Footer() {
  return (
    <footer className="relative bg-abyss border-t-4 border-crystal/30 py-12 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <div className="font-pixel text-xs tracking-[0.3em] text-crystal uppercase mb-4 text-glow-crystal">
          ◆ Crystal Realms Trading Hub ◆
        </div>
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <Link
            to="/"
            className="font-pixel text-[9px] tracking-widest text-mist uppercase hover:text-crystal transition-colors"
          >
            Home
          </Link>
          <Link
            to="/items"
            className="font-pixel text-[9px] tracking-widest text-mist uppercase hover:text-crystal transition-colors"
          >
            Items Catalog
          </Link>
          <Link
            to="/bazaar"
            className="font-pixel text-[9px] tracking-widest text-mist uppercase hover:text-crystal transition-colors"
          >
            Bazaar
          </Link>
        </div>
        <a
          href={DISCORD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-pixel text-[10px] tracking-widest text-aqua uppercase inline-flex items-center gap-2 hover:text-crystal transition-colors"
        >
          <MessageCircle className="size-4" strokeWidth={3} /> discord.gg/TJfR5EpzUw
        </a>
        <div className="rune-divider mt-8 mb-6 max-w-xs mx-auto" />
        <p className="font-pixel text-[8px] tracking-widest text-mist/60 uppercase">
          © {new Date().getFullYear()} · Press Start To Trade
        </p>
      </div>
    </footer>
  );
}
