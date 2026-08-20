"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/simulator", label: "Simulator" },
  { href: "/explore", label: "Jelajahi" },
  { href: "/linkages", label: "Keterkaitan" },
  { href: "/data", label: "Data" },
  { href: "/methodology", label: "Metodologi" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f] text-white font-bold text-sm">
            S
          </div>
          <span className="text-lg font-bold text-[#1e3a5f] dark:text-blue-400">
            SATRIO
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1e3a5f]/10 text-[#1e3a5f] dark:bg-blue-500/20 dark:text-blue-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/simulator">
            <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#1e3a5f]/90 text-white">
              Jalankan Simulasi
            </Button>
          </Link>
          <Button size="sm" variant="ghost" onClick={logout} className="text-muted-foreground hover:text-foreground">
            Keluar
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-muted">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="text-lg font-bold text-[#1e3a5f]">SATRIO</SheetTitle>
            <nav className="flex flex-col gap-2 mt-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/simulator" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full mt-4 bg-[#1e3a5f] text-white">
                  Jalankan Simulasi
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={() => { setOpen(false); logout(); }} className="w-full mt-2">
                Keluar
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
