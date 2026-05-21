"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
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

type ReportItem = {
  id: number;
  name: string;
  price: string;
  image?: string;
  type: string;
  rarity: string;
};

export function ReportPriceDialog({ item }: { item: ReportItem }) {
  const [open, setOpen] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
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
          const displayName = data.user.global_name || data.user.username;
          setDiscordHandle(displayName);
        } else {
          setAuthState("unauthed");
          setDiscordHandle("");
        }
      })
      .catch(() => {
        setAuthState("unauthed");
        setDiscordHandle("");
      });
  }, [open]);

  function handleVerify() {
    window.location.href = "/api/auth/discord";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPrice.trim()) {
      toast.error("Please enter a reported price");
      return;
    }

    setSubmitting(true);

    const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      toast.error("Price reporting is not configured yet");
      setSubmitting(false);
      return;
    }

    const rarityColor: Record<string, number> = {
      Common: 0x9ca3af,
      Uncommon: 0x00e5ff,
      Rare: 0x4ffbff,
      Epic: 0x8b5cf6,
      Legendary: 0xffd700,
      Mythic: 0xffd700,
    };

    try {
      const payload = {
        embeds: [
          {
            title: "◆ Price Report ◆",
            color: rarityColor[item.rarity] ?? 0x00e5ff,
            thumbnail: item.image ? { url: item.image } : undefined,
            fields: [
              { name: "Item", value: item.name, inline: true },
              { name: "Type", value: item.type, inline: true },
              { name: "Rarity", value: item.rarity, inline: true },
              { name: "Current Price", value: `${item.price}rt`, inline: true },
              { name: "Reported Price", value: newPrice.trim(), inline: true },
              { name: "Discord Handle", value: discordHandle.trim() || "Anonymous", inline: true },
            ],
            footer: {
              text: "Crystal Realms Trading Hub",
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      toast.success("Price report submitted — thank you!");
      setNewPrice("");
      setDiscordHandle("");
      setOpen(false);
    } catch {
      toast.error("Failed to submit report. Try again later.");
    } finally {
      setSubmitting(false);
    }
  }

  const displayName = authUser?.global_name || authUser?.username || "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="font-pixel text-[7px] tracking-widest text-crystal uppercase mt-2 hover:text-aqua transition-colors cursor-pointer">
          [ Report Price ]
        </button>
      </DialogTrigger>
      <DialogContent className="bg-deep-space border-crystal/30 pixel-border-violet max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-pixel text-[11px] tracking-[0.3em] text-crystal uppercase">
            Report Price
          </DialogTitle>
          <DialogDescription className="font-pixel text-[8px] tracking-wider text-mist">
            {authState === "unauthed"
              ? "Verify your Discord membership to submit a price report."
              : "Submit an updated price for community review."}
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
                You need to verify your Discord membership to report prices.
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
                Item
              </div>
              <div className="font-pixel text-[10px] tracking-wider text-frost bg-abyss border border-crystal/20 px-3 py-2">
                {item.name}
              </div>
            </div>

            <div>
              <div className="font-pixel text-[8px] tracking-widest text-mist uppercase mb-1">
                Current Price
              </div>
              <div className="font-pixel text-[10px] tracking-wider text-loot bg-abyss border border-crystal/20 px-3 py-2">
                {item.price}rt
              </div>
            </div>

            <div>
              <div className="font-pixel text-[8px] tracking-widest text-mist uppercase mb-1">
                Reported Price *
              </div>
              <Input
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="e.g. 2,500"
                className="bg-abyss border-crystal/20 text-frost font-pixel text-[9px] tracking-wider placeholder:text-mist/40"
                required
              />
            </div>

            <div>
              <div className="font-pixel text-[8px] tracking-widest text-mist uppercase mb-1">
                Your Discord
              </div>
              <Input
                value={discordHandle}
                onChange={(e) => setDiscordHandle(e.target.value)}
                placeholder="YourName#1234"
                className="bg-abyss border-crystal/20 text-frost font-pixel text-[9px] tracking-wider placeholder:text-mist/40"
                readOnly
              />
              <div className="font-pixel text-[6px] tracking-widest text-aqua uppercase mt-1">
                Verified via Discord
              </div>
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
                {submitting ? "Sending..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
