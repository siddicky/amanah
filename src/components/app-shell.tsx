import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, LayoutGrid, ScanLine, Speech } from "lucide-react";
import { useEffect } from "react";
import { AmanahMark } from "@/components/mark";
import { copy } from "@/lib/amanah/copy";
import { useAmanah } from "@/lib/amanah/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", key: "home" as const, icon: LayoutGrid },
  { to: "/assess", key: "assess" as const, icon: ScanLine },
  { to: "/threats", key: "threats" as const, icon: BookOpen },
  { to: "/pitch", key: "pitch" as const, icon: Speech },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const lang = useAmanah((s) => s.lang);
  const setLang = useAmanah((s) => s.setLang);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const t = copy[lang];
  const urdu = lang === "ur";

  useEffect(() => {
    void useAmanah.persist.rehydrate();
    useAmanah.getState().markHydrated();
  }, []);

  useEffect(() => {
    document.documentElement.lang = urdu ? "ur" : "en";
  }, [urdu]);

  return (
    <div
      dir={urdu ? "rtl" : "ltr"}
      className={cn(
        "min-h-dvh bg-bg text-fg",
        urdu ? "font-urdu" : "font-sans",
      )}
    >
      <header className="sticky top-0 z-20 border-b border-border bg-bg">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-fg">
            <AmanahMark className="size-6 text-primary" />
            <span className="text-[13px] font-medium tracking-[0.22em] uppercase">
              {t.product}
            </span>
          </Link>
          <div className="flex items-center gap-1 rounded-sm bg-raised p-0.5">
            {(["en", "ur"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={cn(
                  "h-8 min-w-10 rounded-xs px-2.5 text-[11px] tracking-[0.14em] uppercase",
                  lang === l ? "bg-primary text-primary-fg" : "text-muted",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/94 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
        <ul className="mx-auto grid max-w-3xl grid-cols-4">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[11px] tracking-wide",
                    active ? "text-fg" : "text-muted",
                  )}
                >
                  <Icon className="size-4" strokeWidth={active ? 2.2 : 1.7} />
                  {t.nav[item.key]}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
