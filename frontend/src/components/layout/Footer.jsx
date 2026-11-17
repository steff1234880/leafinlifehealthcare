import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { footerData } from '../../data/homeData';
import { contentService } from '../../services/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribedMsg, setSubscribedMsg] = useState('');
  const [shopAccordionOpen, setShopAccordionOpen] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    const res = await contentService.subscribeNewsletter(email);
    setSubscribedMsg(res.message);
    setEmail('');
  };

  return (
    <footer
      id="Banner-footer_style3"
      className="relative z-0 bg-[#f9f9eb] text-black mt-[15px]"
    >
      {/* Top Footer Content */}
      <div className="page-full-width page-full-width_spacing border-b border-[#f7e9e3]">
        <div className="row">
          <div className="py-[44px] pb-[24px] sm:py-[66px] sm:pb-[36px] md:pt-[88px] md:pb-[48px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.4fr] gap-y-[3.5rem] gap-x-[30px]">
            {/* Block 1: Logo + Brand Bio + Socials */}
            <div className="flex flex-col items-start text-left max-w-[450px] xl:max-w-[300px]">
              <Link to="/" className="inline-flex mb-[2rem]">
                <img
                  src={footerData.logo}
                  alt="ayurvedic-medicine-manufacturer-Leaf-in-Life-Logo"
                  width="100"
                  height="100"
                  className="max-w-[150px] w-[100px] h-auto object-contain"
                />
              </Link>
              <div className="text-[1.5rem] md:text-[1.6rem] leading-[1.8] text-black">
                <p className="m-0">{footerData.description}</p>
                <br />
              </div>

              {/* Social Icons */}
              <div className="mt-[3rem] md:mt-[4rem]">
                <ul className="flex items-center justify-start gap-[2rem] list-none m-0 p-0">
                  <li>
                    <a
                      href="https://www.facebook.com/leafinlife.healthcare.9/"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="FB"
                      className="flex items-center justify-center text-black hover:text-[#729855] transition-colors"
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 513.2 513.2"
                        className="w-[2.5rem] h-[2.5rem]"
                      >
                        <path
                          fill="currentColor"
                          d="M375.5,288.6l14.3-93h-89.2v-60c0-25.3,12.4-50,52.1-50h40.9V6.8c0,0-36.7-6.3-71.8-6.3c-73.3,0-121.2,44.4-121.2,124.7v70.4h-81v93h81v224h100v-224H375.5z"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.instagram.com/leafinlife_healthcare/"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="IN"
                      className="flex items-center justify-center text-black hover:text-[#729855] transition-colors"
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 18 18"
                        className="w-[2.5rem] h-[2.5rem]"
                      >
                        <path
                          fill="currentColor"
                          d="M8.77 1.58c2.34 0 2.62.01 3.54.05.86.04 1.32.18 1.63.3.41.17.7.35 1.01.66.3.3.5.6.65 1 .12.32.27.78.3 1.64.05.92.06 1.2.06 3.54s-.01 2.62-.05 3.54a4.79 4.79 0 01-.3 1.63c-.17.41-.35.7-.66 1.01-.3.3-.6.5-1.01.66-.31.12-.77.26-1.63.3-.92.04-1.2.05-3.54.05s-2.62 0-3.55-.05a4.79 4.79 0 01-1.62-.3c-.42-.16-.7-.35-1.01-.66-.31-.3-.5-.6-.66-1a4.87 4.87 0 01-.3-1.64c-.04-.92-.05-1.2-.05-3.54s0-2.62.05-3.54c.04-.86.18-1.32.3-1.63.16-.41.35-.7.66-1.01.3-.3.6-.5 1-.65.32-.12.78-.27 1.63-.3.93-.05 1.2-.06 3.55-.06zm0-1.58C6.39 0 6.09.01 5.15.05c-.93.04-1.57.2-2.13.4-.57.23-1.06.54-1.55 1.02C1 1.96.7 2.45.46 3.02c-.22.56-.37 1.2-.4 2.13C0 6.1 0 6.4 0 8.77s.01 2.68.05 3.61c.04.94.2 1.57.4 2.13.23.58.54 1.07 1.02 1.56.49.48.98.78 1.55 1.01.56.22 1.2.37 2.13.4.94.05 1.24.06 3.62.06 2.39 0 2.68-.01 3.62-.05.93-.04 1.57-.2 2.13-.41a4.27 4.27 0 001.55-1.01c.49-.49.79-.98 1.01-1.56.22-.55.37-1.19.41-2.13.04-.93.05-1.23.05-3.61 0-2.39 0-2.68-.05-3.62a6.47 6.47 0 00-.4-2.13 4.27 4.27 0 00-1.02-1.55A4.35 4.35 0 0014.52.46a6.43 6.43 0 00-2.13-.41A69 69 0 008.77 0z"
                        />
                        <path
                          fill="currentColor"
                          d="M8.8 4a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.43a2.92 2.92 0 110-5.85 2.92 2.92 0 010 5.85zM13.43 5a1.05 1.05 0 100-2.1 1.05 1.05 0 000 2.1z"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.youtube.com/@leafinlifehealthcare"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="YouTube"
                      className="flex items-center justify-center text-black hover:text-[#729855] transition-colors"
                    >
                      <svg
                        aria-hidden="true"
                        focusable="false"
                        role="presentation"
                        viewBox="0 0 100 70"
                        className="w-[2.5rem] h-[2.5rem]"
                      >
                        <path
                          d="M98 11c2 7.7 2 24 2 24s0 16.3-2 24a12.5 12.5 0 01-9 9c-7.7 2-39 2-39 2s-31.3 0-39-2a12.5 12.5 0 01-9-9c-2-7.7-2-24-2-24s0-16.3 2-24c1.2-4.4 4.6-7.8 9-9 7.7-2 39-2 39-2s31.3 0 39 2c4.4 1.2 7.8 4.6 9 9zM40 50l26-15-26-15v30z"
                          fill="currentColor"
                        />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Block 2: SHOP Menu Links */}
            <div className="flex flex-col items-start text-left xl:pl-[5rem]">
              <div
                className="w-full flex items-center justify-between md:block cursor-pointer md:cursor-default mb-[10px] md:mb-[30px]"
                onClick={() => setShopAccordionOpen(!shopAccordionOpen)}
              >
                <h2 className="m-0 font-body text-[30px] leading-[30px] font-semibold tracking-[4px] text-black">
                  SHOP
                </h2>
                <span
                  className={`md:hidden transition-transform duration-300 ${
                    shopAccordionOpen ? 'rotate-180' : ''
                  }`}
                >
                  <svg
                    width="15"
                    height="21"
                    viewBox="0 0 15 21"
                    fill="currentColor"
                  >
                    <path d="M8,20.3l6.6-6.6c0.3-0.3,0.3-0.7,0-0.9c-0.3-0.3-0.7-0.3-0.9,0l-5.6,5.6V1.2c0-0.4-0.3-0.7-0.7-0.7c-0.4,0-0.7,0.3-0.7,0.7v17l-5.4-5.4c-0.3-0.3-0.7-0.3-0.9,0c-0.1,0.1-0.2,0.3-0.2,0.5c0,0.2,0.1,0.3,0.2,0.5L7,20.3c0.1,0.1,0.3,0.2,0.5,0.2S7.8,20.4,8,20.3L8,20.3z" />
                  </svg>
                </span>
              </div>

              <ul
                className={`list-none m-0 p-0 flex-col items-start gap-[2px] ${
                  shopAccordionOpen ? 'flex mb-[15px]' : 'hidden md:flex'
                }`}
              >
                {footerData.shopLinks.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="inline-block text-[1.6rem] leading-[30px] font-normal text-black hover:text-[#729855] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Block 3: Newsletter / Trust Block */}
            <div className="flex flex-col items-start text-left max-w-[54.5rem]">
              <h2 className="m-0 mb-[20px] md:mb-[30px] font-body text-[24px] md:text-[30px] leading-[1.25] font-semibold tracking-normal text-black">
                {footerData.newsletterHeading}
              </h2>

              <div className="w-full max-w-[51.5rem]">
                <div className="max-w-[35rem] text-[1.5rem] md:text-[1.6rem] leading-[1.8] text-black">
                  <p className="m-0 mb-[1.25rem]">{footerData.newsletterText}</p>
                </div>

                <form
                  onSubmit={handleNewsletterSubmit}
                  className="mt-[2rem] w-full"
                >
                  <div className="grid grid-cols-1 2xl:grid-cols-[1fr_auto] gap-y-[1.5rem] items-center w-full">
                    <div className="relative w-full">
                      <label htmlFor="NewsletterForm--footer" className="sr-only">
                        Your Email Id
                      </label>
                      <input
                        id="NewsletterForm--footer"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your Email Id"
                        required
                        className="w-full h-[5rem] px-[2rem] bg-white text-black text-[1.6rem] border border-transparent focus:border-black hover:border-black outline-none transition-colors placeholder:text-black/50"
                      />
                    </div>
                    <button
                      type="submit"
                      aria-label="SUBMIT NOW"
                      className="h-[5rem] px-[2.4rem] 2xl:ml-[10px] bg-transparent hover:bg-[#2f3e10] text-black hover:text-white font-body text-[12px] font-bold tracking-[3px] uppercase border-0 cursor-pointer transition-colors"
                    >
                      SUBMIT NOW
                    </button>
                  </div>
                  {subscribedMsg && (
                    <p className="mt-[1rem] text-[1.4rem] text-[#586c38] font-medium">
                      {subscribedMsg}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="page-full-width page-full-width_spacing">
        <div className="row">
          <div className="py-[1.5rem] lg:py-[3.5rem] flex flex-col lg:flex-row items-center justify-between w-full">
            <div className="w-full flex flex-col lg:flex-row items-center justify-between">
              <div className="text-center md:text-right w-full">
                <small className="text-[16px] text-black font-normal">
                  <p className="m-0">
                    {footerData.copyrightText}
                    <a
                      href={footerData.developerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-black hover:text-[#729855] transition-colors no-underline"
                    >
                      {footerData.developerName}
                    </a>
                  </p>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

