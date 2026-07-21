import { useEffect } from 'react';

const PET_SELECTOR = '[data-pet-interactive="true"]';

export function useClickThrough(): void {
  useEffect(() => {
    let isIgnoringMouseEvents = false;

    const setIgnoreMouseEvents = (shouldIgnore: boolean): void => {
      if (shouldIgnore === isIgnoringMouseEvents) return;

      isIgnoringMouseEvents = shouldIgnore;
      window.desktopPet.setIgnoreMouseEvents(shouldIgnore);
    };

    const handleMouseMove = (event: MouseEvent): void => {
      const hoveredElement = document.elementFromPoint(
        event.clientX,
        event.clientY,
      );
      const isOverPet = Boolean(hoveredElement?.closest(PET_SELECTOR));

      setIgnoreMouseEvents(!isOverPet);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
}
