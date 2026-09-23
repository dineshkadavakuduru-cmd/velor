"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { motion, type Variants, AnimatePresence } from "motion/react";

const NAV_LINKS = [
  { label: "LIVE", href: "/live" },
  { label: "MATCHES", href: "/matches" },
  { label: "TEAMS", href: "/teams" },
  { label: "LEAGUES", href: "/leagues" },
  { label: "FAVORITES", href: "/favorites" },
  { label: "SEARCH", href: "/search" },
];

const menuVariants: Variants = {
  closed: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  open: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
};

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/live") return pathname === "/live";
  if (href === "/matches") return pathname === "/matches";
  if (href === "/teams") return pathname === "/teams";
  if (href === "/leagues") return pathname === "/leagues";
  if (href === "/favorites") return pathname === "/favorites";
  if (href === "/search") return pathname === "/search";
  return false;
}

export default function VelorNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (e.key === "Tab" && menuRef.current) {
        const focusable = menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const firstFocusable = menuRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }, [menuOpen]);

  return (
    <>
      <nav
        className="border-b border-border-subtle"
        aria-label="Main navigation"
        data-shell-nav
      >
        <div className="flex items-center justify-between h-16 px-6 lg:px-10">
          <div className="flex items-center">
            <Link href="/" className="font-display text-lg font-medium tracking-[0.2em] text-text-primary hover:text-live transition-colors">
              VELOR
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => {
              const active = isActiveRoute(pathname, link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`font-mono text-xs font-medium tracking-widest transition-colors ${
                    active
                      ? "text-live"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="block h-px bg-live mt-1" aria-hidden="true" />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-5">
            <div className="live-indicator">
              <span>LIVE</span>
            </div>

            <Link
              href="/search"
              className="hidden md:flex text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Link>

            <button
              type="button"
              className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between h-16 px-6">
              <Link href="/" className="font-display text-lg font-medium tracking-[0.2em] text-text-primary hover:text-live transition-colors" onClick={() => setMenuOpen(false)}>
                VELOR
              </Link>
              <button
                type="button"
                className="text-text-secondary hover:text-text-primary"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <motion.div
              className="flex flex-col items-start gap-6 px-6 pt-10"
              variants={menuVariants}
              initial="closed"
              animate="open"
              transition={{ duration: 0.2 }}
            >
              {NAV_LINKS.map((link) => {
                const active = isActiveRoute(pathname, link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`font-mono text-sm font-medium tracking-widest transition-colors ${
                      active
                        ? "text-live"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
