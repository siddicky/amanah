import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Cloud, LayoutGrid, ScanLine, Speech } from "lucide-react";
import { useEffect } from "react";
import { AmanahMark } from "@/components/mark";
import { copy } from "@/lib/amanah/copy";
import { useAmanah } from "@/lib/amanah/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", key: "home" as const, icon: LayoutGrid },
  { to: "/assess", key: "assess" as const, icon: ScanLine },
  { to: "/threats", key: "threats" as const, icon: BookOpen },
  { to: "/cloud", key: "cloud" as const, icon: Cloud },
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
      <header className="sticky top-0 z-20 border-b border-border bg-bg print:hidden">
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

      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 print:max-w-none print:px-0 print:pb-0 print:pt-0">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/94 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm print:hidden">
        <ul className="mx-auto flex w-full max-w-3xl flex-nowrap">
          {NAV.map((item) => {
            const active = pathname === item.to;
            const Icon = item.icon;
            return (
              <li key={item.to} className="min-w-0" style={{ flex: "1 1 0%" }}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex h-14 w-full min-w-0 flex-col items-center justify-center gap-0.5 overflow-hidden px-0.5 text-[9px] leading-none tracking-wide",
                    active ? "text-fg" : "text-muted",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={active ? 2.2 : 1.7} />
                  <span className="max-w-full truncate">{t.nav[item.key]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
