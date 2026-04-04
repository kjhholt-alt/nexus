"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Safe FadeIn wrapper that avoids the Framer Motion + Next.js 16 Turbopack
 * hydration bug where elements get stuck at opacity: 0.
 *
 * The fix: render at full opacity on SSR, only animate on client after mount.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 0,
  x = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  as?: "div" | "section" | "header" | "footer" | "article" | "aside";
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // On SSR and first client render: show content at full opacity
  if (!mounted) {
    const Component = Tag;
    return <Component className={className}>{children}</Component>;
  }

  // After mount: animate in (content is already visible so no flash)
  return (
    <motion.div
      initial={{ opacity: 0.7, y, x }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
