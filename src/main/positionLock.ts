type PositionLockListener = (isLocked: boolean) => void;

let isPositionLocked = false;
const listeners = new Set<PositionLockListener>();

export function getPositionLocked(): boolean {
  return isPositionLocked;
}

export function setPositionLocked(isLocked: boolean): void {
  if (isPositionLocked === isLocked) return;

  isPositionLocked = isLocked;
  listeners.forEach((listener) => listener(isPositionLocked));
}

export function subscribeToPositionLock(
  listener: PositionLockListener,
): () => void {
  listeners.add(listener);
  listener(isPositionLocked);

  return () => listeners.delete(listener);
}
