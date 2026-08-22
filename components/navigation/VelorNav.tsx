"use client";

import { useState } from "react";
import { Menu, Search, User } from "lucide-react";
import { motion, type Variants, AnimatePresence } from "motion/react";
import { navHover } from "@/animations/motion/transitions";

const NAV_LINKS = ["LIVE", "MATCHES", "TEAMS", "PLAYERS", "LEAGUES"];

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

export default function VelorNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        className="border-b border-border-subtle"
        aria-label="Main navigation"
        data-shell-nav
      >
        <div className="flex items-center justify-between h-16 px-6 lg:px-10">
          <div className="flex items-center">
            <span className="font-display text-lg font-medium tracking-[0.2em] text-text-primary">
              VELOR
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <motion.a
                key={link}
                href="#"
                className="font-mono text-xs font-medium tracking-widest text-text-secondary"
                variants={navHover}
                initial="rest"
                whileHover="hover"
                transition={{ duration: 0.2 }}
              >
                {link}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <div className="live-indicator">
              <span>LIVE</span>
              <span className="text-text-secondary normal-case tracking-normal text-xs">
                12 MATCHES
              </span>
            </div>

            <motion.button
              type="button"
              className="hidden md:flex text-text-secondary hover:text-text-primary"
              aria-label="Search"
              variants={navHover}
              initial="rest"
              whileHover="hover"
              transition={{ duration: 0.2 }}
            >
              <Search className="w-4 h-4" />
            </motion.button>

            <button
              type="button"
              className="md:hidden text-text-secondary hover:text-text-primary"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <motion.button
              type="button"
              className="hidden md:flex text-text-secondary hover:text-text-primary"
              aria-label="Profile menu"
              variants={navHover}
              initial="rest"
              whileHover="hover"
              transition={{ duration: 0.2 }}
            >
              <User className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between h-16 px-6">
              <span className="font-display text-lg font-medium tracking-[0.2em] text-text-primary">
                VELOR
              </span>
              <button
                type="button"
                className="text-text-secondary hover:text-text-primary"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            <motion.div
              className="flex flex-col items-start gap-6 px-6 pt-10"
              variants={menuVariants}
              initial="closed"
              animate="open"
              transition={{ duration: 0.2 }}
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="font-mono text-sm font-medium tracking-widest text-text-secondary hover:text-text-primary transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link}
                </a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
