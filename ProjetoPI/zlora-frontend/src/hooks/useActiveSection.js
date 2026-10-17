import { useEffect, useState } from 'react';

/**
 * Observa as seções na página e retorna o id da que está visível.
 * @param {string[]} ids - ids das seções (sem o "#")
 * @param {string} [defaultId] - id inicial antes de qualquer scroll
 */
export function useActiveSection(ids, defaultId = ids[0]) {
  const [active, setActive] = useState(defaultId);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return;

    const visibility = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.intersectionRatio);
        });

        let best = defaultId;
        let bestRatio = 0;
        visibility.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        });

        if (bestRatio > 0) setActive(best);
      },
      {
        rootMargin: '-80px 0px -55% 0px',
        threshold: [0, 0.15, 0.3, 0.5, 0.75, 1],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, defaultId]);

  return active;
}