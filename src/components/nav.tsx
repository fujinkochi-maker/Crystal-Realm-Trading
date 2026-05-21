import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
// import logo from "@/assets/logo.png";

const DISCORD_URL = "https://discord.gg/TJfR5EpzUw";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b-4 border-crystal/30 bg-abyss/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          {/* <img src={logo} alt="Crystal Realms" className="size-8 pixelated" /> */}
          <span className="font-pixel text-[9px] tracking-[0.3em] text-crystal uppercase group-hover:text-aqua transition-colors">
            Crystal Realms
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/"
            activeProps={{ className: "text-crystal" }}
            className="font-pixel text-[9px] tracking-[0.3em] text-frost uppercase hover:text-crystal transition-colors"
          >
            Home
          </Link>
          <Link
            to="/items"
            activeProps={{ className: "text-crystal" }}
            className="font-pixel text-[9px] tracking-[0.3em] text-frost uppercase hover:text-crystal transition-colors"
          >
            Items
          </Link>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-pixel text-[9px] tracking-[0.3em] text-aqua uppercase hover:text-crystal transition-colors inline-flex items-center gap-2"
          >
            <MessageCircle className="size-3" strokeWidth={3} />
            Discord
          </a>
        </div>
      </div>
    </nav>
  );
}
