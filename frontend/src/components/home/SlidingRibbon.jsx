import React from 'react';

function RibbonIcon({ type }) {
  switch (type) {
    case 'star4':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full block">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full block">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 16.50 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'shield':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-full h-full block"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'award':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-full h-full block"
        >
          <circle cx="12" cy="8" r="7" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      );
    case 'leaf':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full block"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );
    case 'check':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full block"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'truck':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-full h-full block"
        >
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function SlidingRibbon({
  items = [],
  variant = 'green', // 'green' | 'white'
  withSectionPadding = false,
}) {
  const isGreen = variant === 'green';

  return (
    <div
      className={`bg-white ${
        withSectionPadding
          ? 'pt-[12px] pb-[12px] md:pt-[60px] md:pb-[40px]'
          : 'py-0'
      }`}
    >
      <div
        className={`sliding-ribbon-wrapper relative overflow-hidden w-full flex items-center min-h-[48px] md:min-h-[82px] ${
          isGreen
            ? 'bg-[#586c38] border-y-[10px] border-transparent text-white'
            : 'bg-white border-y-[2px] border-[#586c38] text-[#586c38]'
        }`}
      >
        <div className="sliding-ribbon-track">
          {/* Group 1 & Duplicate Group 2 for Seamless Infinite Loop */}
          {[0, 1].map((groupIdx) => (
            <div
              key={groupIdx}
              aria-hidden={groupIdx === 1 ? 'true' : undefined}
              className="flex items-center gap-[33.6px] pr-[33.6px] md:gap-[69.7px] md:pr-[69.7px]"
            >
              {items.map((item) => (
                <div
                  key={`${groupIdx}-${item.id}`}
                  className={`inline-flex items-center gap-[7.68px] md:gap-[14.76px] text-[13.44px] md:text-[24.6px] font-semibold tracking-[1px] uppercase shrink-0 ${
                    isGreen ? 'text-white' : 'text-[#586c38]'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-[18.24px] h-[18.24px] md:w-[34.44px] md:h-[34.44px] shrink-0 ${
                      isGreen ? 'text-white' : 'text-[#586c38]'
                    }`}
                  >
                    <RibbonIcon type={item.icon} />
                  </span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

