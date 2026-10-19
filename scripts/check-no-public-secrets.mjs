import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Guard: API keys and other secrets must be server-only env vars.
 * Fails the build when any first-party source file references NEXT_PUBLIC_
 * variables that look like credentials (embedding a key in the client bundle
 * publishes it to every visitor).
 */
const ROOTS = ["app", "components", "lib", "animations"];
const SECRETS_PATTERN = /NEXT_PUBLIC_[A-Z0-9_]*(KEY|TOKEN|SECRET|PASSWORD|PASSWORD[A-Z_]*|CREDENTIAL[A-Z_]*)[A-Z0-9_]*/;

const offenders = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry.startsWith(".") || entry === "mock") continue;
      walk(full);
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry)) {
      const content = readFileSync(full, "utf8");
      if (SECRETS_PATTERN.test(content)) {
        offenders.push(full);
      }
    }
  }
}

for (const root of ROOTS) {
  const full = path.join(process.cwd(), root);
  walk(full);
}

if (offenders.length > 0) {
  console.error("SECRET_IN_CLIENT_BUNDLE: public env vars may expose credentials in:");
  for (const file of offenders) console.error("  " + file);
  process.exit(1);
}

console.log("OK: no public env secrets referenced in client-reachable code.");
