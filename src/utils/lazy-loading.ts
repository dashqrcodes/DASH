/**
 * Lazy Loading Utilities with IntersectionObserver
 * Optimized for slideshow performance
 */

import React from 'react';

export interface LazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  onLoad?: (element: HTMLElement) => void;
  onError?: (element: HTMLElement, error: Error) => void;
}

/**
 * Initialize lazy loading for images using IntersectionObserver
 */
export function initLazyLoading(
  selector: string = 'img[data-src]',
  options?: LazyLoadOptions
): () => void {
  const defaultOptions: IntersectionObserverInit = {
    root: options?.root || null,
    rootMargin: options?.rootMargin || '50px',
    threshold: options?.threshold || 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLImageElement;
        const src = element.dataset.src;
        const srcset = element.dataset.srcset;

        if (src) {
          // Create a new image to preload
          const img = new Image();
          
          img.onload = () => {
            element.src = src;
            if (srcset) {
              element.srcset = srcset;
            }
            element.classList.add('lazy-loaded');
            element.removeAttribute('data-src');
            element.removeAttribute('data-srcset');
            
            if (options?.onLoad) {
              options.onLoad(element);
            }
          };

          img.onerror = (error) => {
            if (options?.onError) {
              options.onError(element, error as Error);
            }
          };

          img.src = src;
        }

        observer.unobserve(element);
      }
    });
  }, defaultOptions);

  // Observe all matching elements
  const elements = document.querySelectorAll<HTMLElement>(selector);
  elements.forEach((el) => observer.observe(el));

  // Return cleanup function
  return () => {
    observer.disconnect();
  };
}

/**
 * React hook for lazy loading images
 */
export function useLazyImage(src: string | null, fallback?: string) {
  const [imageSrc, setImageSrc] = React.useState<string | null>(fallback || null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setHasError(false);
    };

    img.onerror = () => {
      setHasError(true);
      if (fallback) {
        setImageSrc(fallback);
      }
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallback]);

  return { imageSrc, isLoaded, hasError, imgRef };
}

/**
 * Preload images for slideshow
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load ${url}`));
          img.src = url;
        })
    )
  );
}

/**
 * Lazy load with placeholder blur effect
 */
export function createBlurPlaceholder(
  src: string,
  placeholder: string
): string {
  // Return a data URL for blur placeholder
  return placeholder;
}

