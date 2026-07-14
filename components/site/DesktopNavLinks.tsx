"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/site-config";

export default function DesktopNavLinks() {
  const pathname = usePathname();

  return NAV_ITEMS.map((item) => {
    const isCurrent =
      item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isCurrent ? "page" : undefined}
        className={`relative text-xs font-semibold uppercase tracking-[0.1em] transition-colors duration-200 after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:bg-gold after:transition-[width] after:duration-300 ${
          isCurrent
            ? "text-primary after:w-full"
            : "text-dark/80 after:w-0 hover:text-primary hover:after:w-full"
        }`}
      >
        {item.label}
      </Link>
    );
  });
}
