import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export default function CartNotification() {
  const {
    isCartNotificationOpen,
    setIsCartNotificationOpen,
    lastAddedItem,
    cartCount,
  } = useStore();

  if (!isCartNotificationOpen || !lastAddedItem) return null;

  return (
    <div className="fixed top-[85px] right-[20px] z-50 w-[calc(100vw-40px)] max-w-[380px] bg-white border border-[#f7e9e3] shadow-[0_8px_30px_rgba(0,0,0,0.15)] p-[20px] animate-fadeIn">
      <div className="flex items-center justify-between mb-[14px]">
        <div className="flex items-center gap-[8px] text-[1.4rem] text-[#586c38] font-medium">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Item added to your cart</span>
        </div>
        <button
          type="button"
          onClick={() => setIsCartNotificationOpen(false)}
          aria-label="Close"
          className="dt-close-x"
        />
      </div>

      <div className="flex items-center gap-[15px] py-[12px] border-t border-b border-black/[0.08]">
        <img
          src={lastAddedItem.image}
          alt={lastAddedItem.title}
          className="w-[70px] h-[70px] object-cover shrink-0"
        />
        <div>
          <h4 className="m-0 font-heading text-[1.6rem] font-medium text-black">
            {lastAddedItem.title}
          </h4>
          {lastAddedItem.variant && (
            <p className="m-0 mt-[2px] text-[1.3rem] text-black/70">
              Size: {lastAddedItem.variant}
            </p>
          )}
          <p className="m-0 mt-[4px] text-[1.4rem] font-medium text-black">
            Rs. {Number(lastAddedItem.price).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-[16px] flex flex-col gap-[10px]">
        <Link
          to="/cart"
          onClick={() => setIsCartNotificationOpen(false)}
          className="w-full h-[44px] flex items-center justify-center border border-black text-black hover:bg-black hover:text-white font-heading text-[1.2rem] font-bold uppercase tracking-[2px] transition-colors"
        >
          View my cart ({cartCount})
        </Link>
        <button
          type="button"
          onClick={() => setIsCartNotificationOpen(false)}
          className="text-[1.3rem] underline text-black/80 hover:text-black bg-transparent border-0 cursor-pointer py-[4px]"
        >
          Continue shopping
        </button>
      </div>
    </div>
  );
}

