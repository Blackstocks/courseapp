"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  // When pathname changes, navigation is complete
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  // Listen for internal link clicks to start loading indicator
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:")
      )
        return;
      if (href !== pathname) {
        setIsLoading(true);
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-blue-100 overflow-hidden">
      <div className="h-full bg-blue-600 rounded-r-full animate-[nav-progress_1.5s_ease-in-out_infinite]" />
    </div>
  );
}
