import { useSyncExternalStore } from 'react';

// Static mode from specs/07-scenery.md, section 4: the scenery stays still for visitors who
// prefer reduced motion, save data, have a slow connection or a weak device, or whose browser
// cannot keep up. An API the browser lacks never counts as a reason to stay still.

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

type DeviceNavigator = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

export interface DeviceHints {
  reducedMotion: boolean;
  saveData?: boolean;
  effectiveType?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

/** Rules 1 to 5; rule 6 (the frame rate watchdog) is `watchFrameRate`. */
export function prefersStill(hints: DeviceHints): boolean {
  return (
    hints.reducedMotion ||
    hints.saveData === true ||
    hints.effectiveType === 'slow-2g' ||
    hints.effectiveType === '2g' ||
    (hints.deviceMemory !== undefined && hints.deviceMemory <= 2) ||
    (hints.hardwareConcurrency !== undefined && hints.hardwareConcurrency <= 2)
  );
}

const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const listeners = new Set<() => void>();
let slowFrames = false;

function readHints(): DeviceHints {
  const nav = navigator as DeviceNavigator;
  return {
    reducedMotion: reducedQuery.matches,
    saveData: nav.connection?.saveData,
    effectiveType: nav.connection?.effectiveType,
    deviceMemory: nav.deviceMemory,
    // Browsers that hide the core count report 0 or nothing; neither means a weak device.
    hardwareConcurrency: nav.hardwareConcurrency || undefined,
  };
}

function current(): boolean {
  return slowFrames || prefersStill(readHints());
}

function notify() {
  listeners.forEach((listener) => listener());
}

reducedQuery.addEventListener('change', notify);

let watching = false;

/**
 * Rule 6: measures the browser's frame rate for two seconds while the scenery animates and
 * switches to static mode for the rest of the visit if it stays under about 30 fps.
 */
export function watchFrameRate() {
  if (watching || slowFrames) return;
  watching = true;
  let frames = 0;
  let start = 0;
  const step = (time: number) => {
    // Hidden tabs pause animation frames; measure only while the page is visible.
    if (document.hidden) {
      watching = false;
      return;
    }
    if (!start) start = time;
    frames++;
    if (time - start < 2000) {
      requestAnimationFrame(step);
      return;
    }
    watching = false;
    if ((frames * 1000) / (time - start) < 30) {
      slowFrames = true;
      notify();
    }
  };
  requestAnimationFrame(step);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True when the scenery should show a single still frame. */
export function useStillMotion(): boolean {
  return useSyncExternalStore(subscribe, current);
}
