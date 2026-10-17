import { useCallback } from 'react';

export function useSmoothScroll(offset = 70) {
  return useCallback(
    (e, id) => {
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    },
    [offset]
  );
}