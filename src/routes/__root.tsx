import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LangProvider, useLang } from "../lib/i18n";

function NotFoundComponent() {
  const { t } = useLang();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {t("notFoundTitle")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("notFoundDesc")}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          الصفحة لم يتم تحميلها / Page failed to load
        </h1>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            حاول تاني / Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            الرئيسية / Home
          </a>
        </div>
      </div>
    </div>
  );
}

function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      className="rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-extrabold text-secondary-foreground transition-colors hover:bg-accent"
      aria-label="Switch language / تغيير اللغة"
    >
      {lang === "ar" ? "EN" : "عربي"}
    </button>
  );
}

function Header() {
  const { t } = useLang();
  const linkClass =
    "rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground";
  const activeClass = "bg-primary text-primary-foreground hover:bg-primary";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg">
            🍬
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-foreground">
              {t("storeName")}
            </span>
            <span className="block text-[10px] font-semibold text-muted-foreground">
              {t("tagline")}
            </span>
          </span>
        </Link>
        <nav className="ms-auto flex items-center gap-1">
          <Link
            to="/"
            className={linkClass}
            activeOptions={{ exact: true }}
            activeProps={{ className: `${linkClass} ${activeClass}` }}
          >
            {t("navCashier")}
          </Link>
          <Link
            to="/products"
            className={linkClass}
            activeProps={{ className: `${linkClass} ${activeClass}` }}
          >
            {t("navProducts")}
          </Link>
          <Link
            to="/sales"
            className={linkClass}
            activeProps={{ className: `${linkClass} ${activeClass}` }}
          >
            {t("navSales")}
          </Link>
          <LangToggle />
        </nav>
      </div>
    </header>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sweet Spot — Grocery POS" },
      {
        name: "description",
        content:
          "Complete POS for Sweet Spot grocery: cashier, receipts, inventory and products.",
      },
      { name: "author", content: "Sweet Spot" },
      { property: "og:title", content: "Sweet Spot — Grocery POS" },
      {
        property: "og:description",
        content:
          "Complete POS for Sweet Spot grocery: cashier, receipts, inventory and products.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
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
      <LangProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </LangProvider>
    </QueryClientProvider>
  );
}
