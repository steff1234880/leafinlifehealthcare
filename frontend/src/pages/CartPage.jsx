import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import { useStore } from '../context/StoreContext';
import { productService, cartService } from '../services/api';
import { initialProducts } from '../data/homeData';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    updateCartItemQuantity,
    removeFromCart,
    syncCartPrices,
    setIsLoginOpen,
  } = useStore();

  const [recommendedProducts, setRecommendedProducts] = useState(initialProducts.slice(0, 4));
  const [discountInput, setDiscountInput] = useState(() => {
    try {
      return localStorage.getItem('coupon') || '';
    } catch {
      return '';
    }
  });
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [orderNoteOpen, setOrderNoteOpen] = useState(false);
  const [orderNote, setOrderNote] = useState(() => {
    try {
      return localStorage.getItem('leafinlife_order_note') || '';
    } catch {
      return '';
    }
  });

  // Fetch latest product catalog & pricing from custom backend API and synchronize cart items
  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    productService.getProducts({ sort: 'best-selling' }).then((productsData) => {
      if (!isMounted) return;
      const list = Array.isArray(productsData) && productsData.length > 0 ? productsData : initialProducts;
      syncCartPrices(list);

      // Filter out items already in cart for the "You may also like" ProductCard section
      const cartIds = new Set(cart.map((c) => c.productId));
      const filteredRecs = list.filter((p) => !cartIds.has(p._id));
      setRecommendedProducts(
        (filteredRecs.length >= 4 ? filteredRecs : list).slice(0, 4)
      );
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Recompute discount amount whenever cartSubtotal changes
  useEffect(() => {
    if (appliedDiscount && cartSubtotal > 0) {
      cartService
        .validateDiscount(appliedDiscount.code, cartSubtotal)
        .then((res) => {
          if (res && res.valid) {
            setAppliedDiscount(res);
          }
        });
    } else if (cartSubtotal === 0) {
      setAppliedDiscount(null);
    }
  }, [cartSubtotal]);

  // Persist order note
  const handleNoteChange = (val) => {
    setOrderNote(val);
    try {
      localStorage.setItem('leafinlife_order_note', val);
    } catch {
      // ignore storage error
    }
  };

  // Apply discount code
  const handleApplyDiscount = async (e) => {
    if (e) e.preventDefault();
    setDiscountError('');
    const code = discountInput.trim();
    if (!code) {
      setDiscountError('Please enter a discount code.');
      return;
    }

    const res = await cartService.validateDiscount(code, cartSubtotal);
    if (!res || !res.valid) {
      setAppliedDiscount(null);
      setDiscountError(res?.message || 'Invalid discount code.');
      return;
    }

    setAppliedDiscount(res);
    try {
      localStorage.setItem('coupon', res.code);
    } catch {
      // ignore storage error
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountInput('');
    setDiscountError('');
    try {
      localStorage.removeItem('coupon');
    } catch {
      // ignore
    }
  };

  const discountAmount = appliedDiscount ? Number(appliedDiscount.discountAmount) || 0 : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    const query = appliedDiscount ? `?discount=${encodeURIComponent(appliedDiscount.code)}` : '';
    navigate(`/checkout${query}`);
  };

  const isEmpty = cart.length === 0;

  return (
    <main
      id="MainContent"
      className="content-for-layout focus-none placeholder-shadow-blocks"
      role="main"
      tabIndex="-1"
    >
      {/* 1. Breadcrumb Banner Section (matches exact `cart.html` breadcrumb section) */}
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
              aria-label="breadcrumbs cart"
            >
              <h1 className="breadcrumb_title m-0 mb-[1rem] font-heading text-[2.6rem] min-[577px]:text-[3.4rem] xl:text-[4rem] font-medium capitalize text-black leading-[1.3]">
                Your Shopping Cart
              </h1>

              <div className="flex flex-wrap items-center justify-center mt-[0.5rem] text-[1.2rem] tracking-[3px] uppercase font-medium text-black">
                <Link
                  to="/"
                  title="Back to the frontpage"
                  className="px-[5px] md:px-[2rem] text-black hover:text-[#2f3e10] transition-colors no-underline"
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
                    <path
                      d="M1.32812 0.460227V14.8125H0.18608V0.460227H1.32812Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>

                <span className="px-[5px] md:px-[2rem] text-black">Your Shopping Cart</span>
              </div>
            </nav>
          </div>
        </div>
      </section>

      {/* 2. Cart Items & Cart Footer Section (`.page-width` max-width 1200px as in `cart.html`) */}
      <section className="max-w-[1200px] mx-auto px-[1.5rem] sm:px-[3rem] pt-[60px] pb-[40px] md:pt-[80px] md:pb-[60px]">
        {isEmpty ? (
          /* Empty Cart State (`.cart__warnings`) */
          <div className="cart__warnings text-center py-[3rem] md:py-[5rem]">
            <h1 className="cart__empty-text m-0 mb-[2.5rem] md:mb-[3rem] font-heading text-[2.8rem] sm:text-[3.6rem] font-medium text-black">
              Your cart is empty
            </h1>

            <Link
              to="/collections/all"
              className="lil-button bg-[#586c38] hover:bg-[#2f3e10] text-white border-0 no-underline inline-flex items-center justify-center"
            >
              Continue shopping
            </Link>

            <h2 className="cart__login-title m-0 mt-[5.5rem] mb-[0.5rem] font-heading text-[2.2rem] sm:text-[2.4rem] font-medium text-black">
              Have an account?
            </h2>
            <p className="cart__login-paragraph m-0 mt-[0.8rem] text-[1.6rem] text-black/80">
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="bg-transparent border-0 p-0 text-[1.6rem] text-black underline hover:text-[#2f3e10] cursor-pointer font-body"
              >
                Log in
              </button>{' '}
              to check out faster.
            </p>
          </div>
        ) : (
          /* Active Cart Contents & Footer */
          <div>
            {/* Cart Items Table */}
            <div className="cart__items pb-[3rem] md:pb-[4rem] border-b border-black/[0.08]">
              <table className="cart-items w-full border-collapse">
                <thead className="border-b border-black/[0.08]">
                  <tr className="flex justify-between min-[861px]:table-row">
                    <th
                      colSpan="2"
                      scope="col"
                      className="text-left pb-[1.8rem] font-heading text-[1.6rem] sm:text-[1.8rem] font-bold uppercase tracking-[0.08rem] text-black/85 min-[861px]:w-[55%] lg:w-[60%]"
                    >
                      Product
                    </th>
                    <th
                      colSpan="1"
                      scope="col"
                      className="hidden min-[861px]:table-cell text-left pb-[1.8rem] font-heading text-[1.8rem] font-bold uppercase tracking-[0.08rem] text-black/85"
                    >
                      Quantity
                    </th>
                    <th
                      colSpan="1"
                      scope="col"
                      className="text-right pb-[1.8rem] font-heading text-[1.6rem] sm:text-[1.8rem] font-bold uppercase tracking-[0.08rem] text-black/85"
                    >
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-black/[0.06] min-[861px]:divide-y-0">
                  {cart.map((item) => {
                    const unitPrice = Number(item.price) || 0;
                    const lineTotal = unitPrice * (Number(item.quantity) || 1);
                    const productUrl = item.url || `/products/${item.slug}`;

                    return (
                      <tr
                        key={item.key}
                        className="cart-item flex flex-col min-[577px]:grid min-[577px]:grid-cols-[10rem_1fr_auto] min-[861px]:table-row py-[2.5rem] min-[861px]:py-0 items-center gap-[1.5rem]"
                      >
                        {/* 1. Product Image Cell */}
                        <td className="cart-item__media min-[861px]:pt-[4rem] min-[861px]:w-[10rem] min-[861px]:align-middle">
                          <Link
                            to={productUrl}
                            className="inline-flex items-start overflow-hidden border border-[#f7e9e3]"
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              loading="lazy"
                              className="cart-item__image w-[11rem] h-[11rem] min-[861px]:w-[10rem] min-[861px]:h-[10rem] object-cover object-center"
                            />
                          </Link>
                        </td>

                        {/* 2. Product Details Cell (Name, Unit Price, Selected Size Variant) */}
                        <td className="cart-item__details min-[861px]:pt-[4rem] min-[861px]:pl-[2rem] text-center min-[577px]:text-left min-[861px]:align-middle">
                          <Link
                            to={productUrl}
                            className="cart-item__name inline-block font-heading text-[1.8rem] font-semibold text-black hover:text-[#729855] transition-colors no-underline mb-[0.6rem]"
                          >
                            {item.title}
                          </Link>

                          <div className="cart-item__price-wrapper mb-[0.8rem]">
                            <span className="price font-body text-[1.6rem] font-normal text-black/85">
                              Rs. {unitPrice.toFixed(2)}
                            </span>
                          </div>

                          {item.variant && (
                            <dl className="m-0 flex flex-wrap justify-center min-[577px]:justify-start gap-[0.4rem] text-[1.4rem] text-black/80">
                              <div className="product-option">
                                <dt className="inline font-semibold">Size: </dt>
                                <dd className="inline m-0">{item.variant}</dd>
                              </div>
                            </dl>
                          )}

                          {/* Mobile/Tablet Quantity + Remove inside Details column (`< 861px`) */}
                          <div className="flex min-[861px]:hidden items-center justify-center min-[577px]:justify-start gap-[1.5rem] mt-[1.4rem]">
                            <div className="quantity inline-flex items-center h-[4rem] w-[12.8rem] border border-black/15 bg-white">
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.key, item.quantity - 1)}
                                aria-label={`Decrease quantity for ${item.title}`}
                                className="w-[4rem] h-full flex items-center justify-center bg-transparent border-0 text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-[1rem] h-[0.2rem]"
                                  fill="none"
                                  viewBox="0 0 10 2"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M.5 1C.5.7.7.5 1 .5h8a.5.5 0 110 1H1A.5.5 0 01.5 1z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateCartItemQuantity(
                                    item.key,
                                    Math.max(1, parseInt(e.target.value, 10) || 1)
                                  )
                                }
                                aria-label={`Quantity for ${item.title}`}
                                className="w-[4.8rem] h-full text-center text-[1.4rem] font-medium text-black border-x border-black/15 bg-transparent outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.key, item.quantity + 1)}
                                aria-label={`Increase quantity for ${item.title}`}
                                className="w-[4rem] h-full flex items-center justify-center bg-transparent border-0 text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-[1rem] h-[1rem]"
                                  fill="none"
                                  viewBox="0 0 10 10"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M1 4.51a.5.5 0 000 1h3.5l.01 3.5a.5.5 0 001-.01V5.5l3.5-.01a.5.5 0 00-.01-1H5.5L5.49.99a.5.5 0 00-1 .01v3.5l-3.5.01H1z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.key)}
                              aria-label={`Remove ${item.title}`}
                              title="Remove item"
                              className="w-[3.2rem] h-[3.2rem] flex items-center justify-center bg-transparent border-0 text-black hover:text-[#2f3e10] transition-colors cursor-pointer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                aria-hidden="true"
                                focusable="false"
                                role="presentation"
                                className="w-[1.6rem] h-[1.6rem]"
                              >
                                <path
                                  d="M14 3h-3.53a3.07 3.07 0 00-.6-1.65C9.44.82 8.8.5 8 .5s-1.44.32-1.87.85A3.06 3.06 0 005.53 3H2a.5.5 0 000 1h1.25v10c0 .28.22.5.5.5h8.5a.5.5 0 00.5-.5V4H14a.5.5 0 000-1zM6.91 1.98c.23-.29.58-.48 1.09-.48s.85.19 1.09.48c.2.24.3.6.36 1.02h-2.9c.05-.42.17-.78.36-1.02zm4.84 11.52h-7.5V4h7.5v9.5z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M6.55 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5zM9.45 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5z"
                                  fill="currentColor"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>

                        {/* 3. Desktop Quantity & Remove Button Cell (`>= 861px`) */}
                        <td className="cart-item__quantity hidden min-[861px]:table-cell pt-[4rem] align-middle">
                          <div className="cart-item__quantity-wrapper flex items-center">
                            <div className="quantity inline-flex items-center h-[4.2rem] w-[13.4rem] border border-black/15 bg-white">
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.key, item.quantity - 1)}
                                aria-label={`Decrease quantity for ${item.title}`}
                                className="w-[4.2rem] h-full flex items-center justify-center bg-transparent border-0 text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-[1rem] h-[0.2rem]"
                                  fill="none"
                                  viewBox="0 0 10 2"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M.5 1C.5.7.7.5 1 .5h8a.5.5 0 110 1H1A.5.5 0 01.5 1z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateCartItemQuantity(
                                    item.key,
                                    Math.max(1, parseInt(e.target.value, 10) || 1)
                                  )
                                }
                                aria-label={`Quantity for ${item.title}`}
                                className="w-[5rem] h-full text-center text-[1.5rem] font-medium text-black border-x border-black/15 bg-transparent outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.key, item.quantity + 1)}
                                aria-label={`Increase quantity for ${item.title}`}
                                className="w-[4.2rem] h-full flex items-center justify-center bg-transparent border-0 text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-[1rem] h-[1rem]"
                                  fill="none"
                                  viewBox="0 0 10 10"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M1 4.51a.5.5 0 000 1h3.5l.01 3.5a.5.5 0 001-.01V5.5l3.5-.01a.5.5 0 00-.01-1H5.5L5.49.99a.5.5 0 00-1 .01v3.5l-3.5.01H1z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeFromCart(item.key)}
                              aria-label={`Remove ${item.title}`}
                              title="Remove item"
                              className="ml-[15px] w-[3.2rem] h-[3.2rem] rounded-full flex items-center justify-center bg-transparent border-0 text-black hover:text-[#2f3e10] transition-colors cursor-pointer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                                aria-hidden="true"
                                focusable="false"
                                role="presentation"
                                className="w-[1.6rem] h-[1.6rem]"
                              >
                                <path
                                  d="M14 3h-3.53a3.07 3.07 0 00-.6-1.65C9.44.82 8.8.5 8 .5s-1.44.32-1.87.85A3.06 3.06 0 005.53 3H2a.5.5 0 000 1h1.25v10c0 .28.22.5.5.5h8.5a.5.5 0 00.5-.5V4H14a.5.5 0 000-1zM6.91 1.98c.23-.29.58-.48 1.09-.48s.85.19 1.09.48c.2.24.3.6.36 1.02h-2.9c.05-.42.17-.78.36-1.02zm4.84 11.52h-7.5V4h7.5v9.5z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M6.55 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5zM9.45 5.25a.5.5 0 00-.5.5v6a.5.5 0 001 0v-6a.5.5 0 00-.5-.5z"
                                  fill="currentColor"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>

                        {/* 4. Line Item Total Cell */}
                        <td className="cart-item__totals min-[861px]:pt-[4rem] text-center min-[577px]:text-right min-[861px]:align-middle">
                          <div className="cart-item__price-wrapper">
                            <span className="price font-body text-[1.6rem] sm:text-[1.8rem] font-normal text-black">
                              Rs. {lineTotal.toFixed(2)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Continue Shopping Button Row (`.title-wrapper-with-link` below `form#cart`) */}
            <div className="title-wrapper-with-link my-[3rem] flex items-center justify-between flex-wrap gap-[1.5rem]">
              <Link
                to="/collections/all"
                className="lil-button bg-[#586c38] hover:bg-[#2f3e10] text-white border-0 no-underline inline-flex items-center justify-center"
              >
                Continue shopping
              </Link>
            </div>

            {/* Cart Footer Summary Block (`.cart__footer` with `background: var(--gradient-base-background-4)` = `#79634608` / `#fef9ea`, `padding: 3rem`) */}
            <div className="cart__footer-wrapper pt-[2rem] md:pt-[3rem]">
              <div className="cart__footer bg-[#7963460d] p-[2.4rem] sm:p-[3rem] flex flex-col md:flex-row items-stretch md:items-start justify-between gap-[3rem]">
                {/* Left Column: Optional Order Note */}
                <div className="w-full md:w-[35rem]">
                  <button
                    type="button"
                    onClick={() => setOrderNoteOpen((prev) => !prev)}
                    className="flex items-center gap-[0.8rem] bg-transparent border-0 p-0 font-heading text-[1.7rem] font-medium text-black hover:text-[#2f3e10] cursor-pointer"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Order special instructions</span>
                  </button>

                  {orderNoteOpen && (
                    <div className="mt-[1.4rem]">
                      <textarea
                        rows="4"
                        value={orderNote}
                        onChange={(e) => handleNoteChange(e.target.value)}
                        placeholder="Add special instructions for your order..."
                        className="w-full p-[1.2rem] bg-white border border-black/20 focus:border-black outline-none text-[1.4rem] font-body text-black resize-y"
                      />
                    </div>
                  )}
                </div>

                {/* Right Column: Subtotal, Discounts, Total, Checkout CTA & Coupon Input (`.cart__blocks`) */}
                <div className="cart__blocks w-full md:w-[39rem] ml-auto">
                  <div className="js-contents">
                    {/* Subtotal Row */}
                    <div className="totals flex items-baseline justify-center md:justify-end gap-[2rem]">
                      <h2 className="totals__subtotal m-0 font-heading text-[1.8rem] font-medium text-black">
                        Subtotal
                      </h2>
                      <p className="totals__subtotal-value m-0 font-body text-[1.8rem] font-bold text-black">
                        Rs. {cartSubtotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Active Discount Row */}
                    {appliedDiscount && discountAmount > 0 && (
                      <div className="discounts mt-[1.2rem]">
                        <div className="discounts__discount flex items-center justify-center md:justify-end gap-[0.8rem] text-[1.4rem] text-[#586c38]">
                          <svg
                            aria-hidden="true"
                            focusable="false"
                            role="presentation"
                            className="w-[1.4rem] h-[1.4rem]"
                            viewBox="0 0 12 12"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M7 0h3a2 2 0 012 2v3a1 1 0 01-.3.7l-6 6a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4l6-6A1 1 0 017 0zm2 2a1 1 0 102 0 1 1 0 00-2 0z"
                              fill="currentColor"
                            />
                          </svg>
                          <span className="font-medium">
                            Discount ({appliedDiscount.code} - {appliedDiscount.label}): -Rs.{' '}
                            {discountAmount.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveDiscount}
                            aria-label="Remove discount"
                            className="bg-transparent border-0 p-0 text-[1.2rem] underline text-black/70 hover:text-black cursor-pointer ml-[0.4rem]"
                          >
                            Remove
                          </button>
                        </div>

                        {/* Final Total Row after Discount */}
                        <div className="totals flex items-baseline justify-center md:justify-end gap-[2rem] mt-[1.2rem] pt-[1.2rem] border-t border-black/10">
                          <h2 className="totals__subtotal m-0 font-heading text-[2rem] font-medium text-black">
                            Total
                          </h2>
                          <p className="totals__subtotal-value m-0 font-body text-[2rem] font-bold text-black">
                            Rs. {finalTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tax & Shipping Note */}
                    <small className="tax-note block text-center md:text-right text-[1.3rem] text-black/75 mt-[2rem] mb-[2rem]">
                      Tax included and shipping calculated at checkout
                    </small>
                  </div>

                  {/* Proceed to Checkout CTA (`.cart__ctas`) */}
                  <div className="cart__ctas">
                    <button
                      type="button"
                      id="checkout"
                      onClick={handleProceedToCheckout}
                      className="cart__checkout-button w-full min-h-[4.6rem] px-[3rem] py-[1rem] bg-[#586c38] hover:bg-[#2f3e10] text-white border-0 font-body text-[1.3rem] font-medium uppercase tracking-[1.6px] transition-all duration-300 cursor-pointer"
                    >
                      Check out
                    </button>
                  </div>

                  {/* Discount Code Form (`form.discount`) */}
                  <form
                    onSubmit={handleApplyDiscount}
                    className="discount mt-[2rem] mb-[0.5rem] w-full flex items-center justify-between"
                  >
                    <input
                      type="text"
                      name="discount"
                      placeholder="Discount code..."
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value)}
                      className="discount-code w-full h-[4.4rem] px-[1.2rem] mr-[1rem] bg-transparent border border-black/20 focus:border-black outline-none font-heading text-[1.5rem] text-black placeholder:font-body"
                    />
                    <button
                      id="apply-coupon"
                      type="submit"
                      className="w-[40%] min-w-fit h-[4.4rem] px-[2.4rem] bg-[#586c38] hover:bg-[#2f3e10] text-white border-0 font-body text-[1.3rem] font-medium uppercase tracking-[1.6px] transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>

                  {discountError && (
                    <p className="m-0 mt-[0.6rem] text-[1.3rem] text-[#eb001b] text-center md:text-left">
                      {discountError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. Featured / Recommended Products Section (Reusing ProductCard component) */}
      {recommendedProducts.length > 0 && (
        <section className="page-full-width page-full-width_spacing pt-[20px] pb-[60px]">
          <div className="row">
            <div className="text-center mb-[3.5rem]">
              <h6 className="m-0 mb-[0.6rem] font-body text-[1.4rem] uppercase tracking-[2px] text-[#586c38] font-medium">
                Leaf In Life
              </h6>
              <h2 className="m-0 font-heading text-[2.8rem] sm:text-[3.4rem] font-medium text-black">
                You May Also Like
              </h2>
            </div>

            <ul className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[1.2rem] gap-y-[2.4rem] md:gap-x-[3rem] md:gap-y-[3rem] list-none m-0 p-0">
              {recommendedProducts.map((product) => (
                <li key={product._id} className="grid__item">
                  <ProductCard product={product} aspectRatio="125%" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}

