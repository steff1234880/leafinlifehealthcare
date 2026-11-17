import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blogArticles } from '../data/blogData';
import { contentService } from '../services/api';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState(blogArticles);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch home content if blogs are provided via service
    const loadBlogs = async () => {
      try {
        const data = await contentService.getHomeContent();
        if (data && data.blogs && data.blogs.length > 0) {
          // Merge rich details if needed, default to blogArticles
          setBlogs(blogArticles);
        }
      } catch (err) {
        setBlogs(blogArticles);
      } finally {
        setLoading(false);
      }
    };
    loadBlogs();
  }, []);

  return (
    <main id="MainContent" className="content-for-layout focus-none bg-white text-black" role="main">
      {/* 1. Breadcrumb Hero Banner (matching site standard) */}
      <section className="w-full">
        <div
          className="breadcrumb-section relative w-full bg-no-repeat bg-cover bg-center py-[60px] min-[577px]:py-[90px] md:py-[120px] transition-all"
          style={{
            backgroundImage: "url('/assets/images/breadcrumb-bg.jpg')",
          }}
        >
          <div className="page-width relative z-10 text-center">
            <nav
              className="breadcrumb flex flex-col items-center justify-center text-center"
              role="navigation"
              aria-label="breadcrumbs"
            >
              <h1 className="breadcrumb_title m-0 mb-[1rem] font-heading text-[2.6rem] min-[577px]:text-[3.4rem] xl:text-[4rem] font-medium capitalize text-black leading-[1.3]">
                News & Articles
              </h1>

              <div className="flex flex-wrap items-center justify-center mt-[0.5rem] text-[1.2rem] tracking-[3px] uppercase font-medium text-black">
                <Link
                  to="/"
                  title="Back to the frontpage"
                  className="px-[5px] sm:px-[2rem] text-black hover:text-[#2f3e10] transition-colors no-underline"
                >
                  Home
                </Link>

                <span aria-hidden="true" className="breadcrumb__sep inline-flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="2"
                    height="15"
                    viewBox="0 0 2 15"
                    fill="none"
                  >
                    <path d="M1 0V15" stroke="currentColor" />
                  </svg>
                </span>

                <span className="px-[5px] sm:px-[2rem] text-black">
                  News
                </span>
              </div>
            </nav>
          </div>
        </div>
      </section>

      {/* 2. Blog Articles Grid Section */}
      <section className="page-width py-[40px] md:py-[70px]">
        <div className="row">
          {/* Section Subheading */}
          <div className="text-center mb-[40px] md:mb-[60px]">
            <span className="inline-block text-[#586c38] font-body text-[1.3rem] md:text-[1.4rem] tracking-[3px] uppercase font-semibold mb-[10px]">
              Ayurvedic Brand in Kerala
            </span>
            <h2 className="m-0 font-heading text-[2.6rem] md:text-[3.6rem] font-normal leading-[1.3] text-black">
              Trusted Wellness Insights & Herbal Guides
            </h2>
          </div>

          {/* Grid Layout (3-columns on desktop, 1-column on mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[30px] gap-y-[45px]">
            {blogs.map((post) => (
              <article
                key={post._id}
                className="group flex flex-col text-left w-full bg-white transition-all"
              >
                {/* Blog Featured Image */}
                <div className="relative w-full pb-[60.24%] overflow-hidden bg-black/5 rounded-[4px]">
                  <Link
                    to={`/blogs/news/${post.slug}`}
                    className="block absolute inset-0 overflow-hidden"
                  >
                    <img
                      src={post.image}
                      alt={post.fullTitle}
                      loading="lazy"
                      width="1500"
                      height="841"
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                  </Link>
                </div>

                {/* Blog Card Content */}
                <div className="pt-[22px] flex flex-col items-start text-left flex-1 justify-between">
                  <div>
                    {/* Author & Date metadata */}
                    <div className="flex flex-wrap items-center text-[1.3rem] leading-[22px] font-medium capitalize text-black/70 mb-[8px]">
                      <span className="flex items-center after:content-['|'] after:inline-block after:px-[12px] after:text-black/30">
                        {post.author}
                      </span>
                      <span className="flex items-center">
                        {post.date}
                      </span>
                    </div>

                    {/* Article Title */}
                    <h3 className="m-0 mb-[12px] font-heading text-[2rem] md:text-[2.2rem] font-normal leading-[1.3] text-black">
                      <Link
                        to={`/blogs/news/${post.slug}`}
                        className="text-black hover:text-[#586c38] transition-colors no-underline"
                      >
                        {post.fullTitle || post.title}
                      </Link>
                    </h3>

                    {/* Excerpt */}
                    <p className="font-body text-[1.45rem] leading-[1.7] text-black/75 m-0 mb-[18px]">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Read More Link with animated underline */}
                  <Link
                    to={`/blogs/news/${post.slug}`}
                    className="relative inline-block font-heading text-[1.2rem] font-bold uppercase tracking-[3px] text-black hover:text-[#586c38] bg-transparent p-0 no-underline transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-[2px] after:w-full hover:after:w-0 after:h-[1px] after:bg-current after:transition-all after:duration-300"
                  >
                    Read More
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

