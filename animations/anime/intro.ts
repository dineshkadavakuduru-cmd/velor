import { createTimeline } from "animejs";

export interface IntroContext {
  revert: () => void;
}

function resolveTargets(root: HTMLElement | null, selector: string) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(selector));
}

export function runIntro(root: HTMLElement | null): IntroContext | null {
  if (!root) return null;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.style.opacity = "1";
    return null;
  }

  const timeline = createTimeline({
    defaults: { ease: "easeOutExpo" },
  });

  const nav = resolveTargets(root, "[data-shell-nav]");
  const ticker = resolveTargets(root, "[data-shell-ticker]");
  const heroLabel = resolveTargets(root, "[data-shell-hero-label]");
  const heroHeadline = resolveTargets(root, "[data-shell-hero-headline]");
  const heroCopy = resolveTargets(root, "[data-shell-hero-copy]");
  const heroAction = resolveTargets(root, "[data-shell-hero-action]");
  const heroData = resolveTargets(root, "[data-shell-hero-data]");

  timeline
    .add(root, { opacity: [0, 1], duration: 600 })
    .add(nav, { opacity: [0, 1], translateY: [-8, 0], duration: 700 }, "-=300")
    .add(ticker, { opacity: [0, 1], translateY: [4, 0], duration: 600 }, "-=400")
    .add(heroLabel, { opacity: [0, 1], translateY: [8, 0], duration: 500 }, "-=300")
    .add(heroHeadline, { opacity: [0, 1], translateY: [12, 0], duration: 700 }, "-=200")
    .add(heroCopy, { opacity: [0, 1], translateY: [8, 0], duration: 500 }, "-=400")
    .add(heroAction, { opacity: [0, 1], translateY: [4, 0], duration: 500 }, "-=300")
    .add(heroData, { opacity: [0, 1], translateY: [4, 0], duration: 500 }, "-=300");

  return {
    revert: () => timeline.revert(),
  };
}
