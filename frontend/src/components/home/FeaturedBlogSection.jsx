import React from 'react';
import { Link } from 'react-router-dom';
import { initialBlogs } from '../../data/homeData';

export default function FeaturedBlogSection({ blogs = initialBlogs }) {
  return (
    <section className="bg-white relative z-[1] pt-[20px] pb-[14px] sm:pt-[30px] sm:pb-[21px] md:pt-[40px] md:pb-[28px]">
      <div className="page-width">
        <div className="flex flex-col items-center text-center">
          {/* Section Title */}
          <div className="mb-[5rem]">
            <h2 className="m-0 mb-[1.5rem] font-heading text-[26px] md:text-[36px] font-normal leading-[1.3] text-black capitalize">
              Ayurvedic Brand in Kerala – Trusted Wellness Insights
            </h2>
          </div>

          {/* 3-Column Blog Posts Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-x-[30px] gap-y-[30px]">
            {blogs.map((post) => (
              <article
                key={post._id}
                className="group flex flex-col text-left w-full"
              >
                {/* Blog Image (60.24% aspect ratio) */}
                <div className="relative w-full pb-[60.24%] overflow-hidden bg-black/5">
                  <Link
                    to={post.url}
                    className="block absolute inset-0 overflow-hidden"
                  >
                    <img
                      src={post.image}
                      alt={post.fullTitle}
                      loading="lazy"
                      width="1500"
                      height="841"
                      className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                </div>

                {/* Blog Card Content */}
                <div className="pt-[20px] flex flex-col items-start text-left">
                  {/* Author | Date */}
                  <div className="flex flex-wrap items-center text-[1.4rem] leading-[25px] font-medium capitalize text-black mb-[0.5rem]">
                    <span className="flex items-center py-[5px] after:content-['|'] after:inline-block after:px-[15px]">
                      {post.author}
                    </span>
                    <span className="flex items-center py-[5px]">
                      {post.date}
                    </span>
                  </div>

                  {/* Blog Heading */}
                  <div className="w-full mb-[20px]">
                    <h3 className="m-0 font-heading text-[1.8rem] md:text-[2.4rem] xl:text-[2.6rem] font-normal leading-[1.3] text-black">
                      <Link
                        to={post.url}
                        className="text-black hover:text-[#729855] transition-colors no-underline"
                      >
                        {post.title}
                      </Link>
                    </h3>
                  </div>

                  {/* Read More Underline Button */}
                  <Link
                    to={post.url}
                    className="relative inline-block font-heading text-[1.2rem] font-bold uppercase tracking-[3px] text-black bg-transparent p-0 no-underline after:content-[''] after:absolute after:left-0 after:-bottom-[2px] after:w-full hover:after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-300"
                  >
                    Read More
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom View all Posts Button */}
          <div className="mx-auto mt-[3rem]">
            <Link
              to="/blogs/news"
              className="inline-flex items-center justify-center min-w-[12rem] min-h-[5rem] px-[30px] font-heading text-[1.2rem] font-bold uppercase tracking-[3px] bg-transparent text-black border border-black hover:bg-black hover:text-white transition-all duration-300 no-underline"
            >
              View all Posts
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

