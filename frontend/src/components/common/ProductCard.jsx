import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export default function ProductCard({
  product,
  aspectRatio = '125%',
  showVendor = false,
  viewMode = 'grid',
}) {
  const { setQuickViewProduct, toggleWishlist, isInWishlist } = useStore();
  const [selectedVariant, setSelectedVariant] = useState(() => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.find((v) => v.active) || product.variants[0];
    }
    return null;
  });
  const [hoverImageOverride, setHoverImageOverride] = useState(null);

  const wishlisted = isInWishlist(product._id);

  const displayPrimaryImage = hoverImageOverride || product.primaryImage;
  const displayPrice = selectedVariant
    ? (selectedVariant.formattedPrice || `Rs. ${Number(selectedVariant.price).toFixed(2)}`)
    : (product.formattedPrice || `Rs. ${Number(product.price).toFixed(2)}`);

  const rawSellingPrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);
  const rawComparePrice = selectedVariant
    ? (selectedVariant.comparePrice || selectedVariant.originalPrice)
    : (product.comparePrice || product.originalPrice);

  const hasDiscount = rawComparePrice && Number(rawComparePrice) > rawSellingPrice;
  const displayComparePrice = hasDiscount
    ? (selectedVariant?.formattedComparePrice || product.formattedComparePrice || `Rs. ${Number(rawComparePrice).toFixed(2)}`)
    : null;

  const discountPercent = hasDiscount
    ? Math.round(((Number(rawComparePrice) - rawSellingPrice) / Number(rawComparePrice)) * 100)
    : null;

  const handleVariantClick = (e, variant) => {
    e.preventDefault();
    setSelectedVariant(variant);
    if (variant.image) {
      setHoverImageOverride(variant.image);
    }
  };

  const isListView = viewMode === 'list';

  return (
    <div
      className={`card-wrapper group relative h-full ${isListView
          ? 'grid grid-cols-1 min-[481px]:grid-cols-[1fr_1.5fr] lg:grid-cols-[1fr_4fr] items-center text-left gap-[2rem]'
          : 'flex flex-col text-center'
        }`}
    >
      {/* Media Box */}
      <div
        className="relative w-full overflow-hidden bg-white"
        style={{ paddingBottom: aspectRatio }}
      >
        <Link to={product.url} className="block absolute inset-0">
          <div className="relative w-full h-full overflow-hidden">
            {/* Primary Image */}
            <img
              src={displayPrimaryImage}
              alt={product.title}
              loading="lazy"
              className={`w-full h-full object-cover object-center transition-all duration-500 ${product.secondaryImage ? 'group-hover:opacity-0' : 'group-hover:scale-110'
                }`}
            />

            {/* Secondary Hover Image */}
            {product.secondaryImage && (
              <img
                src={product.secondaryImage}
                alt={product.title}
                loading="lazy"
                className="w-full h-full object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500"
              />
            )}
          </div>
        </Link>

        {/* Right-Aligned Hover Action Icons (Quick buy + Wishlist) */}
        <ul className="list-none m-0 p-0 absolute top-[10px] right-0 group-hover:right-[10px] opacity-0 group-hover:opacity-100 flex flex-col justify-center z-10 transition-all duration-300 pointer-events-none">
          {/* Quick View / Quick Buy Icon */}
          <li className="m-[3px] sm:m-[5px] relative pointer-events-auto group/icon hidden sm:block">
            <button
              type="button"
              onClick={() => setQuickViewProduct(product)}
              aria-label={`Choose options for ${product.title}`}
              className="w-[30px] h-[30px] rounded-full group-hover/icon:rounded-none bg-white text-black hover:text-[#2f3e10] grid place-items-center border-0 cursor-pointer shadow-sm transition-all p-0"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="currentColor"
              >
                <path d="M9,12.5c1,0,1.8-0.3,2.5-1c0.7-0.7,1-1.5,1-2.5s-0.3-1.8-1-2.5c-0.7-0.7-1.5-1-2.5-1s-1.8,0.3-2.5,1S5.5,8,5.5,9s0.3,1.8,1,2.5C7.2,12.1,8,12.5,9,12.5z M9,11.1c-0.6,0-1.1-0.2-1.5-0.6C7.1,10.1,6.9,9.6,6.9,9s0.2-1.1,0.6-1.5S8.4,6.9,9,6.9s1.1,0.2,1.5,0.6c0.4,0.4,0.6,0.9,0.6,1.5s-0.2,1.1-0.6,1.5C10.1,10.9,9.6,11.1,9,11.1z M9,14.8c-1.9,0-3.6-0.5-5.1-1.6S1.2,10.8,0.5,9c0.7-1.8,1.8-3.2,3.4-4.2S7.1,3.2,9,3.2s3.6,0.5,5.1,1.6s2.7,2.5,3.4,4.2c-0.7,1.8-1.8-3.2-3.4,4.2S10.9,14.8,9,14.8z M9,13.3c1.5,0,2.8-0.4,4-1.1c1.2-0.8,2.1-1.8,2.8-3.1c-0.6-1.3-1.6-2.3-2.8-3.1s-2.6-1.1-4-1.1S6.2,5.1,5,5.9S2.8,7.7,2.2,9c0.6,1.3,1.6,2.3,2.8,3.1C6.2,12.9,7.5,13.3,9,13.3z" />
              </svg>
            </button>
            {/* Tooltip */}
            <span className="hidden md:block pointer-events-none opacity-0 group-hover/icon:opacity-100 absolute right-full top-1/2 -translate-y-1/2 mr-[8px] px-[10px] py-[6px] bg-white text-black text-[1.2rem] font-medium uppercase whitespace-nowrap shadow-[0_2px_8px_#63636333] transition-all">
              Quick buy
            </span>
          </li>

          {/* Wishlist Icon */}
          <li className="m-[3px] sm:m-[5px] relative pointer-events-auto group/wish">
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              aria-label="wishlist"
              className={`w-[30px] h-[30px] rounded-full group-hover/wish:rounded-none bg-white grid place-items-center border-0 cursor-pointer shadow-sm transition-all p-0 ${wishlisted ? 'text-[#586c38]' : 'text-black hover:text-[#2f3e10]'
                }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={wishlisted ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <span className="hidden md:block pointer-events-none opacity-0 group-hover/wish:opacity-100 absolute right-full top-1/2 -translate-y-1/2 mr-[8px] px-[10px] py-[6px] bg-white text-black text-[1.2rem] font-medium uppercase whitespace-nowrap shadow-[0_2px_8px_#63636333] transition-all">
              wishlist
            </span>
          </li>
        </ul>
      </div>

      {/* Card Content Below / Beside Image */}
      <div
        className={`pt-[1.5rem] flex flex-col flex-grow ${isListView
            ? 'min-[481px]:pt-0 min-[481px]:pl-[1.5rem] lg:pl-[3rem] items-start text-left'
            : 'items-center text-center'
          }`}
      >
        <div className="w-full">
          {showVendor && (
            <div className="text-[1rem] tracking-[0.13rem] uppercase text-black/70 mb-[0.6rem] font-body">
              {product.vendor || 'Leaf In Life'}
            </div>
          )}

          <h3 className="m-0 mb-[1rem] font-heading text-[1.8rem] sm:text-[2rem] font-medium capitalize text-black">
            <Link
              to={product.url}
              className="text-black hover:text-[#729855] transition-colors no-underline"
            >
              {product.title}
            </Link>
          </h3>

          {/* Price */}
          <div className="mb-[1rem] font-body text-[1.6rem] sm:text-[1.8rem] flex items-center justify-center flex-wrap gap-[0.8rem]">
            <span className="font-medium text-black">{displayPrice}</span>
            {displayComparePrice && (
              <span className="text-[1.4rem] sm:text-[1.5rem] text-stone-400 line-through font-normal">
                {displayComparePrice}
              </span>
            )}
            {discountPercent && (
              <span className="inline-block px-[6px] py-[1px] text-[1.1rem] font-bold rounded bg-[#fef9ea] text-[#586c38] border border-[#586c38]/30">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* List View Description Excerpt */}
          {isListView && product.description && (
            <p className="m-0 mb-[1.2rem] text-[1.5rem] leading-[1.6] text-black/75 font-light max-w-[75ch]">
              {product.description}
            </p>
          )}
        </div>

        {/* Size Variant Swatches (if product has variants) */}
        {product.variants && product.variants.length > 0 && (
          <ul
            className={`flex flex-wrap items-center list-none m-0 mt-[10px] p-0 ${isListView ? 'justify-start' : 'justify-center'
              }`}
          >
            {product.variants.map((variant) => {
              const isSelected = selectedVariant?.id === variant.id;
              return (
                <li key={variant.id} className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => handleVariantClick(e, variant)}
                    className="m-[1px_5px_5px_0] p-0 bg-transparent border border-transparent cursor-pointer"
                  >
                    <span
                      className={`inline-flex items-center justify-center min-w-[20px] min-h-[20px] px-[6px] py-[2px] text-[1.4rem] border border-[#f7e9e3] transition-all duration-300 ${isSelected
                          ? 'bg-black text-white'
                          : 'bg-transparent text-black hover:bg-black hover:text-white'
                        }`}
                    >
                      {variant.size}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

