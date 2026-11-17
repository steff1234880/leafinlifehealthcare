import React from 'react';
import { Link } from 'react-router-dom';
import { bentoData } from '../../data/homeData';

function BuyNowOverlayButton({ text = 'Buy Now' }) {
  return (
    <div
      className="absolute inset-0 p-[22px] flex flex-col justify-end items-start z-[3] pointer-events-none"
      style={{
        background:
          'linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.1) 50%, transparent 100%)',
      }}
    >
      <span className="pointer-events-auto inline-flex items-center justify-center gap-[8px] py-[10px] px-[22px] rounded-[20px] text-[12px] font-bold tracking-[0.8px] uppercase bg-[#586c38] hover:bg-[#121212] text-white shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_26px_rgba(0,0,0,0.35)] mt-[6px] transition-all duration-300 hover:-translate-y-[3px] hover:scale-[1.04] group/btn">
        {text}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="transition-transform duration-300 group-hover/btn:translate-x-[4px]"
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </span>
    </div>
  );
}

export default function BentoGrid({ data = bentoData }) {
  return (
    <section className="bg-white pt-[24px] pb-[24px] md:pt-[20px] md:pb-[76px]">
      <div className="page-width">
        {/* 3-Column Flexbox Container */}
        <div className="flex flex-col lg:flex-row gap-[12px] lg:gap-[16px] items-stretch w-full">
          {/* Column 1: Left Most Image Card (Spans 100% Full Section Height Top to Bottom) */}
          <div className="flex flex-col gap-[12px] lg:gap-[16px] w-full lg:flex-1 self-stretch">
            <div className="relative overflow-hidden w-full h-full min-h-[286px] lg:min-h-full flex bg-transparent transition-all duration-500 hover:-translate-y-[5px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] group">
              <Link
                to={data.leftCard.link}
                className="flex items-center justify-center w-full h-full relative overflow-hidden no-underline"
              >
                <img
                  src={data.leftCard.image}
                  alt={data.leftCard.alt}
                  loading="lazy"
                  width="996"
                  height="2016"
                  className="w-full h-full object-contain object-center block transition-transform duration-500 group-hover:scale-[1.07]"
                />
                <BuyNowOverlayButton text={data.leftCard.buttonText} />
              </Link>
            </div>
          </div>

          {/* Column 2: Center Column (Text Box Top + Square Image Card Below Text) */}
          <div className="flex flex-col justify-between gap-[12px] lg:gap-[16px] w-full lg:flex-1">
            {/* Center Top: Static Natural Text Box (Zero Hover Elevation) */}
            <div className="bg-white flex items-center justify-center flex-1 w-full">
              <div className="py-[28px] px-[20px] text-center w-full max-w-[420px] mx-auto flex flex-col items-center justify-center">
                <h2 className="m-0 mb-[12px] font-heading text-[22px] sm:text-[36px] font-normal leading-[1.35] text-[#121212]">
                  Natural <br />
                  Ayurvedic <br />
                  Solutions for Everyday
                  <br /> Wellness,
                  <br /> Made Just <br />
                  for You
                </h2>
              </div>
            </div>

            {/* Center Bottom: 1:1 Square Image Card Below Text */}
            <div className="relative overflow-hidden w-full lg:aspect-square min-h-[220px] shrink-0 flex bg-transparent transition-all duration-500 hover:-translate-y-[5px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] group">
              <Link
                to={data.centerBottomCard.link}
                className="flex items-center justify-center w-full h-full relative overflow-hidden no-underline"
              >
                <img
                  src={data.centerBottomCard.image}
                  alt={data.centerBottomCard.alt}
                  loading="lazy"
                  width="1125"
                  height="1125"
                  className="w-full h-full object-contain object-center block transition-transform duration-500 group-hover:scale-[1.07]"
                />
                <BuyNowOverlayButton text={data.centerBottomCard.buttonText} />
              </Link>
            </div>
          </div>

          {/* Column 3: Right Column (2 Stacked 1:1 Square Images) */}
          <div className="flex flex-col gap-[12px] lg:gap-[16px] w-full lg:flex-1">
            {/* Right Top: Square Image Card */}
            <div className="relative overflow-hidden w-full lg:aspect-square min-h-[220px] shrink-0 flex bg-transparent transition-all duration-500 hover:-translate-y-[5px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] group">
              <Link
                to={data.rightTopCard.link}
                className="flex items-center justify-center w-full h-full relative overflow-hidden no-underline"
              >
                <img
                  src={data.rightTopCard.image}
                  alt={data.rightTopCard.alt}
                  loading="lazy"
                  width="830"
                  height="830"
                  className="w-full h-full object-contain object-center block transition-transform duration-500 group-hover:scale-[1.07]"
                />
                <BuyNowOverlayButton text={data.rightTopCard.buttonText} />
              </Link>
            </div>

            {/* Right Bottom: Square Image Card */}
            <div className="relative overflow-hidden w-full lg:aspect-square min-h-[220px] shrink-0 flex bg-transparent transition-all duration-500 hover:-translate-y-[5px] hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)] group">
              <Link
                to={data.rightBottomCard.link}
                className="flex items-center justify-center w-full h-full relative overflow-hidden no-underline"
              >
                <img
                  src={data.rightBottomCard.image}
                  alt={data.rightBottomCard.alt}
                  loading="lazy"
                  width="1125"
                  height="1125"
                  className="w-full h-full object-contain object-center block transition-transform duration-500 group-hover:scale-[1.07]"
                />
                <BuyNowOverlayButton text={data.rightBottomCard.buttonText} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

