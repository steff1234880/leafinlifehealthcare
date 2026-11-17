import React from 'react';
import { richTextData } from '../../data/homeData';

export default function RichTextSection({ data = richTextData }) {
  return (
    <section className="bg-white relative z-[1] py-[27px] md:py-[36px]">
      <div className="page-width text-center">
        <div className="mx-auto w-full max-w-[50rem] lg:max-w-full">
          <h2 className="m-0 font-heading text-[26px] md:text-[36px] font-normal leading-[1.3] text-black capitalize">
            {data.heading}
          </h2>
          <div className="mt-[2rem] text-[1.5rem] md:text-[1.6rem] leading-[1.8] text-black">
            <p className="m-0">
              {data.content}
              <br />
              <br />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

