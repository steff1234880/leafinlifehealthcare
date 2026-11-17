import React, { useState, useEffect } from 'react';
import { initialVideoReels } from '../../data/homeData';

function ReelCard({ reel, onOpenModal }) {
  const [imgSrc, setImgSrc] = useState(
    reel.customThumb ||
      `https://images.weserv.nl/?url=https://www.instagram.com/p/${reel.reelId}/media/?size=l`
  );

  const handleImgError = () => {
    if (imgSrc !== reel.fallbackThumb) {
      setImgSrc(reel.fallbackThumb);
    }
  };

  return (
    <div
      id={reel.id}
      onClick={() => onOpenModal(reel)}
      className="group relative rounded-[12px] overflow-hidden bg-black cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-[6px] aspect-[9/16] w-full flex-[0_0_72%] sm:flex-initial snap-start"
    >
      {/* Center Hover Play Icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-90 group-hover:scale-100 w-[56px] h-[56px] bg-white/85 backdrop-blur-[4px] rounded-full flex items-center justify-center z-[3] opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.25)]">
        <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-[#121212] ml-[3px]">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>

      {/* Poster Thumbnail Container */}
      <div className="w-full h-full">
        <img
          src={imgSrc}
          onError={handleImgError}
          alt="Instagram Reel Thumbnail"
          loading="lazy"
          className="w-full h-full object-cover object-center block transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
    </div>
  );
}

export default function VideoReelsSection({ reels = initialVideoReels }) {
  const [activeReel, setActiveReel] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeReel) {
        setActiveReel(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReel]);

  useEffect(() => {
    if (activeReel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeReel]);

  return (
    <>
      <div className="bg-white py-[24px] md:py-[36px]">
        <div className="page-width">
          {/* Desktop 4-col Grid / Tablet Auto-Fill / Mobile Horizontal Snap Carousel */}
          <div className="flex sm:grid flex-nowrap overflow-x-auto sm:overflow-visible snap-x snap-mandatory gap-[12px] lg:gap-[20px] pb-[12px] sm:pb-0 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] lg:grid-cols-4 w-full no-scrollbar">
            {reels.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                onOpenModal={(item) => setActiveReel(item)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal Lightbox Video Player */}
      {activeReel && (
        <div
          className="fixed inset-0 z-[999999] bg-black/88 backdrop-blur-[8px] flex items-center justify-center p-[20px]"
          role="dialog"
          aria-modal="true"
          aria-label="Video Player"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveReel(null);
          }}
        >
          <div className="relative w-full max-w-[440px] max-h-[90vh] aspect-[9/16] bg-black rounded-[18px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col">
            <button
              type="button"
              onClick={() => setActiveReel(null)}
              aria-label="Close Video"
              className="absolute top-[16px] right-[16px] w-[36px] h-[36px] bg-black/65 hover:bg-white/30 border border-white/25 rounded-full text-white flex items-center justify-center cursor-pointer z-20 transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>

            <div className="w-full h-full relative">
              <iframe
                src={`https://www.instagram.com/p/${activeReel.reelId}/embed/captioned/`}
                title="Instagram Reel"
                className="w-full h-full border-0 block object-cover"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
              <div className="absolute bottom-[12px] left-[12px] right-[12px] z-[15] flex justify-center">
                <a
                  href={activeReel.videoSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background:
                      'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  }}
                  className="inline-flex items-center gap-[8px] py-[10px] px-[20px] rounded-[24px] text-white text-[13px] font-semibold no-underline shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-[2px] hover:scale-[1.03]"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Watch &amp; Connect on Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

