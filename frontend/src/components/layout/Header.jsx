import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navigationLinks } from '../../data/homeData';
import { useStore } from '../../context/StoreContext';

export default function Header() {
  const location = useLocation();
  const {
    cartCount,
    setIsSearchOpen,
    setIsLoginOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useStore();

  return (
    <>
      {/* Announcement Bar Wrapper (matches original #shopify-section-announcement-bar) */}
      <div id="announcement-bar" className="relative bg-[#f5f5f5] border-b border-black/[0.08] py-[8px] flex justify-center overflow-hidden">
        <div className="flex items-center whitespace-nowrap overflow-hidden">
          <div className="flex items-center justify-around shrink-0 min-w-full" />
        </div>
      </div>

      {/* Main Header (matches original #header.header--middle-left) */}
      <div className="sticky top-0 z-30 bg-white">
        <header id="header" className="bg-white py-[20px] xl:py-[1.3rem] border-b border-black/[0.04]">
          <div className="page-full-width page-full-width_spacing">
            <div className="row">
              <div className="grid grid-cols-[auto_1.3fr_1fr] xl:grid-cols-[1fr_auto_1fr] items-center gap-x-[15px] xl:gap-x-[1rem] gap-y-[10px]">
                {/* Mobile / Tablet Hamburger Menu Button (visible < 1220px) */}
                <div className="flex xl:hidden items-center">
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Menu"
                    className="w-[23px] h-[23px] flex items-center justify-center text-black hover:text-[#2f3e10] transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      focusable="false"
                      role="presentation"
                      className="w-[2rem] h-[2rem]"
                      fill="none"
                      viewBox="0 0 18 16"
                    >
                      <path
                        d="M1 .5a.5.5 0 100 1h15.71a.5.5 0 000-1H1zM.5 8a.5.5 0 01.5-.5h15.71a.5.5 0 010 1H1A.5.5 0 01.5 8zm0 7a.5.5 0 01.5-.5h15.71a.5.5 0 010 1H1a.5.5 0 01-.5-.5z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </div>

                {/* Brand Logo */}
                <h1 className="m-0 leading-none justify-self-start flex items-center">
                  <Link to="/" className="inline-flex items-center leading-none">
                    <img
                      src="/assets/images/logo-header.webp"
                      alt="ayurvedic-medicine-manufacturer-in-kerala-Leaf-in-Life-Logo"
                      width="100"
                      height="150"
                      className="w-[100px] h-auto object-contain"
                    />
                  </Link>
                </h1>

                {/* Desktop Inline Navigation (visible >= 1220px) */}
                <div className="hidden xl:inline-flex justify-center w-full">
                  <nav role="navigation" aria-label="Main Navigation">
                    <ul className="inline-flex flex-wrap items-center list-none m-0 p-0 z-[2]">
                      {navigationLinks.map((item) => {
                        const isActive =
                          item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);
                        return (
                          <li key={item.id} className="relative p-0">
                            <div className="relative">
                              <Link
                                to={item.path}
                                className={`block font-heading text-[1.6rem] font-normal px-[16px] py-[1.4rem] relative transition-colors duration-300 capitalize ${
                                  isActive
                                    ? 'text-[#729855]'
                                    : 'text-black hover:text-[#729855]'
                                }`}
                              >
                                {item.badge && (
                                  <em className="not-italic whitespace-nowrap text-[8px] leading-[16px] font-normal px-[5px] bg-[#64bf99] text-white absolute top-1/2 -translate-y-1/2 -mt-[16px] -right-[2px]">
                                    {item.badge}
                                  </em>
                                )}
                                <span data-hover={item.label}>{item.label}</span>
                              </Link>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>

                {/* Right Icons: Search, Cart, Account */}
                <div className="justify-self-end flex items-center">
                  {/* Search Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Search"
                    className="w-[23px] h-[23px] flex items-center justify-center mr-[2rem] text-black hover:text-[#729855] transition-colors cursor-pointer bg-transparent border-0 p-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="23"
                      height="23"
                      viewBox="0 0 23 23"
                      fill="none"
                      className="w-[2rem] h-[2rem]"
                    >
                      <g>
                        <path
                          d="M22.7397 19.4379L15.7356 12.4338C16.4288 11.186 16.7918 9.78183 16.7918 8.34433V8.34426C16.7886 3.68913 13.0027 -0.1 8.34433 -0.1C3.68596 -0.1 -0.1 3.68913 -0.1 8.34433C-0.1 12.9996 3.6891 16.7887 8.34433 16.7887C9.78183 16.7887 11.186 16.4256 12.4338 15.7324L19.4379 22.7366C19.672 22.9707 19.9816 23.1 20.3143 23.1C20.647 23.1 20.9566 22.9707 21.1907 22.7366L22.7366 21.1907C22.9707 20.9566 23.1 20.647 23.1 20.3143C23.1 20.0572 23.0228 19.8139 22.8797 19.6086H22.9104L22.7397 19.4379ZM0.915071 8.32872V7.96869C1.11141 4.04117 4.36897 0.905703 8.34433 0.905703C12.4457 0.905703 15.783 4.24301 15.783 8.34433C15.783 9.73099 15.3978 11.0866 14.6708 12.2573C14.6335 12.3165 14.5964 12.3751 14.5564 12.4367C14.3993 12.6739 14.2268 12.9048 14.0422 13.1234L14.0421 13.1233L14.0396 13.1265C14.0309 13.1377 14.0212 13.1487 14.0092 13.1624L14.0084 13.1632C13.9978 13.1753 13.9852 13.1896 13.973 13.205C13.9616 13.2179 13.9526 13.2286 13.9445 13.2381C13.9315 13.2535 13.921 13.2659 13.9073 13.2796L13.9072 13.2795L13.9036 13.2835C13.7124 13.4963 13.5088 13.6999 13.296 13.8911L13.2816 13.9038C13.2331 13.9466 13.1842 13.9898 13.1379 14.028C13.123 14.0396 13.109 14.0511 13.0962 14.0616C13.0828 14.0727 13.0706 14.0827 13.0578 14.0927L13.0557 14.0944C12.9169 14.2085 12.7725 14.3191 12.6254 14.4202C12.5659 14.4609 12.5076 14.5008 12.4464 14.5406L12.4454 14.5412C12.3982 14.5727 12.3534 14.6026 12.3089 14.6293L12.3086 14.6288L12.3004 14.635C12.3004 14.635 12.2991 14.6358 12.2915 14.6401L12.2903 14.6407C12.2848 14.6438 12.2745 14.6495 12.2641 14.6568C11.0908 15.3828 9.73924 15.7673 8.3537 15.7673C4.25238 15.7673 0.915071 12.43 0.915071 8.32872ZM14.8013 13.789C14.9309 13.6355 15.0536 13.4758 15.171 13.3138L22.0174 20.1602C22.0609 20.2037 22.0849 20.2625 22.0849 20.3237C22.0849 20.3849 22.0609 20.4437 22.0174 20.4872L22.0188 20.4889L20.481 22.0268C20.3888 22.1189 20.2429 22.1189 20.1508 22.0268L13.3047 15.1806C13.4516 15.0741 13.5959 14.9616 13.736 14.8449L13.7362 14.8452L13.7427 14.8388C13.7438 14.8377 13.7458 14.836 13.7537 14.8299L13.7547 14.829C13.7604 14.8246 13.7701 14.8171 13.7797 14.8079C13.809 14.7832 13.8383 14.7578 13.8669 14.733L13.8671 14.7327C13.8969 14.7069 13.926 14.6816 13.955 14.6572L13.9575 14.655L14.0043 14.6129L14.0511 14.5707L14.0518 14.5701C14.2032 14.4313 14.3487 14.289 14.4881 14.1402C14.515 14.1116 14.5411 14.0832 14.5667 14.0553L14.567 14.0549C14.5928 14.0268 14.6181 13.9992 14.6441 13.9717L14.6473 13.9681C14.685 13.9241 14.7212 13.8819 14.7573 13.8428L14.7574 13.843L14.7619 13.8375L14.7815 13.8134L14.8013 13.789Z"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="0.2"
                        />
                        <path
                          d="M13.9312 9.00955C14.2081 9.00955 14.434 8.78365 14.434 8.50669C14.434 5.035 11.6099 2.21403 8.14138 2.21403C7.86442 2.21403 7.63853 2.43992 7.63853 2.71688C7.63853 2.99383 7.86442 3.21973 8.14138 3.21973C11.056 3.21973 13.4283 5.59206 13.4283 8.50669C13.4283 8.78365 13.6542 9.00955 13.9312 9.00955Z"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="0.2"
                        />
                      </g>
                    </svg>
                  </button>

                  {/* Cart Icon */}
                  <Link
                    to="/cart"
                    aria-label="Cart"
                    className="relative w-[2.3rem] h-[2.3rem] flex items-center justify-center xl:mr-[2rem] text-black hover:text-[#2f3e10] transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      version="1.0"
                      viewBox="0 0 22.000000 25.000000"
                      preserveAspectRatio="xMidYMid meet"
                      className="w-[2rem] h-[2rem]"
                    >
                      <g
                        transform="translate(0.000000,25.000000) scale(0.100000,-0.100000)"
                        fill="currentColor"
                        stroke="none"
                      >
                        <path d="M77 234 c-4 -4 -7 -16 -7 -26 0 -10 -7 -18 -15 -18 -22 0 -33 -28 -40 -108 l-8 -72 96 0 c53 0 98 4 101 8 2 4 0 43 -6 86 -9 58 -16 80 -28 83 -9 2 -20 14 -25 26 -10 22 -54 35 -68 21z m51 -27 c3 -12 -3 -17 -22 -17 -25 0 -35 18 -19 34 12 12 38 2 41 -17z m-57 -44 c1 -17 2 -17 6 0 6 21 53 24 53 2 0 -8 5 -15 10 -15 6 0 10 7 10 15 0 16 15 21 24 7 2 -4 8 -40 11 -80 l8 -72 -88 0 -87 0 6 47 c14 97 18 113 32 113 8 0 15 -8 15 -17z" />
                      </g>
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-[0.1rem] -right-[0.3rem] bg-black text-white w-[1.4rem] h-[1.4rem] rounded-full flex items-center justify-center text-[1rem] font-medium leading-[1.6rem]">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {/* Account Icon (visible >= 1220px) */}
                  <button
                    type="button"
                    onClick={() => setIsLoginOpen(true)}
                    aria-label="Log in"
                    className="hidden xl:flex w-[2.3rem] h-[2.3rem] items-center justify-center text-black hover:text-[#2f3e10] transition-colors bg-transparent border-0 p-0 cursor-pointer"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 28 28"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-[2rem] h-[2rem]"
                    >
                      <path
                        d="M14 15.1429C17.6293 15.1429 20.5714 12.2007 20.5714 8.57143C20.5714 4.94213 17.6293 2 14 2C10.3707 2 7.42859 4.94213 7.42859 8.57143C7.42859 12.2007 10.3707 15.1429 14 15.1429Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2 26C2 19.9984 5.18545 15.1428 11.8182 15.1428H16.1818C22.8145 15.1428 26 19.9984 26 26"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-[calc(100vw-6rem)] max-w-[40rem] bg-white z-50 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between px-[3.2rem] py-[2rem] border-b border-black/[0.06]">
                <span className="font-heading text-[1.8rem] font-medium text-black">Menu</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close"
                  className="dt-close-x"
                />
              </div>
              <nav className="mt-[2rem] overflow-y-auto">
                <ul className="list-none m-0 p-0">
                  {navigationLinks.map((item) => {
                    const isActive =
                      item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path);
                    return (
                      <li key={item.id} className="mb-[0.2rem]">
                        <Link
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block py-[1.1rem] px-[3.2rem] text-[1.4rem] font-body capitalize transition-colors ${
                            isActive
                              ? 'bg-black/[0.04] text-black font-medium'
                              : 'text-black hover:bg-black/[0.04]'
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Utility Links at bottom of Drawer */}
            <div className="p-[2rem] bg-black/[0.03] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginOpen(true);
                }}
                className="inline-flex items-center text-[1.4rem] text-black bg-transparent border-0 p-0 cursor-pointer"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-[2rem] h-[2rem] mr-[1rem]"
                >
                  <path
                    d="M14 15.1429C17.6293 15.1429 20.5714 12.2007 20.5714 8.57143C20.5714 4.94213 17.6293 2 14 2C10.3707 2 7.42859 4.94213 7.42859 8.57143C7.42859 12.2007 10.3707 15.1429 14 15.1429Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 26C2 19.9984 5.18545 15.1428 11.8182 15.1428H16.1818C22.8145 15.1428 26 19.9984 26 26"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Log in
              </button>
              <ul className="flex items-center list-none m-0 p-0 gap-[1.5rem]">
                <li>
                  <a
                    href="https://www.facebook.com/leafinlife.healthcare.9/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-black hover:text-[#729855]"
                    aria-label="FB"
                  >
                    <svg className="w-[1.8rem] h-[1.8rem]" viewBox="0 0 513.2 513.2" fill="currentColor">
                      <path d="M375.5,288.6l14.3-93h-89.2v-60c0-25.3,12.4-50,52.1-50h40.9V6.8c0,0-36.7-6.3-71.8-6.3c-73.3,0-121.2,44.4-121.2,124.7v70.4h-81v93h81v224h100v-224H375.5z" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/leafinlife_healthcare/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-black hover:text-[#729855]"
                    aria-label="IN"
                  >
                    <svg className="w-[1.8rem] h-[1.8rem]" viewBox="0 0 18 18" fill="currentColor">
                      <path d="M8.77 1.58c2.34 0 2.62.01 3.54.05.86.04 1.32.18 1.63.3.41.17.7.35 1.01.66.3.3.5.6.65 1 .12.32.27.78.3 1.64.05.92.06 1.2.06 3.54s-.01 2.62-.05 3.54a4.79 4.79 0 01-.3 1.63c-.17.41-.35.7-.66 1.01-.3.3-.6.5-1.01.66-.31.12-.77.26-1.63.3-.92.04-1.2.05-3.54.05s-2.62 0-3.55-.05a4.79 4.79 0 01-1.62-.3c-.42-.16-.7-.35-1.01-.66-.31-.3-.5-.6-.66-1a4.87 4.87 0 01-.3-1.64c-.04-.92-.05-1.2-.05-3.54s0-2.62.05-3.54c.04-.86.18-1.32.3-1.63.16-.41.35-.7.66-1.01.3-.3.6-.5 1-.65.32-.12.78-.27 1.63-.3.93-.05 1.2-.06 3.55-.06zm0-1.58C6.39 0 6.09.01 5.15.05c-.93.04-1.57.2-2.13.4-.57.23-1.06.54-1.55 1.02C1 1.96.7 2.45.46 3.02c-.22.56-.37 1.2-.4 2.13C0 6.1 0 6.4 0 8.77s.01 2.68.05 3.61c.04.94.2 1.57.4 2.13.23.58.54 1.07 1.02 1.56.49.48.98.78 1.55 1.01.56.22 1.2.37 2.13.4.94.05 1.24.06 3.62.06 2.39 0 2.68-.01 3.62-.05.93-.04 1.57-.2 2.13-.41a4.27 4.27 0 001.55-1.01c.49-.49.79-.98 1.01-1.56.22-.55.37-1.19.41-2.13.04-.93.05-1.23.05-3.61 0-2.39 0-2.68-.05-3.62a6.47 6.47 0 00-.4-2.13 4.27 4.27 0 00-1.02-1.55A4.35 4.35 0 0014.52.46a6.43 6.43 0 00-2.13-.41A69 69 0 008.77 0z" />
                      <path d="M8.8 4a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.43a2.92 2.92 0 110-5.85 2.92 2.92 0 010 5.85zM13.43 5a1.05 1.05 0 100-2.1 1.05 1.05 0 000 2.1z" />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/@leafinlifehealthcare"
                    target="_blank"
                    rel="noreferrer"
                    className="text-black hover:text-[#729855]"
                    aria-label="YouTube"
                  >
                    <svg className="w-[1.8rem] h-[1.8rem]" viewBox="0 0 100 70" fill="currentColor">
                      <path d="M98 11c2 7.7 2 24 2 24s0 16.3-2 24a12.5 12.5 0 01-9 9c-7.7 2-39 2-39 2s-31.3 0-39-2a12.5 12.5 0 01-9-9c-2-7.7-2-24-2-24s0-16.3 2-24c1.2-4.4 4.6-7.8 9-9 7.7-2 39-2 39-2s31.3 0 39 2c4.4 1.2 7.8 4.6 9 9zM40 50l26-15-26-15v30z" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

