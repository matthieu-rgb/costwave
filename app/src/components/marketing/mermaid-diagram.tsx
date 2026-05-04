'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'dark',
        themeVariables: {
          primaryColor: 'hsl(var(--color-phosphor))',
          primaryTextColor: 'hsl(var(--color-text))',
          primaryBorderColor: 'hsl(var(--color-border))',
          lineColor: 'hsl(var(--color-text-dim))',
          secondaryColor: 'hsl(var(--color-panel))',
          tertiaryColor: 'hsl(var(--color-bg))',
          fontFamily: 'var(--font-mono)',
        },
      });

      mermaid
        .render('mermaid-diagram', chart)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        })
        .catch((error) => {
          console.error('Mermaid rendering error:', error);
          if (containerRef.current) {
            containerRef.current.innerHTML =
              '<p class="text-sm text-[hsl(var(--color-text-mute))]">Diagram rendering failed</p>';
          }
        });
    }
  }, [chart]);

  return <div ref={containerRef} className={className || ''} />;
}
