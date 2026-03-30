'use client';

import { useEffect, useRef, useState } from 'react';
import type { ScormLearnerInfo } from './scormLearnerPrefill';
import { prefillScormLearnerFields } from './scormLearnerPrefill';

/**
 * Embeds a SCORM package via iframe, isolating only the content area.
 * This component hides header/footer elements from the SCORM package to avoid duplication
 * with the parent LMS header/footer.
 * 
 * SCORM packages are typically hosted as ZIP files that are extracted and served.
 * The src should point to the launch file (usually index.html or similar) of the SCORM package.
 */
interface ScormEmbedProps {
  /** Full URL to the SCORM package launch file (e.g. https://example.com/scorm/package/index.html) */
  src: string;
  /** Optional title for accessibility */
  title?: string;
  className?: string;
  /** Minimum height for the iframe (default 600) */
  minHeight?: number;
  /** SCORM version (1.2 or 2004) - defaults to 1.2 */
  version?: '1.2' | '2004';
  /** When set (same-origin iframe), name/email fields are filled after load. */
  learner?: ScormLearnerInfo | null;
}

export function ScormEmbed({
  src,
  title = 'SCORM course',
  className = '',
  minHeight = 600,
  version = '1.2',
  learner = null,
}: ScormEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  // Use the URL as-is if it's absolute, otherwise make it relative
  const url = src.startsWith('http') ? src : `/${src.replace(/^\//, '')}`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const hideHeaderFooter = () => {
      try {
        // Try to access iframe content (only works if same-origin)
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        const iframeWindow = iframe.contentWindow;
        
        if (iframeDoc && iframeWindow && learner) {
          prefillScormLearnerFields(iframeDoc, learner);
        }

        if (iframeDoc && iframeWindow) {
          // Inject CSS to hide headers/footers
          const styleId = 'scorm-content-only-style';
          let styleElement = iframeDoc.getElementById(styleId) as HTMLStyleElement;
          
          if (!styleElement) {
            styleElement = iframeDoc.createElement('style');
            styleElement.id = styleId;
            iframeDoc.head.appendChild(styleElement);
          }

          // CSS to hide common header/footer elements
          styleElement.textContent = `
            header,
            nav,
            footer,
            .header,
            .navbar,
            .nav,
            .footer,
            [role="banner"],
            [role="navigation"],
            [role="contentinfo"],
            .scorm-header,
            .scorm-footer,
            .lms-header,
            .lms-footer,
            .top-bar,
            .banner {
              display: none !important;
            }
            
            body {
              padding-top: 0 !important;
              padding-bottom: 0 !important;
              margin-top: 0 !important;
              margin-bottom: 0 !important;
            }
          `;

          // Also hide elements by checking their content
          const hideSelectors = [
            'header',
            'nav',
            'footer',
            '.header',
            '.navbar',
            '.nav',
            '.footer',
            '[role="banner"]',
            '[role="navigation"]',
            '[role="contentinfo"]',
          ];

          hideSelectors.forEach((selector) => {
            const elements = iframeDoc.querySelectorAll(selector);
            elements.forEach((el) => {
              (el as HTMLElement).style.display = 'none';
            });
          });

          // Find and hide banner/header elements by text content
          const walker = iframeDoc.createTreeWalker(
            iframeDoc.body,
            NodeFilter.SHOW_ELEMENT,
            null
          );

          let node: Node | null;
          while ((node = walker.nextNode())) {
            const element = node as HTMLElement;
            const text = element.textContent?.toLowerCase() || '';
            const className = element.className?.toLowerCase() || '';
            const id = element.id?.toLowerCase() || '';
            
            // Hide elements that look like headers/banners
            if (
              (text.includes('enabling positive impact') ||
               text.includes('vectra international') ||
               className.includes('top-bar') ||
               className.includes('banner') ||
               id.includes('header') ||
               id.includes('navbar')) &&
              element.offsetHeight < 150 // Only hide small header-like elements
            ) {
              element.style.display = 'none';
            }
          }

          // Adjust body to remove any padding/margin that might be for header/footer
          const body = iframeDoc.body;
          if (body) {
            body.style.marginTop = '0';
            body.style.paddingTop = '0';
            body.style.marginBottom = '0';
            body.style.paddingBottom = '0';
          }
        }
      } catch (error) {
        // Cross-origin restrictions - can't access iframe content
        // In this case, we'll rely on CSS clipping via wrapper
        console.debug('Cannot access iframe content (may be cross-origin):', error);
      }
    };

    const loadTimers: ReturnType<typeof setTimeout>[] = [];

    const scheduleRuns = () => {
      const delays = learner ? [0, 80, 400, 1200, 2500] : [100, 500];
      delays.forEach((ms) => {
        loadTimers.push(setTimeout(() => hideHeaderFooter(), ms));
      });
    };

    const handleLoad = () => scheduleRuns();

    iframe.addEventListener('load', handleLoad);
    scheduleRuns();

    return () => {
      iframe.removeEventListener('load', handleLoad);
      loadTimers.forEach(clearTimeout);
    };
  }, [url, learner]);

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 bg-gray-50 ${className}`}>
      <div 
        className="relative w-full overflow-hidden"
        style={{ 
          minHeight: `${minHeight}px`,
          // Clip top and bottom if we detected header/footer heights
          clipPath: headerHeight > 0 || footerHeight > 0 
            ? `inset(${headerHeight}px 0 ${footerHeight}px 0)` 
            : 'none'
        }}
      >
        <iframe
          ref={iframeRef}
          src={url}
          title={title}
          className="w-full border-0"
          style={{
            minHeight: `${minHeight}px`,
            height: '100%',
            display: 'block',
            // Negative margin to offset header if needed
            marginTop: headerHeight > 0 ? `-${headerHeight}px` : '0',
            marginBottom: footerHeight > 0 ? `-${footerHeight}px` : '0',
          }}
          allow="fullscreen"
          allowFullScreen
          // SCORM packages often need to communicate via postMessage
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
