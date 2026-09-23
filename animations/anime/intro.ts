import { createTimeline } from "animejs";
import type { AnimationParams } from "animejs";

export interface IntroContext {
  revert: () => void;
}

function resolveTargets(root: HTMLElement | null, selector: string) {
  if (!root) return [];
  return Array.from(root.querySelectorAll(selector));
}

function addIfPresent(
  timeline: ReturnType<typeof createTimeline>,
  targets: Element[],
  params: AnimationParams,
  position?: string
) {
  if (targets.length > 0) timeline.add(targets, params, position);
}

export function runIntro(root: HTMLElement | null): IntroContext | null {
  if (!root) return null;

  root.style.opacity = "1";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.style.opacity = "1";
    return null;
  }

  const timeline = createTimeline({
    defaults: { ease: "easeOutExpo" },
  });

  const nav = resolveTargets(root, "[data-shell-nav]");
  const heroLabel = resolveTargets(root, "[data-hero-label]");
  const heroHeadline = resolveTargets(root, "[data-hero-headline]");
  const heroCopy = resolveTargets(root, "[data-hero-copy]");
  const heroDataRail = resolveTargets(root, "[data-hero-data-rail]");
  const envBg = resolveTargets(root, "[data-hero-env-bg]");

  timeline.add(root, { opacity: [0, 1], duration: 600 });
  addIfPresent(timeline, nav, { opacity: [0, 1], translateY: [-8, 0], duration: 700 }, "-=300");
  addIfPresent(timeline, heroLabel, { opacity: [0, 1], translateY: [8, 0], duration: 500 }, "-=300");
  addIfPresent(timeline, heroHeadline, { opacity: [0, 1], translateY: [12, 0], duration: 700 }, "-=200");
  addIfPresent(timeline, heroCopy, { opacity: [0, 1], translateY: [8, 0], duration: 500 }, "-=400");
  addIfPresent(timeline, envBg, { opacity: [0, 0.4], duration: 1000 }, "-=500");
  addIfPresent(timeline, heroDataRail, { opacity: [0, 1], translateY: [4, 0], duration: 500 }, "-=700");

  return {
    revert: () => timeline.revert(),
  };
}
