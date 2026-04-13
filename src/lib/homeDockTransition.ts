const STORAGE_PREFIX = "home-dock-target:";
const HOME_DOCK_ORDER = ["/projects", "/research", "/resume", "/about"];

export const saveHomeDockTarget = (path: string, clipPath: string) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${path}`, clipPath);
  } catch {
    // Ignore storage failures; the transition can still fall back to an estimate.
  }
};

export const readHomeDockTarget = (path: string) => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage.getItem(`${STORAGE_PREFIX}${path}`);
  } catch {
    return null;
  }
};

export const getFallbackDockClipPath = (path: string) => {
  if (typeof window === "undefined") {
    return "inset(50% 50% 50% 50% round 1.7rem)";
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const horizontalPadding = viewportWidth >= 1024 ? 56 : viewportWidth >= 640 ? 40 : 24;
  const contentWidth = Math.max(viewportWidth - horizontalPadding * 2, 0);
  const dockWidth = Math.min(contentWidth, 1056);
  const dockLeft =
    viewportWidth >= 1024
      ? viewportWidth - horizontalPadding - dockWidth
      : (viewportWidth - dockWidth) / 2;

  const gap = 12;
  const dockPadding = 12;
  const cardHeight = 120;
  const columns = viewportWidth >= 1280 ? 4 : viewportWidth >= 640 ? 2 : 1;
  const rows = Math.ceil(HOME_DOCK_ORDER.length / columns);
  const index = Math.max(0, HOME_DOCK_ORDER.indexOf(path));
  const column = index % columns;
  const row = Math.floor(index / columns);
  const cardWidth = (dockWidth - dockPadding * 2 - gap * (columns - 1)) / columns;
  const dockHeight = dockPadding * 2 + cardHeight * rows + gap * (rows - 1);
  const bottomOffset = viewportWidth >= 640 ? 80 : 64;
  const dockTop = viewportHeight - bottomOffset - dockHeight;
  const cardLeft = dockLeft + dockPadding + column * (cardWidth + gap);
  const cardTop = dockTop + dockPadding + row * (cardHeight + gap);

  return `inset(${cardTop}px ${viewportWidth - (cardLeft + cardWidth)}px ${viewportHeight - (cardTop + cardHeight)}px ${cardLeft}px round 1.7rem)`;
};
