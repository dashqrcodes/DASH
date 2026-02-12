"use client";

import { useRouter } from "next/navigation";

const backArrowSvg = (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

interface BackArrowButtonProps {
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
  variant?: "dark" | "light";
  ariaLabel?: string;
}

export default function BackArrowButton({
  onClick,
  className = "",
  size = "md",
  variant = "dark",
  ariaLabel = "Back",
}: BackArrowButtonProps) {
  const router = useRouter();
  const handleClick = onClick ?? (() => router.back());

  const sizeClass = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const variantClass =
    variant === "dark"
      ? "text-white/90 transition active:bg-white/10 focus:ring-purple-300/60"
      : "bg-white text-gray-900 shadow-md ring-1 ring-gray-200 transition hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-300";
  const baseClass =
    "flex shrink-0 items-center justify-center rounded-full focus:outline-none focus:ring-2";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={ariaLabel}
      className={`${baseClass} ${sizeClass} ${variantClass} ${className}`.trim()}
    >
      {backArrowSvg}
    </button>
  );
}
