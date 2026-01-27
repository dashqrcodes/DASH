"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="route-transition-root">
      <div key={`overlay-${pathname}`} className="route-overlay" />
      <div key={`content-${pathname}`} className="route-content">
        {children}
      </div>
      <style jsx global>{`
        .route-transition-root {
          position: relative;
          min-height: 100%;
        }
        .route-overlay {
          pointer-events: none;
          position: fixed;
          inset: 0;
          z-index: 50;
          background: #000;
          opacity: 0;
          animation: route-overlay 220ms ease-out;
        }
        .route-content {
          animation: route-fade 180ms ease-out;
        }
        @keyframes route-overlay {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 0.18;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes route-fade {
          0% {
            opacity: 0;
            transform: translateY(2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .route-overlay,
          .route-content {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
