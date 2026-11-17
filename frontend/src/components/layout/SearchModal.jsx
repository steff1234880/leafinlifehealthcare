import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { popularSearchTags } from '../../data/homeData';
import { productService } from '../../services/api';
import { useStore } from '../../context/StoreContext';

export default function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  if (!isSearchOpen) return null;

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 1) {
      const matched = await productService.searchProducts(val);
      setResults(matched);
    } else {
      setResults([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSearchOpen(false);
    navigate(`/collections/all?q=${encodeURIComponent(query)}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setIsSearchOpen(false)}
      />
      <div className="relative z-10 bg-white w-full border-b border-black/[0.08] py-[3rem] px-[1.5rem] md:px-[6rem] flex flex-col items-center">
        <div className="w-full max-w-[55rem] relative flex items-center">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative flex items-center w-full">
              <input
                type="search"
                value={query}
                onChange={handleSearchChange}
                placeholder="Search"
                autoFocus
                className="w-full h-[5rem] pl-[1.5rem] pr-[5rem] text-[1.4rem] font-body text-black bg-white border border-black/20 focus:border-black outline-none"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-[1.2rem] top-1/2 -translate-y-1/2 text-black hover:text-[#729855] bg-transparent border-0 cursor-pointer p-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 23 23"
                  fill="none"
                >
                  <path
                    d="M22.7397 19.4379L15.7356 12.4338C16.4288 11.186 16.7918 9.78183 16.7918 8.34433V8.34426C16.7886 3.68913 13.0027 -0.1 8.34433 -0.1C3.68596 -0.1 -0.1 3.68913 -0.1 8.34433C-0.1 12.9996 3.6891 16.7887 8.34433 16.7887C9.78183 16.7887 11.186 16.4256 12.4338 15.7324L19.4379 22.7366C19.672 22.9707 19.9816 23.1 20.3143 23.1C20.647 23.1 20.9566 22.9707 21.1907 22.7366L22.7366 21.1907C22.9707 20.9566 23.1 20.647 23.1 20.3143C23.1 20.0572 23.0228 19.8139 22.8797 19.6086H22.9104L22.7397 19.4379ZM0.915071 8.32872V7.96869C1.11141 4.04117 4.36897 0.905703 8.34433 0.905703C12.4457 0.905703 15.783 4.24301 15.783 8.34433C15.783 9.73099 15.3978 11.0866 14.6708 12.2573C14.6335 12.3165 14.5964 12.3751 14.5564 12.4367C14.3993 12.6739 14.2268 12.9048 14.0422 13.1234L14.0396 13.1265C14.0309 13.1377 14.0212 13.1487 14.0092 13.1624L14.0084 13.1632C13.9978 13.1753 13.9852 13.1896 13.973 13.205C13.9616 13.2179 13.9526 13.2286 13.9445 13.2381C13.9315 13.2535 13.921 13.2659 13.9073 13.2796L13.9036 13.2835C13.7124 13.4963 13.5088 13.6999 13.296 13.8911L13.2816 13.9038C13.2331 13.9466 13.1842 13.9898 13.1379 14.028C13.123 14.0396 13.109 14.0511 13.0962 14.0616C13.0828 14.0727 13.0706 14.0827 13.0578 14.0927L13.0557 14.0944C12.9169 14.2085 12.7725 14.3191 12.6254 14.4202C12.5659 14.4609 12.5076 14.5008 12.4464 14.5406L12.4454 14.5412C12.3982 14.5727 12.3534 14.6026 12.3089 14.6293L12.3004 14.635L12.2915 14.6401L12.2903 14.6407C12.2848 14.6438 12.2745 14.6495 12.2641 14.6568C11.0908 15.3828 9.73924 15.7673 8.3537 15.7673C4.25238 15.7673 0.915071 12.43 0.915071 8.32872Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>

            {/* Popular Searches */}
            <ul className="flex flex-wrap items-center gap-[1rem] list-none m-0 mt-[1.2rem] p-0 text-[1.3rem] text-black/80">
              <li className="font-medium">Popular searches:</li>
              {popularSearchTags.map((tag) => (
                <li key={tag.query}>
                  <Link
                    to={`/collections/all?q=${encodeURIComponent(tag.query)}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="underline hover:text-[#729855] transition-colors"
                  >
                    <span>{tag.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </form>

          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close"
            className="dt-close-x ml-[2rem] shrink-0"
          />
        </div>

        {/* Predictive Search Results */}
        {results.length > 0 && (
          <div className="w-full max-w-[55rem] mt-[2rem] border-t border-black/10 pt-[1.5rem] grid grid-cols-1 sm:grid-cols-2 gap-[1.5rem]">
            {results.map((prod) => (
              <Link
                key={prod._id}
                to={prod.url}
                onClick={() => setIsSearchOpen(false)}
                className="flex items-center gap-[1.2rem] p-[0.8rem] hover:bg-[#f9f9eb] transition-colors"
              >
                <img
                  src={prod.primaryImage}
                  alt={prod.title}
                  className="w-[5.5rem] h-[5.5rem] object-cover"
                />
                <div>
                  <h4 className="m-0 text-[1.5rem] font-heading font-medium text-black hover:text-[#729855]">
                    {prod.title}
                  </h4>
                  <span className="text-[1.4rem] text-black/75">{prod.formattedPrice}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

