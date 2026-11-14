import { useEffect, useRef, useState } from 'react';

interface AdBannerProps {
  variant: 'leaderboard' | 'rectangle';
  className?: string;
  hideLabel?: boolean;
}

const AD_DIMENSIONS = {
  leaderboard: { width: 728, height: 90 },
  rectangle: { width: 300, height: 250 },
} as const;

export function AdBanner({
  variant,
  className = '',
  hideLabel = false,
}: AdBannerProps) {
  const { width, height } = AD_DIMENSIONS[variant];
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.clientWidth;
      if (availableWidth > 0 && availableWidth < width) {
        setScale(availableWidth / width);
      } else {
        setScale(1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [width]);

  const scaledHeight = Math.round(height * scale);

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col items-center justify-center ${className}`}
      aria-label="Ruang iklan"
    >
      {!hideLabel && (
        <div className="text-[11px] text-slate-400 mb-1.5 select-none tracking-wide">
          Iklan
        </div>
      )}
      <div
        className="relative overflow-hidden rounded-lg border border-slate-200/80 bg-slate-100/70 flex items-center justify-center"
        style={{
          width: scale < 1 ? '100%' : `${width}px`,
          maxWidth: `${width}px`,
          height: `${scaledHeight}px`,
        }}
      >
        <iframe
          title={`Slot iklan ${width}x${height}`}
          src={`/ad-slot?variant=${variant}`}
          width={width}
          height={height}
          scrolling="no"
          frameBorder={0}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            border: 'none',
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: 'top left',
            position: scale < 1 ? 'absolute' : 'relative',
            top: scale < 1 ? 0 : undefined,
            left: scale < 1 ? 0 : undefined,
          }}
        />
      </div>
    </div>
  );
}
