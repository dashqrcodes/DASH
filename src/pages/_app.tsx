import type { AppProps } from 'next/app';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Mobile-First Viewport Configuration */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        
        {/* Mobile-First Global Styles */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Mobile-First Base Styles */
            * {
              box-sizing: border-box;
              -webkit-tap-highlight-color: transparent;
            }
            
            html {
              -webkit-text-size-adjust: 100%;
              -moz-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
              text-size-adjust: 100%;
              /* Prevent horizontal scroll */
              overflow-x: hidden;
            }
            
            body {
              width: 100%;
              margin: 0;
              padding: 0;
              overflow-x: hidden;
              background: #000000;
              color: #ffffff;
              /* Support for safe areas (notches, home indicators) */
              padding-bottom: env(safe-area-inset-bottom);
              padding-top: env(safe-area-inset-top);
              padding-left: env(safe-area-inset-left);
              padding-right: env(safe-area-inset-right);
            }
            
            /* Ensure all images and media are responsive */
            img, video, iframe, embed, object {
              max-width: 100%;
              height: auto;
              display: block;
            }
            
            /* Touch-friendly minimum sizes */
            button, a, input, select, textarea {
              min-height: 44px;
              min-width: 44px;
            }
            
            /* Prevent text selection on UI elements */
            button, .nav-item, .icon-item {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
              -webkit-touch-callout: none;
            }
            
            /* Smooth scrolling for mobile */
            html {
              scroll-behavior: smooth;
              -webkit-overflow-scrolling: touch;
            }
            
            /* Prevent zoom on double tap for buttons */
            button, a {
              touch-action: manipulation;
            }
            
            /* Optimize font rendering for mobile */
            body {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }
          `
        }} />
      </Head>
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
}
