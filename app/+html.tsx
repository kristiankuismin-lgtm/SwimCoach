import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          body { background: #f9fafb; margin: 0; }
          * { box-sizing: border-box; }
        ` }} />
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var s = document.createElement('script');
            s.src = 'https://cdn.tailwindcss.com';
            s.onload = function() {
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      pk: '#3B82F6',
                      vk: '#22C55E',
                      mk: '#EAB308',
                      mak: '#EF4444',
                      brand: '#0EA5E9'
                    }
                  }
                }
              };
            };
            document.head.appendChild(s);
          })();
        ` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
