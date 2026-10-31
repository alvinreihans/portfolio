import { useSyncExternalStore } from 'react';

// Whether the hero action row is on screen. `null` means "not measured yet", which
// the navbar treats as visible so its links never flash in on the first paint.
let visible: boolean | null = null;
const listeners = new Set<() => void>();

export function setHeroActionsVisible(value: boolean | null) {
  if (visible === value) return;
  visible = value;
  listeners.forEach((notify) => notify());
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

export function useHeroActionsVisible(): boolean | null {
  return useSyncExternalStore(subscribe, () => visible);
}
