import { useEffect, useState } from 'react';

export function useScrolled(threshold = 50) {
  const [scrolled, setScrolled] = useState(
    typeof window !== 'undefined' && window.scrollY > threshold
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}