import React, { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 800) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <a
      id="to-top"
      href="#ayurvedic-medicine-manufacturers-in-kerala"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`group fixed right-[10px] w-[50px] h-[50px] rounded-full bg-black text-white text-center leading-[50px] z-30 overflow-hidden transition-all duration-700 hover:scale-110 hover:shadow-[0_10px_5px_rgba(0,0,0,0.1)] ${
        visible
          ? 'bottom-[70px] md:bottom-[20px] opacity-100'
          : '-bottom-[50px] opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 transition-all duration-300 group-hover:-translate-y-[150%] group-hover:opacity-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="10"
          viewBox="0 0 10.511 8.19"
          className="fill-white -rotate-90 mx-auto"
        >
          <path d="M10.449,4.407l0-.01a.8.8,0,0,0,.042-.142s0-.005,0-.008a.792.792,0,0,0,0-.3s0-.005,0-.008a.81.81,0,0,0-.042-.142l0-.01a.816.816,0,0,0-.07-.133l0-.008a.825.825,0,0,0-.1-.127L6.995.24A.819.819,0,1,0,5.836,1.4L7.714,3.276H.819a.819.819,0,0,0,0,1.638h6.9L5.836,6.792A.819.819,0,1,0,6.995,7.951L10.27,4.676a.821.821,0,0,0,.1-.127l0-.008a.816.816,0,0,0,.07-.133" />
        </svg>
      </div>
      <div className="text-[0.8rem] leading-[10px] uppercase font-semibold absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-1/2 opacity-0 transition-all duration-300 group-hover:-translate-y-1/2 group-hover:opacity-100">
        Back to top
      </div>
    </a>
  );
}

