import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-abyss px-4">
      <div className="max-w-md text-center">
        <div className="inline-block mb-6 px-3 py-2 bg-deep-space pixel-border-violet">
          <span className="font-pixel text-[9px] tracking-[0.3em] text-crystal uppercase">
            ◆ 404 ◆
          </span>
        </div>
        <h1 className="font-pixel text-5xl sm:text-6xl text-frost mb-6 text-glow-soft">
          Lost Realm
        </h1>
        <p className="font-pixel text-[9px] tracking-widest text-mist mb-8">
          The page you seek does not exist in this realm.
        </p>
        <Link
          to="/"
          className="font-pixel text-[9px] tracking-widest text-crystal uppercase border-2 border-crystal/40 px-6 py-3 hover:bg-crystal/10 hover:border-crystal transition-colors inline-block"
        >
          ◈ Return Home ◈
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-abyss px-4">
      <div className="max-w-md text-center">
        <div className="inline-block mb-6 px-3 py-2 bg-deep-space pixel-border-gold">
          <span className="font-pixel text-[9px] tracking-[0.3em] text-loot uppercase">
            ◆ Error ◆
          </span>
        </div>
        <h1 className="font-pixel text-3xl sm:text-4xl text-frost mb-6 text-glow-soft">
          Realm Disturbance
        </h1>
        <p className="font-pixel text-[9px] tracking-widest text-mist mb-8">
          Something went wrong on our end. Try again or head back home.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="font-pixel text-[9px] tracking-widest text-crystal uppercase border-2 border-crystal/40 px-5 py-3 hover:bg-crystal/10 hover:border-crystal transition-colors cursor-pointer"
          >
            ◈ Try Again ◈
          </button>
          <a
            href="/"
            className="font-pixel text-[9px] tracking-widest text-mist uppercase border-2 border-crystal/20 px-5 py-3 hover:border-crystal/60 hover:text-frost transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Crystal Realms Trading Hub" },
      {
        name: "description",
        content: "Crystal Realms Trading Hub — Item Catalog, Bazaar & Trading Community",
      },
      { name: "author", content: "Crystal Realms" },
      { property: "og:title", content: "Crystal Realms Trading Hub" },
      {
        property: "og:description",
        content: "Item Catalog, Bazaar & Trading Community for Crystal Realms.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@CrystalRealms" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Outlet />
    </QueryClientProvider>
  );
}
