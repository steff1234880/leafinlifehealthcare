import React from 'react';
import { Link } from 'react-router-dom';
import { specificationData } from '../../data/homeData';

export default function SpecificationBlock({ data = specificationData }) {
  return (
    <div className="bg-white relative z-[1] py-[60px] lg:pt-[36px] lg:pb-[52px]">
      <div className="page-width">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-x-[30px] gap-y-[30px] w-full">
          {/* Left Image Block (order: -1) */}
          <div className="w-full lg:w-[calc(48%-30px)] xl:w-[calc(50%-30px)] order-[-1] text-center">
            <div className="w-full">
              <img
                src={data.image}
                alt={data.title}
                loading="lazy"
                width="1246"
                height="997"
                className="w-full h-full object-cover block"
              />
            </div>
          </div>

          {/* Right Content Block */}
          <div className="w-full lg:max-w-[50%] xl:max-w-[48%] flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="mb-[3rem] flex flex-col items-center sm:items-start">
              <h2 className="m-0 mb-[15px] max-w-[58rem] font-heading text-[26px] md:text-[36px] font-medium leading-[1.3] text-black capitalize">
                {data.title}
              </h2>
              <p className="m-0 text-[1.5rem] md:text-[1.6rem] leading-[1.8] text-black">
                {data.description}
              </p>
            </div>

            <div className="flex flex-col items-center sm:items-start justify-center">
              <Link
                to={data.buttonLink}
                className="lil-button lil-button-pill mt-[1rem]"
              >
                {data.buttonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

