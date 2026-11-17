import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AboutUsPage() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main id="MainContent" className="content-for-layout focus-none bg-white text-black" role="main">
      {/* 1. Breadcrumb Hero Banner (matching site standard & ShopPage breadcrumb) */}
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
                About Us
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
                  About Us
                </span>
              </div>
            </nav>
          </div>
        </div>
      </section>

      {/* 2. Brand Introduction Story Section */}
      <section className="page-width py-[50px] md:py-[80px]">
        <div className="row">
          <div className="max-w-[850px] mx-auto text-center px-[15px]">
            <span className="inline-block text-[#586c38] font-body text-[1.3rem] md:text-[1.4rem] tracking-[3px] uppercase font-semibold mb-[12px]">
              Every Leaf Carries Health
            </span>
            <h2 className="font-heading text-[2.6rem] sm:text-[3.2rem] md:text-[4rem] font-normal leading-[1.3] text-black mb-[24px]">
              Authentic Ayurvedic Excellence from Kerala
            </h2>
            <div className="text-[1.6rem] leading-[1.85] text-black/85 space-y-[16px]">
              <p className="m-0">
                With strong roots in Kerala's rich Ayurvedic heritage, we proudly continue the legacy of traditional healing through high-quality herbal formulations. As one of the dependable Ayurvedic Medicine Manufacturers in Kerala, we combine classical Ayurvedic knowledge with modern quality standards to deliver safe, effective, and trusted wellness solutions.
              </p>
              <p className="m-0">
                At Leaf in Life Healthcare, our guiding philosophy is simple yet profound: <em>"Every leaf carries health."</em> We believe that nature is the ultimate physician, offering time-tested botanical treasures that restore harmony to the body, mind, and spirit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Heritage & Values Feature Block */}
      <section className="bg-[#f9f9eb] py-[60px] md:py-[90px] border-y border-black/[0.05]">
        <div className="page-width">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[30px] lg:gap-[40px]">
            {/* Feature 1 */}
            <div className="bg-white p-[35px_25px] sm:p-[40px_30px] rounded-[4px] shadow-sm text-center flex flex-col items-center">
              <div className="w-[60px] h-[60px] rounded-full bg-[#586c38]/10 text-[#586c38] flex items-center justify-center mb-[20px]">
                <svg className="w-[30px] h-[30px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-heading text-[2.2rem] font-medium text-black mb-[12px]">
                40+ Years of Expertise
              </h3>
              <p className="font-body text-[1.5rem] leading-[1.7] text-black/75 m-0">
                Backed by four decades of traditional Ayurvedic research, research formulations, and clinical heritage originating from Kerala.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-[35px_25px] sm:p-[40px_30px] rounded-[4px] shadow-sm text-center flex flex-col items-center">
              <div className="w-[60px] h-[60px] rounded-full bg-[#586c38]/10 text-[#586c38] flex items-center justify-center mb-[20px]">
                <svg className="w-[30px] h-[30px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-heading text-[2.2rem] font-medium text-black mb-[12px]">
                100% Edible & Pure
              </h3>
              <p className="font-body text-[1.5rem] leading-[1.7] text-black/75 m-0">
                Crafted from handpicked botanicals, rigorously tested for safety, and free from harmful additives, heavy chemicals, or artificial adulterants.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-[35px_25px] sm:p-[40px_30px] rounded-[4px] shadow-sm text-center flex flex-col items-center">
              <div className="w-[60px] h-[60px] rounded-full bg-[#586c38]/10 text-[#586c38] flex items-center justify-center mb-[20px]">
                <svg className="w-[30px] h-[30px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-heading text-[2.2rem] font-medium text-black mb-[12px]">
                Modern Production Facility
              </h3>
              <p className="font-body text-[1.5rem] leading-[1.7] text-black/75 m-0">
                Manufactured with precision at our dedicated facility in Angamaly / Nedumbassery, Kerala, adhering to stringent GMP standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Two-Column Story & Showcase Section */}
      <section className="page-width py-[60px] md:py-[100px]">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-[40px] lg:gap-[60px]">
          {/* Left Visual Banner */}
          <div className="w-full lg:w-1/2">
            <div className="relative overflow-hidden rounded-[8px] shadow-md group">
              <img
                src="/assets/images/spec-f.jpg"
                alt="Ayurvedic medicine manufacturing and natural herbs"
                loading="lazy"
                width="1246"
                height="997"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-[25px] sm:p-[35px]">
                <p className="text-white text-[1.6rem] font-heading font-medium tracking-wide m-0">
                  Ancient Healing Wisdom • Modern Wellness Solutions
                </p>
              </div>
            </div>
          </div>

          {/* Right Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start">
            <span className="text-[#586c38] font-body text-[1.3rem] tracking-[3px] uppercase font-semibold mb-[10px]">
              Our Mission
            </span>
            <h2 className="font-heading text-[2.6rem] sm:text-[3.2rem] md:text-[3.6rem] font-medium leading-[1.3] text-black mb-[20px]">
              Bridging Ancient Heritage with Everyday Life
            </h2>
            <div className="text-[1.5rem] sm:text-[1.6rem] leading-[1.8] text-black/80 space-y-[15px] mb-[30px]">
              <p className="m-0">
                Ayurveda is not merely a collection of treatments; it is an enduring way of life that teaches harmony between nature and humanity. At Leaf in Life, we strive to make this profound wisdom accessible, convenient, and empowering for modern consumers.
              </p>
              <p className="m-0">
                From our flagship <strong>Bashpika Thulasi</strong> formulation to restorative oils like <strong>Sarvanga Thailam</strong> and <strong>Sukh Body Care Oil</strong>, each product is produced with meticulous care, batch verification, and reverence for authentic Kerala traditions.
              </p>
            </div>

            <div className="flex flex-wrap gap-[15px]">
              <Link to="/collections/all" className="lil-button lil-button-pill">
                Explore Our Formulations
              </Link>
              <Link
                to="/pages/contact"
                className="inline-flex items-center justify-center font-body text-[1.2rem] font-bold tracking-[3px] uppercase px-[3rem] py-[1.4rem] border border-black/20 hover:border-[#2f3e10] text-black hover:text-[#2f3e10] transition-colors rounded-[30px]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Production & Quality Standards Banner */}
      <section className="bg-[#2f3e10] text-white py-[60px] md:py-[80px]">
        <div className="page-width text-center">
          <div className="max-w-[750px] mx-auto px-[15px]">
            <h2 className="font-heading text-[2.6rem] sm:text-[3.4rem] font-medium leading-[1.3] text-white mb-[18px]">
              Committed to Purity & Authenticity
            </h2>
            <p className="font-body text-[1.6rem] leading-[1.8] text-white/85 mb-[30px]">
              Our manufacturing unit in Nedumbassery, Kerala combines traditional Ayurvedic preparation methods with modern, hygienic processing to preserve the raw therapeutic potency of every ingredient.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-[20px] pt-[10px] border-t border-white/20">
              <div className="p-[10px]">
                <div className="font-heading text-[2.4rem] font-bold text-[#fef9ea] mb-[4px]">100%</div>
                <div className="font-body text-[1.3rem] uppercase tracking-[1px] text-white/80">Natural Herbs</div>
              </div>
              <div className="p-[10px]">
                <div className="font-heading text-[2.4rem] font-bold text-[#fef9ea] mb-[4px]">GMP</div>
                <div className="font-body text-[1.3rem] uppercase tracking-[1px] text-white/80">Certified Standards</div>
              </div>
              <div className="p-[10px]">
                <div className="font-heading text-[2.4rem] font-bold text-[#fef9ea] mb-[4px]">40+</div>
                <div className="font-body text-[1.3rem] uppercase tracking-[1px] text-white/80">Years Heritage</div>
              </div>
              <div className="p-[10px]">
                <div className="font-heading text-[2.4rem] font-bold text-[#fef9ea] mb-[4px]">0%</div>
                <div className="font-body text-[1.3rem] uppercase tracking-[1px] text-white/80">Harmful Chemicals</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

