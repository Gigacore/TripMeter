import { useState, useEffect, RefObject } from 'react';

export function useScrollSpy(
  sectionIds: string[],
  containerRef: RefObject<HTMLElement>,
  offset = 0
): string | null {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop } = container;
      const scrollPosition = scrollTop + offset + container.offsetTop;

      let currentSectionId: string | null = null;

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          if (element.offsetTop <= scrollPosition) {
            currentSectionId = id;
          } else {
            break;
          }
        }
      }

      if (currentSectionId && currentSectionId !== activeSection) {
        setActiveSection(currentSectionId);
      } else if (currentSectionId === null && activeSection !== null) {
        setActiveSection(sectionIds[0] ?? null);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [sectionIds, containerRef, offset, activeSection]);

  return activeSection;
}
