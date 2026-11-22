// ─── "What is on this screen?" ─────────────────────────────────────────────
// Reads the visible page structure (active tab, headings, card titles) so the
// assistant can describe the screen in plain words, in whatever language the
// interface is showing. Nothing is sent anywhere.

export interface ScreenSummary { place: string; items: string[] }

function text(el: Element | null): string {
  return (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function readScreen(limit = 6): ScreenSummary {
  if (typeof document === 'undefined') return { place: '', items: [] };
  const tab = document.querySelector('[role="tablist"] [role="tab"][aria-selected="true"]');
  const panel = document.querySelector('[role="tabpanel"][data-state="active"]') ?? document.querySelector('main') ?? document.body;
  const place = text(tab) || text(document.querySelector('main h1, h1')) || document.title;
  const seen = new Set<string>([place.toLowerCase()]);
  const items: string[] = [];
  for (const el of Array.from(panel.querySelectorAll('h2, h3, [data-slot="card-title"]'))) {
    // Dialogs mark the page aria-hidden while open, so only skip truly hidden text.
    if ((el as HTMLElement).closest('.sr-only, [hidden]') || (el as HTMLElement).offsetParent === null) continue;
    const t = text(el);
    if (!t || t.length > 90 || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    items.push(t);
    if (items.length >= limit) break;
  }
  return { place, items };
}
