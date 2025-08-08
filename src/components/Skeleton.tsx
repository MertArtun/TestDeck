import React from 'react';

export function Skeleton({ height = 16, width = '100%', radius = 8 }: { height?: number; width?: number | string; radius?: number }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: radius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.15), rgba(255,255,255,0.3), rgba(255,255,255,0.15))',
        animation: 'skeleton-loading 1.2s ease-in-out infinite',
      }}
    />
  );
}

export function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={14} width={i === lines - 1 ? '80%' : '100%'} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}
    >
      <Skeleton height={20} width={160} />
      <div style={{ height: 12 }} />
      <SkeletonBlock lines={3} />
    </div>
  );
}

// keyframes via global style injection
if (typeof document !== 'undefined') {
  const id = 'skeleton-style';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.innerHTML = `@keyframes skeleton-loading {0%{background-position: 0% 50%}50%{background-position: 100% 50%}100%{background-position: 0% 50%}}`;
    document.head.appendChild(style);
  }
}


