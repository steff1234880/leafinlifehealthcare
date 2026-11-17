import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { initialTestimonials } from '../../data/homeData';

export default function TestimonialsCarousel({ testimonials = initialTestimonials }) {
  return (
    <section className="bg-white relative overflow-hidden w-full py-[40px] md:py-[60px]">
      <div className="page-width">
        {/* Section Header */}
        <div className="text-center mb-[42px]">
          <span className="block text-black text-[13px] tracking-[1.5px] uppercase font-normal m-0">
            Testimonials
          </span>
          <h2 className="m-0 mb-[8px] font-heading text-[32px] font-bold leading-[1.25] tracking-[-0.5px] text-black">
            What Our Clients Say
          </h2>
        </div>

        {/* Swiper Carousel */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={16}
            speed={800}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            navigation={{
              nextEl: '.sec-rev-btn-next',
              prevEl: '.sec-rev-btn-prev',
            }}
            pagination={{
              el: '.sec-rev-pagination',
              clickable: true,
            }}
            breakpoints={{
              576: { slidesPerView: 2, spaceBetween: 16 },
              820: { slidesPerView: 3, spaceBetween: 24 },
              1100: { slidesPerView: 4, spaceBetween: 24 },
              1350: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="!pt-[66px] !pb-[24px] !overflow-visible"
          >
            {testimonials.map((rev) => (
              <SwiperSlide key={rev._id} className="!h-auto !flex !flex-col">
                <div className="group relative bg-[#586c38] rounded-[20px] pt-[72px] px-[20px] pb-[22px] shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_42px_rgba(0,0,0,0.16)] flex flex-col h-full w-full flex-1 border border-white/[0.12] transition-all duration-300 hover:-translate-y-[6px]">
                  {/* Top-Left Floating Circular Avatar */}
                  <div className="absolute -top-[60px] left-[20px] w-[120px] h-[120px] rounded-full border-[4px] border-[#586c38] bg-[#1a1a1a] overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.22)] z-[3] transition-transform duration-300 group-hover:scale-[1.06]">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      loading="lazy"
                      width="120"
                      height="120"
                      className="w-full h-full object-cover object-center block"
                    />
                  </div>

                  {/* Top-Right Header Info (Stars + Name + Role) */}
                  <div className="flex flex-col items-end text-right min-h-[48px] mb-[16px]">
                    <div className="flex gap-[3px] mb-[4px]">
                      {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                        <svg
                          key={idx}
                          className="w-[16px] h-[16px] fill-[#ffd700]"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      ))}
                    </div>

                    <h3 className="m-0 font-heading text-[16px] font-bold uppercase tracking-[0.5px] text-white leading-[1.2]">
                      {rev.name}
                    </h3>
                    <span className="block mt-[3px] text-[10px] font-medium uppercase tracking-[0.8px] text-[#e2e8f0] opacity-90">
                      {rev.role}
                    </span>
                  </div>

                  {/* Review Body Content */}
                  <div className="text-[14px] leading-[1.55] text-white flex-1 flex flex-col">
                    <p className="m-0">{rev.content}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Swiper Navigation & Pill Pagination Controls */}
          <div className="flex items-center justify-center gap-[20px] mt-[28px] relative z-10">
            <button
              type="button"
              aria-label="Previous review"
              className="sec-rev-btn-prev w-[44px] h-[44px] rounded-full bg-white hover:bg-[#586c38] text-[#121212] hover:text-white border border-white flex items-center justify-center cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_22px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-[2px] hover:scale-105 shrink-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div className="sec-rev-pagination-container flex items-center justify-center min-h-[20px]">
              <div className="sec-rev-pagination swiper-pagination-bullets" />
            </div>

            <button
              type="button"
              aria-label="Next review"
              className="sec-rev-btn-next w-[44px] h-[44px] rounded-full bg-white hover:bg-[#586c38] text-[#121212] hover:text-white border border-white flex items-center justify-center cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_22px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-[2px] hover:scale-105 shrink-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

