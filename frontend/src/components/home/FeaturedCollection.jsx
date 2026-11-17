import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import ProductCard from '../common/ProductCard';
import { featuredCollectionHeader, initialProducts } from '../../data/homeData';

export default function FeaturedCollection({
  header = featuredCollectionHeader,
  products = initialProducts,
}) {
  return (
    <section className="bg-white relative z-[1] pt-[20px] pb-[42px] sm:pt-[30px] sm:pb-[63px] md:pt-[40px] md:pb-[84px]">
      <div className="page-width px-[2rem] lg:px-[4rem]">
        <div className="flex flex-col lg:flex-row items-start">
          {/* Left Column: Title + Description + View All Button */}
          <div className="w-full lg:max-w-[48rem] lg:mt-[1rem] lg:pr-[40px] mb-[4rem] lg:mb-0 text-center sm:text-left flex flex-col items-center sm:items-start shrink-0">
            <div className="flex flex-col items-center sm:items-start">
              <h2 className="m-0 mb-[15px] lg:mb-[35px] font-heading text-[26px] md:text-[36px] font-medium leading-[1.3] text-black capitalize">
                {header.title}
              </h2>
              <p className="m-0 mb-[15px] lg:mb-[35px] text-[1.5rem] md:text-[1.6rem] leading-[1.8] text-black">
                {header.description}
              </p>
              <Link
                to={header.buttonLink}
                className="lil-button lil-button-pill"
              >
                {header.buttonText}
              </Link>
            </div>
          </div>

          {/* Right Column: Swiper Product Slider */}
          <div className="w-full lg:w-[calc(76%-60px)] flex-1 min-w-0 featured-collection-swiper">
            <Swiper
              modules={[Pagination, Autoplay]}
              slidesPerView={2}
              spaceBetween={15}
              loop={true}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              pagination={{
                clickable: true,
              }}
              breakpoints={{
                750: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                1200: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                1540: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                },
              }}
            >
              {products.map((product) => (
                <SwiperSlide key={product._id} className="!h-auto">
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}

