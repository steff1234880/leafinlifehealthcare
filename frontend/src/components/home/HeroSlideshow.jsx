import React from 'react';
import { Link } from 'react-router-dom';
import { heroData } from '../../data/homeData';

export default function HeroSlideshow({ data = heroData }) {
  const slide = data.slides[0];

  return (
    <section
      id="shopify-section-slideshow"
      className="w-full relative overflow-hidden"
    >
      <div className="page-full-width home-slider1">
        <div className="relative flex flex-col">
          {/* Slide Container */}
          <div className="relative w-full h-full sm:h-[500px] lg:h-[540px] 2xl:h-[750px] flex flex-col md:block">
            {/* Slide Media (Desktop & Mobile Images) */}
            <div className="relative md:absolute inset-0 w-full h-full">
              <img
                src={slide.desktopImage}
                alt={slide.heading}
                width="2880"
                height="1335"
                className="hidden md:block w-full h-full object-cover object-center"
              />
              <div className="relative md:hidden w-full">
                <img
                  src={slide.mobileImage}
                  alt={slide.heading}
                  width="1050"
                  height="750"
                  className="block md:hidden w-full h-auto object-cover"
                />
                {/* Mobile subtle dark overlay matching original @media (max-width: 576px) .slideshow__media:after */}
                <div className="sm:hidden absolute inset-0 bg-black/50 pointer-events-none" />
              </div>
            </div>

            {/* Slide Content Overlay Box (Top-Right on Desktop, Stacked Below on Mobile) */}
            <div className="relative md:absolute inset-0 z-10 page-width flex items-start justify-center md:justify-end p-0 md:p-[4rem] lg:p-[5rem] h-full">
              <div
                style={{ backgroundColor: slide.boxBgColor || '#fef9ea' }}
                className="w-full md:w-[50%] lg:w-auto md:min-w-[45rem] md:max-w-[62.5rem] md:mt-[6%] md:mr-[5%] py-[4rem] px-[3.5rem] flex flex-col items-center md:items-start text-center md:text-left z-10"
              >
                <h2 className="m-0 mb-[15px] font-heading text-[2.6rem] md:text-[4rem] 2xl:text-[6rem] font-medium leading-[1.2] text-black capitalize">
                  {slide.heading}
                </h2>

                <div className="m-0 max-w-[55rem] text-[1.5rem] md:text-[1.6rem] leading-[25px] text-black">
                  <span>{slide.description}</span>
                </div>

                <div className="mt-[2.5rem] inline-flex flex-wrap">
                  <Link
                    to={slide.buttonLink}
                    style={{ backgroundColor: slide.buttonBgColor || '#796346' }}
                    className="lil-button lil-button-pill text-white hover:!bg-black"
                  >
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            </div>

            {/* Banner Bottom Pipe Accent (matches original .banner-bottom) */}
            <div className="hidden sm:flex absolute z-20 bottom-[2rem] left-[3%] items-center">
              <div className="before:content-['|'] before:text-[14px] before:px-[15px] before:inline-block">
                <Link
                  to={slide.bottomLink}
                  aria-label="Featured Product"
                  className="inline-block font-bold text-black hover:text-[#729855]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

