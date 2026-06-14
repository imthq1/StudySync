import { useState, useEffect, useRef } from "react";

/**
 * useScrolled — theo dõi xem container đã scroll xuống chưa
 * dùng cho Navbar để đổi nền khi scroll
 *
 * @param {number} threshold - số px cần scroll (default: 20)
 * @returns {{ ref, scrolled }}
 *   ref     - gắn vào element muốn theo dõi (hoặc dùng window)
 *   scrolled - boolean
 */
export function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = () => {
      const el = ref.current;
      const scrollY = el ? el.scrollTop : window.scrollY;
      setScrolled(scrollY > threshold);
    };

    const target = ref.current ?? window;
    target.addEventListener("scroll", handler, { passive: true });
    return () => target.removeEventListener("scroll", handler);
  }, [threshold]);

  return { ref, scrolled };
}
