import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getBlogBySlug, blogArticles } from '../data/blogData';

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const article = getBlogBySlug(slug) || blogArticles[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Related articles (other 2 blogs)
  const relatedArticles = blogArticles.filter((b) => b.slug !== article.slug);

  return (
    <main id="MainContent" className="content-for-layout focus-none bg-white text-black" role="main">
      {/* 1. Breadcrumb Hero Banner */}
      <section className="w-full">
        <div
          className="breadcrumb-section relative w-full bg-no-repeat bg-cover bg-center py-[50px] min-[577px]:py-[80px] md:py-[100px] transition-all"
          style={{
            backgroundImage: "url('/assets/images/breadcrumb-bg.jpg')",
          }}
        >
          <div className="page-width relative z-10 text-center">
            <nav
              className="breadcrumb flex flex-col items-center justify-center text-center max-w-[900px] mx-auto"
              role="navigation"
              aria-label="breadcrumbs"
            >
              <h1 className="breadcrumb_title m-0 mb-[1.2rem] font-heading text-[2.2rem] min-[577px]:text-[3rem] xl:text-[3.6rem] font-medium text-black leading-[1.3]">
                {article.fullTitle}
              </h1>

              <div className="flex flex-wrap items-center justify-center mt-[0.5rem] text-[1.2rem] tracking-[3px] uppercase font-medium text-black">
                <Link
                  to="/"
                  className="px-[5px] sm:px-[1.5rem] text-black hover:text-[#2f3e10] transition-colors no-underline"
                >
                  Home
                </Link>

                <span aria-hidden="true" className="breadcrumb__sep inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="2" height="15" viewBox="0 0 2 15" fill="none">
                    <path d="M1 0V15" stroke="currentColor" />
                  </svg>
                </span>

                <Link
                  to="/blogs/news"
                  className="px-[5px] sm:px-[1.5rem] text-black hover:text-[#2f3e10] transition-colors no-underline"
                >
                  News
                </Link>

                <span aria-hidden="true" className="breadcrumb__sep inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="2" height="15" viewBox="0 0 2 15" fill="none">
                    <path d="M1 0V15" stroke="currentColor" />
                  </svg>
                </span>

                <span className="px-[5px] sm:px-[1.5rem] text-black/70 truncate max-w-[250px]">
                  {article.title}
                </span>
              </div>
            </nav>
          </div>
        </div>
      </section>

      {/* 2. Article Content Section */}
      <section className="page-width py-[40px] md:py-[70px]">
        <div className="max-w-[860px] mx-auto">
          {/* Post Meta */}
          <div className="flex flex-wrap items-center justify-center text-[1.3rem] leading-[22px] font-medium capitalize text-black/70 mb-[25px]">
            <span className="flex items-center after:content-['•'] after:inline-block after:px-[12px] after:text-black/30">
              By {article.author}
            </span>
            <span className="flex items-center after:content-['•'] after:inline-block after:px-[12px] after:text-black/30">
              Published on {article.date}
            </span>
            <span className="flex items-center text-[#586c38] font-semibold">
              Ayurvedic Wellness
            </span>
          </div>

          {/* Featured Article Image */}
          <div className="relative w-full pb-[56%] overflow-hidden rounded-[6px] shadow-sm mb-[35px] bg-black/5">
            <img
              src={article.image}
              alt={article.fullTitle}
              width="1500"
              height="841"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

          {/* Article Body */}
          <div className="article-body font-body text-[1.6rem] leading-[1.85] text-black/85 space-y-[24px]">
            {article.content.map((block, idx) => {
              if (block.type === 'heading') {
                return (
                  <h2
                    key={idx}
                    className="font-heading text-[2.4rem] md:text-[2.8rem] font-medium leading-[1.35] text-black pt-[15px] mb-[10px]"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.type === 'quote') {
                return (
                  <blockquote
                    key={idx}
                    className="border-l-4 border-[#586c38] pl-[20px] py-[10px] my-[25px] bg-[#f9f9eb] italic text-[1.7rem] leading-[1.8] text-black/90 font-serif"
                  >
                    {block.text}
                  </blockquote>
                );
              }
              return (
                <p key={idx} className="m-0 whitespace-pre-line">
                  {block.text}
                </p>
              );
            })}
          </div>

          {/* Tags & Share */}
          <div className="mt-[40px] pt-[25px] border-t border-black/10 flex flex-wrap items-center justify-between gap-[15px]">
            <div className="flex flex-wrap items-center gap-[8px]">
              <span className="text-[1.3rem] font-bold uppercase tracking-[1px] text-black mr-[5px]">
                Tags:
              </span>
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-[12px] py-[5px] bg-black/[0.05] rounded-full text-[1.2rem] font-medium text-black/80"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <Link
              to="/blogs/news"
              className="inline-flex items-center text-[1.3rem] font-bold uppercase tracking-[2px] text-[#586c38] hover:text-[#2f3e10] transition-colors"
            >
              ← Back to News
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Related Articles Section */}
      <section className="bg-[#f9f9eb] py-[50px] md:py-[80px] border-t border-black/[0.05]">
        <div className="page-width">
          <div className="text-center mb-[40px]">
            <h2 className="font-heading text-[2.4rem] md:text-[3.2rem] font-normal leading-[1.3] text-black m-0">
              Related Articles & Insights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px] max-w-[900px] mx-auto">
            {relatedArticles.map((rel) => (
              <article
                key={rel._id}
                className="bg-white p-[20px] rounded-[6px] shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="relative w-full pb-[55%] overflow-hidden rounded-[4px] mb-[15px] bg-black/5">
                    <Link to={`/blogs/news/${rel.slug}`} className="block absolute inset-0">
                      <img
                        src={rel.image}
                        alt={rel.fullTitle}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>
                  </div>
                  <div className="text-[1.2rem] text-black/60 mb-[6px]">
                    {rel.date} • {rel.author}
                  </div>
                  <h3 className="font-heading text-[1.8rem] font-medium text-black mb-[10px] leading-[1.35]">
                    <Link
                      to={`/blogs/news/${rel.slug}`}
                      className="text-black hover:text-[#586c38] transition-colors no-underline"
                    >
                      {rel.fullTitle}
                    </Link>
                  </h3>
                  <p className="text-[1.4rem] leading-[1.6] text-black/70 m-0 mb-[15px]">
                    {rel.excerpt}
                  </p>
                </div>
                <Link
                  to={`/blogs/news/${rel.slug}`}
                  className="text-[1.2rem] font-bold uppercase tracking-[2px] text-[#586c38] hover:underline"
                >
                  Read Article →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

