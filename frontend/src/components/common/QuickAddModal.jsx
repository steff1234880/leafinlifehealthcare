import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export default function QuickAddModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart } = useStore();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (quickViewProduct) {
      const defaultVar =
        quickViewProduct.variants && quickViewProduct.variants.length > 0
          ? quickViewProduct.variants.find((v) => v.available) ||
            quickViewProduct.variants[0]
          : null;
      setSelectedVariant(defaultVar);
      setQuantity(1);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const currentPrice = selectedVariant
    ? selectedVariant.formattedPrice
    : quickViewProduct.formattedPrice;

  const currentImage =
    selectedVariant && selectedVariant.image
      ? selectedVariant.image
      : quickViewProduct.primaryImage;

  const isAvailable = selectedVariant ? selectedVariant.available : quickViewProduct.inStock;

  const handleAdd = () => {
    if (!isAvailable) return;
    addToCart(quickViewProduct, selectedVariant, quantity);
    setQuickViewProduct(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-[15px]"
      role="dialog"
      aria-modal="true"
      aria-label={`Choose options for ${quickViewProduct.title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) setQuickViewProduct(null);
      }}
    >
      <div className="relative bg-white w-full max-w-[900px] max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setQuickViewProduct(null)}
          aria-label="Close"
          className="dt-close-x !absolute top-[1.5rem] right-[1.5rem] md:top-[2rem] md:right-[2rem] z-10"
        />

        {/* Left Product Media */}
        <div className="bg-white flex items-center justify-center p-[20px]">
          <img
            src={currentImage}
            alt={quickViewProduct.title}
            className="w-full max-h-[420px] object-contain"
          />
        </div>

        {/* Right Product Info */}
        <div className="p-[20px] md:py-[50px] md:px-[30px] flex flex-col justify-center">
          <Link
            to={quickViewProduct.url}
            onClick={() => setQuickViewProduct(null)}
            className="no-underline group"
          >
            <h2 className="m-0 font-heading text-[22px] xl:text-[30px] font-medium text-black group-hover:text-[#2f3e10] transition-colors">
              {quickViewProduct.title}
            </h2>
          </Link>

          <div className="mt-[1.2rem] mb-[1.6rem] text-[1.8rem] font-body font-light text-black">
            {currentPrice}
          </div>

          {quickViewProduct.description && (
            <p className="m-0 mb-[1.8rem] text-[1.5rem] leading-[1.6] text-black/80">
              {quickViewProduct.description}
            </p>
          )}

          {/* Variants Selector */}
          {quickViewProduct.variants && quickViewProduct.variants.length > 0 && (
            <div className="mb-[2rem]">
              <label className="block text-[1.4rem] font-medium text-black mb-[0.8rem]">
                Size: <span className="font-normal">{selectedVariant?.size}</span>
              </label>
              <div className="flex flex-wrap gap-[8px]">
                {quickViewProduct.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`px-[12px] py-[6px] text-[1.4rem] border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-[#f7e9e3] hover:bg-black hover:text-white'
                      } ${!v.available ? 'opacity-50 line-through' : ''}`}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-[2rem]">
            <label className="block text-[1.4rem] font-medium text-black mb-[0.8rem]">
              Quantity
            </label>
            <div className="inline-flex items-center border border-black/15 h-[4rem] w-[13.4rem]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-[4.5rem] h-full flex items-center justify-center text-[1.8rem] text-black hover:bg-black hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
              >
                &minus;
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full h-full text-center text-[1.4rem] font-medium border-x border-black/15 outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-[4.5rem] h-full flex items-center justify-center text-[1.8rem] text-black hover:bg-black hover:text-white transition-colors bg-transparent border-0 cursor-pointer"
              >
                &#43;
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-[12px]">
            <button
              type="button"
              disabled={!isAvailable}
              onClick={handleAdd}
              className="lil-button lil-button-pill w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAvailable ? 'Add cart' : 'Sold out'}
            </button>

            <Link
              to={quickViewProduct.url}
              onClick={() => setQuickViewProduct(null)}
              className="mt-[0.8rem] inline-block text-[1.2rem] tracking-[1.6px] font-semibold uppercase underline underline-offset-[0.3rem] text-black hover:text-[#2f3e10]"
            >
              View full details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

