import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import ProductCard from '../components/common/ProductCard';
import { productService } from '../services/api';
import { useStore } from '../context/StoreContext';
import { getProductImageUrl } from '../utils/imageUtils';
import { initialProducts } from '../data/homeData';

function StarIcons({ rating = 5, size = 16 }) {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <span className="inline-flex items-center gap-[2px] text-[#586c38]" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rounded ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.8"
          className="shrink-0"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  // Product & Related Products State
  const [product, setProduct] = useState(() => {
    return initialProducts.find((p) => p.slug === slug) || initialProducts[0];
  });
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery & Image Zoom State
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Variant & Quantity State
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Share popover state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Accordions State (Description open by default, Reviews expandable)
  const [isDescOpen, setIsDescOpen] = useState(true);
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);

  // Customer Reviews State
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewFilterStar, setReviewFilterStar] = useState(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    author: '',
    email: '',
    rating: 5,
    title: '',
    body: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');

  // Sticky Bottom Add-to-Cart Bar State
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [stickyBarDismissed, setStickyBarDismissed] = useState(false);
  const mainFormRef = useRef(null);

  // Load product details and related products dynamically via custom API service
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    Promise.all([
      productService.getProductById(slug),
      productService.getProducts({ limit: 6 }),
    ]).then(([prodData, relData]) => {
      if (!isMounted) return;
      const rawProd = prodData || initialProducts[0];
      const rawPrimary = (rawProd.images && rawProd.images[0]) || rawProd.primaryImage || '/assets/images/prod-p2.jpg';
      const rawGallery = rawProd.images && rawProd.images.length > 0 ? rawProd.images : [rawPrimary];
      const sellingPrice = rawProd.price;
      const comparePrice = rawProd.comparePrice !== undefined && rawProd.comparePrice !== null
        ? rawProd.comparePrice
        : (rawProd.discountPrice && rawProd.discountPrice < rawProd.price ? rawProd.price : undefined);

      const resolvedProduct = {
        ...rawProd,
        _id: rawProd._id || rawProd.id,
        title: rawProd.name || rawProd.title,
        price: sellingPrice,
        comparePrice: comparePrice,
        originalPrice: comparePrice,
        formattedPrice: `Rs. ${Number(sellingPrice).toFixed(2)}`,
        formattedComparePrice: comparePrice ? `Rs. ${Number(comparePrice).toFixed(2)}` : undefined,
        primaryImage: getProductImageUrl(rawPrimary),
        images: rawGallery.map((img) => getProductImageUrl(img)),
        inStock: rawProd.stock !== undefined ? Number(rawProd.stock) > 0 : true,
        reviews: rawProd.reviews || [],
      };

      setProduct(resolvedProduct);
      const relList = relData?.products || (Array.isArray(relData) ? relData : []);
      const mappedRel = relList
        .filter((p) => p.slug !== slug && String(p._id) !== String(resolvedProduct._id))
        .slice(0, 4)
        .map((p) => {
          const relSelling = p.price;
          const relCompare = p.comparePrice !== undefined && p.comparePrice !== null
            ? p.comparePrice
            : (p.discountPrice && p.discountPrice < p.price ? p.price : undefined);

          return {
            ...p,
            _id: p._id || p.id,
            title: p.name || p.title,
            price: relSelling,
            comparePrice: relCompare,
            formattedPrice: `Rs. ${Number(relSelling).toFixed(2)}`,
            formattedComparePrice: relCompare ? `Rs. ${Number(relCompare).toFixed(2)}` : undefined,
            primaryImage: getProductImageUrl((p.images && p.images[0]) || p.primaryImage || '/assets/images/prod-p2.jpg'),
            secondaryImage: getProductImageUrl((p.images && p.images[1]) || (p.images && p.images[0]) || '/assets/images/prod-pp2.jpg'),
            inStock: p.stock !== undefined ? Number(p.stock) > 0 : true,
          };
        });
      setRelatedProducts(mappedRel);

      // Initialize default variant
      if (resolvedProduct.variants && resolvedProduct.variants.length > 0) {
        const defaultVar =
          resolvedProduct.variants.find((v) => v.active) ||
          resolvedProduct.variants.find((v) => v.available) ||
          resolvedProduct.variants[0];
        setSelectedVariant(defaultVar);
      } else {
        setSelectedVariant(null);
      }

      setActiveImageIndex(0);
      setQuantity(1);
      setReviewsList(resolvedProduct.reviews || []);
      setReviewFilterStar(null);
      setShowWriteReview(false);
      setReviewSuccessMessage('');
      setLoading(false);
    }).catch((err) => {
      console.error('Error fetching product details:', err);
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Show sticky bar when scrolling past main product form
  useEffect(() => {
    const handleScroll = () => {
      if (!mainFormRef.current || stickyBarDismissed) return;
      const rect = mainFormRef.current.getBoundingClientRect();
      setShowStickyBar(rect.bottom < 0);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [stickyBarDismissed]);

  if (!product) return null;

  // Gallery images list
  const galleryImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.primaryImage, product.secondaryImage].filter(Boolean);

  const currentMainImage = galleryImages[activeImageIndex] || product.primaryImage;

  // Price & Availability computation based on selected variant
  const displayPriceValue = selectedVariant ? selectedVariant.price : product.price;
  const displayComparePriceValue = selectedVariant
    ? (selectedVariant.comparePrice || selectedVariant.originalPrice)
    : (product.comparePrice || product.originalPrice);

  const displayFormattedPrice = selectedVariant
    ? selectedVariant.formattedPrice || `Rs. ${Number(selectedVariant.price).toFixed(2)}`
    : product.formattedPrice || `Rs. ${Number(product.price).toFixed(2)}`;

  const displayFormattedComparePrice = displayComparePriceValue && Number(displayComparePriceValue) > Number(displayPriceValue)
    ? `Rs. ${Number(displayComparePriceValue).toFixed(2)}`
    : null;

  const discountPercent = displayComparePriceValue && Number(displayComparePriceValue) > Number(displayPriceValue)
    ? Math.round(((Number(displayComparePriceValue) - Number(displayPriceValue)) / Number(displayComparePriceValue)) * 100)
    : null;

  const isAvailable = selectedVariant ? selectedVariant.available : product.inStock;
  const wishlisted = isInWishlist(product._id);

  // Handle Variant Selection (updates price, availability, and switches active gallery image if variant has its own image)
  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant);
    if (variant.image) {
      const idx = galleryImages.findIndex((img) => img === variant.image);
      if (idx !== -1) {
        setActiveImageIndex(idx);
      }
    }
  };

  // Interactive Mouse Zoom handler (`$('.zoom').zoom(2)` equivalent)
  const handleMouseMoveZoom = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  // Add to Cart & Buy It Now handlers
  const handleAddToCart = (e) => {
    if (e) e.preventDefault();
    if (!isAvailable) return;
    addToCart(product, selectedVariant, quantity);
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addToCart(product, selectedVariant, quantity);
    navigate('/cart');
  };

  // Share Copy Link handler
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/products/${product.slug}`
      : `https://leafinlifehealthcare.com/products/${product.slug}`;

  const handleCopyShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Reviews Calculations
  const totalReviews = reviewsList.length;
  const computedAvgRating =
    totalReviews > 0
      ? (
          reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviews
        ).toFixed(2)
      : (product.averageRating || 5.0).toFixed(2);

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviewsList.filter((r) => Math.round(Number(r.rating)) === star).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  const displayedReviews = reviewFilterStar
    ? reviewsList.filter((r) => Math.round(Number(r.rating)) === reviewFilterStar)
    : reviewsList;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.body.trim()) return;
    setReviewSubmitting(true);
    const res = await productService.submitReview(product.slug, reviewForm);
    setReviewSubmitting(false);
    if (res && res.data) {
      setReviewsList((prev) => [res.data, ...prev]);
      setReviewForm({ author: '', email: '', rating: 5, title: '', body: '' });
      setShowWriteReview(false);
      setReviewSuccessMessage('Thank you! Your review has been submitted.');
      setTimeout(() => setReviewSuccessMessage(''), 4000);
    }
  };

  return (
    <main id="MainContent" className="content-for-layout focus-none" role="main" tabIndex="-1">
      {/* 1. Product Breadcrumb Banner Section */}
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
              aria-label="breadcrumbs product"
            >
              <h2 className="breadcrumb_title m-0 mb-[1rem] font-heading text-[2.6rem] min-[577px]:text-[3.4rem] xl:text-[4rem] font-medium capitalize text-black leading-[1.3]">
                {product.title}
              </h2>

              <div className="flex flex-wrap items-center justify-center mt-[0.5rem] text-[1.2rem] tracking-[3px] uppercase font-medium text-black">
                <Link
                  to="/collections/all"
                  className="px-[5px] md:px-[2rem] text-black hover:text-[#2f3e10] transition-colors no-underline"
                >
                  All
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

                <span className="px-[5px] md:px-[2rem] text-black">{product.title}</span>
              </div>
            </nav>
          </div>
        </div>
      </section>

      {/* 2. Main Product Template Section */}
      <section className="main-product-template">
        <div className="page-width pt-[75px] pb-[45px] md:pt-[100px] md:pb-[60px]">
          <div className="row">
            <div className="facets-vertical no-sidebar">
              <div className="main-product_info product product--medium product--thumbnail grid grid-cols-1 lg:grid-cols-2 gap-y-[3rem] lg:gap-x-[5rem] items-start">
                {/* LEFT COLUMN: Product Media Gallery + Zoom + Thumbnails */}
                <div className="product__media-wrapper w-full">
                  <div className="product__media-gallery">
                    {/* Main Active Image Viewer with Hover 2x Zoom & Lightbox Trigger */}
                    <div className="relative w-full overflow-hidden bg-white border border-[#f7e9e3]/60 group">
                      {/* Top-Left Magnifying Glass Plus Icon */}
                      <button
                        type="button"
                        onClick={() => setIsLightboxOpen(true)}
                        aria-label="Open media in modal"
                        className="product__media-icon absolute top-[1.2rem] left-[1.2rem] z-20 w-[3.4rem] h-[3.4rem] rounded-full bg-white border border-black/10 text-black flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-sm"
                      >
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          role="presentation"
                          className="w-[1.5rem] h-[1.5rem]"
                          viewBox="0 0 19 19"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.66724 7.93978C4.66655 7.66364 4.88984 7.43922 5.16598 7.43853L10.6996 7.42464C10.9758 7.42395 11.2002 7.64724 11.2009 7.92339C11.2016 8.19953 10.9783 8.42395 10.7021 8.42464L5.16849 8.43852C4.89235 8.43922 4.66793 8.21592 4.66724 7.93978Z"
                            fill="currentColor"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.92576 4.66463C8.2019 4.66394 8.42632 4.88723 8.42702 5.16337L8.4409 10.697C8.44159 10.9732 8.2183 11.1976 7.94215 11.1983C7.66601 11.199 7.44159 10.9757 7.4409 10.6995L7.42702 5.16588C7.42633 4.88974 7.64962 4.66532 7.92576 4.66463Z"
                            fill="currentColor"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M12.8324 3.03011C10.1255 0.323296 5.73693 0.323296 3.03011 3.03011C0.323296 5.73693 0.323296 10.1256 3.03011 12.8324C5.73693 15.5392 10.1255 15.5392 12.8324 12.8324C15.5392 10.1256 15.5392 5.73693 12.8324 3.03011ZM2.32301 2.32301C5.42035 -0.774336 10.4421 -0.774336 13.5395 2.32301C16.6101 5.39361 16.6366 10.3556 13.619 13.4588L18.2473 18.0871C18.4426 18.2824 18.4426 18.599 18.2473 18.7943C18.0521 18.9895 17.7355 18.9895 17.5402 18.7943L12.8778 14.1318C9.76383 16.6223 5.20839 16.4249 2.32301 13.5395C-0.774335 10.4421 -0.774335 5.42035 2.32301 2.32301Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>

                      {/* 1:1 Square Zoom Container (`#ex1`, `padding-top: 100%`) */}
                      <div
                        id="ex1"
                        className="relative w-full pb-[100%] overflow-hidden cursor-zoom-in select-none"
                        onMouseEnter={() => setIsZooming(true)}
                        onMouseLeave={() => setIsZooming(false)}
                        onMouseMove={handleMouseMoveZoom}
                        onClick={() => setIsLightboxOpen(true)}
                      >
                        <img
                          src={currentMainImage}
                          alt={product.title}
                          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-150 ease-out"
                          style={
                            isZooming
                              ? {
                                  transform: 'scale(2)',
                                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                }
                              : {
                                  transform: 'scale(1)',
                                  transformOrigin: 'center center',
                                }
                          }
                        />
                      </div>
                    </div>

                    {/* Mobile Slider Counter & Prev/Next Arrows */}
                    {galleryImages.length > 1 && (
                      <div className="flex md:hidden items-center justify-center gap-[2rem] mt-[1.2rem]">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === 0 ? galleryImages.length - 1 : prev - 1
                            )
                          }
                          aria-label="Slide left"
                          className="bg-transparent border-0 p-[0.5rem] cursor-pointer text-black"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="27"
                            height="16"
                            viewBox="0 0 27 16"
                            fill="none"
                            className="rotate-180"
                          >
                            <path
                              d="M22.64 5.68003L25.5 7.98072L22.64 10.28"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M25.3879 8.14001L1.56788 8.14001"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                        <div className="text-[1.3rem] text-black/80">
                          <span>{activeImageIndex + 1}</span>
                          <span> / </span>
                          <span>{galleryImages.length}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === galleryImages.length - 1 ? 0 : prev + 1
                            )
                          }
                          aria-label="Slide right"
                          className="bg-transparent border-0 p-[0.5rem] cursor-pointer text-black"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="27"
                            height="16"
                            viewBox="0 0 27 16"
                            fill="none"
                          >
                            <path
                              d="M22.64 5.68003L25.5 7.98072L22.64 10.28"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M25.3879 8.14001L1.56788 8.14001"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Thumbnail Gallery Slider */}
                    {galleryImages.length > 1 && (
                      <div className="thumbnail-slider flex items-center gap-[0.8rem] mt-[1.4rem]">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === 0 ? galleryImages.length - 1 : prev - 1
                            )
                          }
                          aria-label="Previous thumbnail"
                          className="hidden sm:flex w-[3.2rem] h-[3.2rem] items-center justify-center bg-transparent border border-[#f7e9e3] hover:border-black text-black cursor-pointer shrink-0 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="9"
                            height="6"
                            viewBox="0 0 8.828 5.414"
                            className="rotate-90"
                          >
                            <path
                              d="M4,10,7,7,4,4"
                              transform="translate(11.414 -2.586) rotate(90)"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </button>

                        <ul className="thumbnail-list grid grid-cols-4 sm:grid-cols-5 gap-[1rem] list-none m-0 p-[0.2rem] w-full">
                          {galleryImages.map((imgUrl, idx) => {
                            const isCurrent = idx === activeImageIndex;
                            return (
                              <li key={idx} className="thumbnail-list__item relative pb-[100%]">
                                <button
                                  type="button"
                                  onClick={() => setActiveImageIndex(idx)}
                                  aria-label={`Load image ${idx + 1} in gallery view`}
                                  aria-current={isCurrent ? 'true' : undefined}
                                  className={`thumbnail absolute inset-0 w-full h-full p-0 bg-white border cursor-pointer transition-all duration-200 overflow-hidden ${
                                    isCurrent
                                      ? 'border-black/50 shadow-[0_0_0_0.1rem_rgba(0,0,0,0.35)] opacity-100'
                                      : 'border-transparent opacity-80 hover:opacity-100'
                                  }`}
                                >
                                  <img
                                    src={imgUrl}
                                    alt={`${product.title} thumbnail ${idx + 1}`}
                                    className="w-full h-full object-cover object-top"
                                    loading="lazy"
                                  />
                                </button>
                              </li>
                            );
                          })}
                        </ul>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((prev) =>
                              prev === galleryImages.length - 1 ? 0 : prev + 1
                            )
                          }
                          aria-label="Next thumbnail"
                          className="hidden sm:flex w-[3.2rem] h-[3.2rem] items-center justify-center bg-transparent border border-[#f7e9e3] hover:border-black text-black cursor-pointer shrink-0 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="9"
                            height="6"
                            viewBox="0 0 8.828 5.414"
                            className="-rotate-90"
                          >
                            <path
                              d="M4,10,7,7,4,4"
                              transform="translate(11.414 -2.586) rotate(90)"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Product Information Wrapper */}
                <div className="product__info-wrapper w-full">
                  <div className="product__info-container lg:sticky lg:top-[3rem]">
                    {/* Product Title */}
                    <div className="product__title mb-[1.5rem]">
                      <h1 className="m-0 font-heading text-[2.6rem] sm:text-[3rem] xl:text-[3.4rem] font-medium text-black leading-[1.25]">
                        {product.title}
                      </h1>
                    </div>

                    {/* Price & Availability Badge */}
                    <div className="price-wrapper mb-[0.6rem]" role="status">
                      <div className="price flex items-center flex-wrap gap-[1.2rem]">
                        <span className="price-item price-item--regular font-body text-[1.8rem] sm:text-[2rem] font-medium text-black">
                          {displayFormattedPrice}
                        </span>

                        {displayFormattedComparePrice && (
                          <span className="price-item price-item--compare font-body text-[1.5rem] sm:text-[1.7rem] text-stone-400 line-through">
                            {displayFormattedComparePrice}
                          </span>
                        )}

                        {discountPercent && (
                          <span className="inline-block px-[8px] py-[2px] text-[1.2rem] font-bold rounded bg-[#fef9ea] text-[#586c38] border border-[#586c38]/30">
                            {discountPercent}% OFF
                          </span>
                        )}

                        {!isAvailable ? (
                          <span className="badge inline-block px-[9px] py-[5px] text-[1.2rem] font-semibold rounded-[3px] bg-[#fef9ea] text-black border border-[#f7e9e3]">
                            Sold out
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-[0.6rem] text-[1.3rem] text-[#586c38] font-medium">
                            <span className="w-[8px] h-[8px] rounded-full bg-[#54c63a] animate-pulse" />
                            In stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tax Included Caption */}
                    <div className="product__tax text-[1.3rem] tracking-[0.04rem] text-black/75 mb-[2rem]">
                      Tax included.
                    </div>

                    {/* Size Variant Radio Pills (for products with variants) */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="my-[2.8rem]">
                        <fieldset className="product-form__input border-0 p-0 m-0 flex flex-col sm:flex-row sm:items-center gap-[1.2rem]">
                          <div className="swatch-label-text min-w-[100px] xl:min-w-[110px]">
                            <legend className="form__label m-0 font-heading text-[2rem] sm:text-[2.2rem] font-medium text-black">
                              Size:
                            </legend>
                          </div>
                          <div className="swatch-group flex flex-wrap items-center gap-[1rem]">
                            {product.variants.map((variant) => {
                              const isSelected = selectedVariant?.id === variant.id;
                              return (
                                <button
                                  key={variant.id}
                                  type="button"
                                  onClick={() => handleSelectVariant(variant)}
                                  className={`px-[1.4rem] py-[1rem] text-[1.4rem] font-body leading-none border transition-all duration-300 cursor-pointer ${
                                    isSelected
                                      ? 'bg-black text-white border-black'
                                      : 'bg-[#fef9ea] text-black border-transparent hover:border-black'
                                  } ${
                                    !variant.available
                                      ? 'opacity-60 line-through'
                                      : ''
                                  }`}
                                >
                                  {variant.size}
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>
                      </div>
                    )}

                    {/* Share Button */}
                    <div className="share-button my-[1.8rem] relative">
                      <button
                        type="button"
                        onClick={() => setIsShareOpen((prev) => !prev)}
                        className="share-button__button inline-flex items-center gap-[0.8rem] bg-transparent border-0 p-0 font-heading text-[1.6rem] font-normal text-black hover:text-[#2f3e10] cursor-pointer transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-[1.4rem] h-[1.5rem]"
                          viewBox="0 0 13.584 14.811"
                        >
                          <g transform="translate(-1424.541 -929.799)">
                            <line
                              x2="3.826"
                              y2="2.242"
                              transform="translate(1428.868 938.727)"
                              fill="none"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                            <line
                              x1="3.826"
                              y2="2.242"
                              transform="translate(1428.868 934.545)"
                              fill="none"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                            <ellipse
                              cx="1.92"
                              cy="1.92"
                              rx="1.92"
                              ry="1.92"
                              transform="translate(1425.291 935.837)"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                            <ellipse
                              cx="1.92"
                              cy="1.92"
                              rx="1.92"
                              ry="1.92"
                              transform="translate(1432.43 940.02)"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                            <ellipse
                              cx="1.92"
                              cy="1.92"
                              rx="1.92"
                              ry="1.92"
                              transform="translate(1431.635 933.574) rotate(-45)"
                              fill="none"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                            />
                          </g>
                        </svg>
                        <span>Share</span>
                      </button>

                      {isShareOpen && (
                        <div className="mt-[1rem] p-[1.2rem] bg-white border border-[#f7e9e3] shadow-md flex items-center gap-[1rem] max-w-[42rem]">
                          <input
                            type="text"
                            readOnly
                            value={shareUrl}
                            onClick={(e) => e.target.select()}
                            className="flex-1 h-[3.8rem] px-[1rem] text-[1.3rem] border border-[#f7e9e3] text-black bg-[#fef9ea]/40 outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCopyShareLink}
                            className="h-[3.8rem] px-[1.4rem] bg-black text-white text-[1.2rem] uppercase tracking-[1px] border-0 cursor-pointer hover:bg-[#586c38] transition-colors"
                          >
                            {copiedLink ? 'Copied!' : 'Copy link'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quantity Selector + Add Cart + Buy It Now + Wishlist Form */}
                    <form
                      ref={mainFormRef}
                      onSubmit={handleAddToCart}
                      className="product-form mb-[2.5rem]"
                    >
                      <div className="product-form__buttons flex flex-wrap items-center gap-[1.8rem] sm:gap-[2.5rem]">
                        {/* Quantity Input Box */}
                        <div className="product-form__input product-form__quantity">
                          <div className="quantity inline-flex items-center h-[4.4rem] w-[13.8rem] border border-black/15 bg-white">
                            <button
                              type="button"
                              name="minus"
                              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                              aria-label={`Decrease quantity for ${product.title}`}
                              className="w-[4.5rem] h-full flex items-center justify-center bg-transparent border-0 text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
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
                              name="quantity"
                              min="1"
                              value={quantity}
                              onChange={(e) =>
                                setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                              }
                              className="w-[4.8rem] h-full text-center text-[1.5rem] font-medium text-black border-x border-black/15 bg-transparent outline-none"
                            />

                            <button
                              type="button"
                              name="plus"
                              onClick={() => setQuantity((q) => q + 1)}
                              aria-label={`Increase quantity for ${product.title}`}
                              className="w-[4.5rem] h-full flex items-center justify-center bg-transparent border-0 text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
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
                        </div>

                        {/* Add cart Button (exact original outline style: transparent bg, 2px solid black border, hover #fef9ea) */}
                        <button
                          type="submit"
                          disabled={!isAvailable}
                          className="product-form__submit min-h-[4.4rem] px-[4rem] py-[0.4rem] bg-transparent text-black border-2 border-black font-body text-[1.4rem] font-medium uppercase tracking-[1.6px] hover:bg-[#fef9ea] hover:text-black transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>{isAvailable ? 'Add cart' : 'Sold out'}</span>
                        </button>

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product)}
                          aria-label="Add to wishlist"
                          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                          className={`h-[4.4rem] w-[4.8rem] flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                            wishlisted
                              ? 'bg-[#586c38] text-white border-[#586c38]'
                              : 'bg-white text-black border-black/20 hover:border-black'
                          }`}
                        >
                          <svg
                            width="18"
                            height="18"
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
                      </div>

                      {/* Buy It Now Accelerated Checkout Button */}
                      <div className="mt-[1.6rem] max-w-[44rem]">
                        <button
                          type="button"
                          disabled={!isAvailable}
                          onClick={handleBuyNow}
                          className="shopify-payment-button__button w-full min-h-[4.6rem] px-[4rem] py-[0.8rem] bg-[#586c38] hover:bg-[#2f3e10] text-white border-0 font-heading text-[1.5rem] font-medium tracking-[0.1rem] uppercase transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Buy it now
                        </button>
                      </div>
                    </form>

                    {/* Divider matching `.html-sections-product` */}
                    <div className="border-b-2 border-black/[0.08] my-[2rem]" />

                    {/* Accordion 1: Description */}
                    <div className="product__accordion accordion">
                      <div className="dt-details">
                        <button
                          type="button"
                          onClick={() => setIsDescOpen((prev) => !prev)}
                          aria-expanded={isDescOpen}
                          className="w-full flex items-center justify-between py-[2.2rem] bg-transparent border-0 border-b-2 border-black/[0.08] text-left cursor-pointer"
                        >
                          <h3 className="product-accordion__title m-0 font-heading text-[2rem] font-medium text-black">
                            Description
                          </h3>
                          <svg
                            width="15"
                            height="21"
                            viewBox="0 0 15 21"
                            fill="currentColor"
                            className={`transition-transform duration-300 ${
                              isDescOpen ? 'rotate-180 text-[#2f3e10]' : 'text-black'
                            }`}
                          >
                            <path d="M8,20.3l6.6-6.6c0.3-0.3,0.3-0.7,0-0.9c-0.3-0.3-0.7-0.3-0.9,0l-5.6,5.6V1.2c0-0.4-0.3-0.7-0.7-0.7c-0.4,0-0.7,0.3-0.7,0.7v17l-5.4-5.4c-0.3-0.3-0.7-0.3-0.9,0c-0.1,0.1-0.2,0.3-0.2,0.5c0,0.2,0.1,0.3,0.2,0.5L7,20.3c0.1,0.1,0.3,0.2,0.5,0.2S7.8,20.4,8,20.3L8,20.3z" />
                          </svg>
                        </button>

                        {isDescOpen && (
                          <div
                            className="accordion__content rte pt-[2rem] pb-[1rem] px-[0.5rem] text-[1.6rem] leading-[1.75] font-light text-black space-y-[1.2rem]"
                            dangerouslySetInnerHTML={{
                              __html:
                                product.descriptionHtml || `<p>${product.description || ''}</p>`,
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Accordion 2: Reviews (Customer Reviews, Rating Summary, Histogram & Review List) */}
                    <div className="product__accordion accordion">
                      <div className="dt-details">
                        <button
                          type="button"
                          onClick={() => setIsReviewsOpen((prev) => !prev)}
                          aria-expanded={isReviewsOpen}
                          className="w-full flex items-center justify-between py-[2.2rem] bg-transparent border-0 border-b-2 border-black/[0.08] text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-[1.2rem]">
                            <h3 className="accordion__title m-0 font-heading text-[2rem] font-medium text-black">
                              Reviews
                            </h3>
                            <span className="text-[1.4rem] text-black/65 font-body">
                              ({totalReviews})
                            </span>
                          </div>
                          <svg
                            width="15"
                            height="21"
                            viewBox="0 0 15 21"
                            fill="currentColor"
                            className={`transition-transform duration-300 ${
                              isReviewsOpen ? 'rotate-180 text-[#2f3e10]' : 'text-black'
                            }`}
                          >
                            <path d="M8,20.3l6.6-6.6c0.3-0.3,0.3-0.7,0-0.9c-0.3-0.3-0.7-0.3-0.9,0l-5.6,5.6V1.2c0-0.4-0.3-0.7-0.7-0.7c-0.4,0-0.7,0.3-0.7,0.7v17l-5.4-5.4c-0.3-0.3-0.7-0.3-0.9,0c-0.1,0.1-0.2,0.3-0.2,0.5c0,0.2,0.1,0.3,0.2,0.5L7,20.3c0.1,0.1,0.3,0.2,0.5,0.2S7.8,20.4,8,20.3L8,20.3z" />
                          </svg>
                        </button>

                        {isReviewsOpen && (
                          <div className="accordion__content pt-[2.2rem] pb-[1.5rem] px-[0.5rem]">
                            {/* Customer Reviews Header & Histogram */}
                            <div className="jdgm-rev-widg__header pb-[2rem] border-b border-[#f7e9e3]">
                              <div className="flex flex-wrap items-center justify-between gap-[1.5rem] mb-[1.8rem]">
                                <div>
                                  <h2 className="m-0 mb-[0.6rem] font-heading text-[2.2rem] font-medium text-black">
                                    Customer Reviews
                                  </h2>
                                  <div className="flex items-center gap-[1rem]">
                                    <StarIcons rating={computedAvgRating} size={18} />
                                    <span className="text-[1.4rem] text-black/80">
                                      {totalReviews > 0
                                        ? `${computedAvgRating} out of 5 • Based on ${totalReviews} ${
                                            totalReviews === 1 ? 'review' : 'reviews'
                                          }`
                                        : 'No reviews yet'}
                                    </span>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setShowWriteReview((prev) => !prev)}
                                  className="px-[2rem] py-[0.9rem] bg-[#586c38] hover:bg-[#2f3e10] text-white border-0 text-[1.3rem] uppercase tracking-[1px] font-medium cursor-pointer transition-colors"
                                >
                                  {showWriteReview ? 'Cancel review' : 'Write a review'}
                                </button>
                              </div>

                              {/* 5-Star Rating Breakdown Histogram */}
                              {totalReviews > 0 && (
                                <div className="space-y-[0.6rem] max-w-[36rem] mt-[1.2rem]">
                                  {starCounts.map(({ star, count, percentage }) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() =>
                                        setReviewFilterStar(reviewFilterStar === star ? null : star)
                                      }
                                      className={`w-full flex items-center gap-[1rem] bg-transparent border-0 p-[0.2rem] text-left cursor-pointer transition-opacity ${
                                        reviewFilterStar && reviewFilterStar !== star
                                          ? 'opacity-50'
                                          : 'opacity-100'
                                      }`}
                                    >
                                      <StarIcons rating={star} size={13} />
                                      <div className="flex-1 h-[1rem] bg-[#fef9ea] border border-[#f7e9e3] overflow-hidden">
                                        <div
                                          className="h-full bg-[#586c38]"
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                      <span className="w-[3.8rem] text-[1.2rem] text-black/70 text-right">
                                        {percentage}%
                                      </span>
                                      <span className="w-[2.8rem] text-[1.2rem] text-black/70">
                                        ({count})
                                      </span>
                                    </button>
                                  ))}
                                  {reviewFilterStar && (
                                    <button
                                      type="button"
                                      onClick={() => setReviewFilterStar(null)}
                                      className="bg-transparent border-0 p-0 text-[1.2rem] underline text-[#586c38] cursor-pointer mt-[0.4rem]"
                                    >
                                      See all reviews
                                    </button>
                                  )}
                                </div>
                              )}

                              {reviewSuccessMessage && (
                                <div className="mt-[1.4rem] p-[1.2rem] bg-[#fef9ea] border border-[#586c38]/40 text-[#2f3e10] text-[1.4rem]">
                                  {reviewSuccessMessage}
                                </div>
                              )}

                              {/* Write a Review Form */}
                              {showWriteReview && (
                                <form
                                  onSubmit={handleReviewSubmit}
                                  className="mt-[2rem] p-[2rem] bg-[#fef9ea]/60 border border-[#f7e9e3] space-y-[1.4rem]"
                                >
                                  <h4 className="m-0 font-heading text-[1.8rem] font-medium text-black">
                                    Write a review
                                  </h4>

                                  <div>
                                    <label className="block text-[1.4rem] text-black mb-[0.5rem]">
                                      Rating
                                    </label>
                                    <div className="flex items-center gap-[0.6rem]">
                                      {[1, 2, 3, 4, 5].map((starVal) => (
                                        <button
                                          key={starVal}
                                          type="button"
                                          onClick={() =>
                                            setReviewForm((f) => ({ ...f, rating: starVal }))
                                          }
                                          className="bg-transparent border-0 p-[0.2rem] cursor-pointer text-[#586c38]"
                                        >
                                          <svg
                                            width="22"
                                            height="22"
                                            viewBox="0 0 24 24"
                                            fill={
                                              starVal <= reviewForm.rating ? 'currentColor' : 'none'
                                            }
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                          >
                                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                          </svg>
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1.2rem]">
                                    <div>
                                      <label className="block text-[1.4rem] text-black mb-[0.4rem]">
                                        Name
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Enter your name (public)"
                                        value={reviewForm.author}
                                        onChange={(e) =>
                                          setReviewForm((f) => ({ ...f, author: e.target.value }))
                                        }
                                        className="w-full h-[4rem] px-[1.2rem] bg-white border border-[#f7e9e3] text-[1.4rem] text-black outline-none focus:border-black"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[1.4rem] text-black mb-[0.4rem]">
                                        Email
                                      </label>
                                      <input
                                        type="email"
                                        placeholder="Enter your email (private)"
                                        value={reviewForm.email}
                                        onChange={(e) =>
                                          setReviewForm((f) => ({ ...f, email: e.target.value }))
                                        }
                                        className="w-full h-[4rem] px-[1.2rem] bg-white border border-[#f7e9e3] text-[1.4rem] text-black outline-none focus:border-black"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[1.4rem] text-black mb-[0.4rem]">
                                      Review Title
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Give your review a title"
                                      value={reviewForm.title}
                                      onChange={(e) =>
                                        setReviewForm((f) => ({ ...f, title: e.target.value }))
                                      }
                                      className="w-full h-[4rem] px-[1.2rem] bg-white border border-[#f7e9e3] text-[1.4rem] text-black outline-none focus:border-black"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[1.4rem] text-black mb-[0.4rem]">
                                      Review *
                                    </label>
                                    <textarea
                                      rows="3"
                                      required
                                      placeholder="Write your comments here"
                                      value={reviewForm.body}
                                      onChange={(e) =>
                                        setReviewForm((f) => ({ ...f, body: e.target.value }))
                                      }
                                      className="w-full p-[1.2rem] bg-white border border-[#f7e9e3] text-[1.4rem] text-black outline-none focus:border-black"
                                    />
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={reviewSubmitting}
                                    className="px-[2.4rem] py-[1rem] bg-black hover:bg-[#586c38] text-white border-0 text-[1.3rem] uppercase tracking-[1px] cursor-pointer transition-colors"
                                  >
                                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                                  </button>
                                </form>
                              )}
                            </div>

                            {/* Individual Customer Reviews List */}
                            <div className="jdgm-rev-widg__reviews divide-y divide-[#f7e9e3]">
                              {displayedReviews.length === 0 ? (
                                <p className="py-[2rem] text-[1.5rem] text-black/70 m-0">
                                  Be the first to write a review for {product.title}.
                                </p>
                              ) : (
                                displayedReviews.map((rev, index) => (
                                  <div
                                    key={rev.id || index}
                                    className="py-[1.8rem] flex flex-col gap-[0.8rem]"
                                  >
                                    <div className="flex items-center justify-between gap-[1rem]">
                                      <div className="flex items-center gap-[1rem]">
                                        <div className="w-[3.6rem] h-[3.6rem] rounded-full bg-[#fef9ea] border border-[#f7e9e3] flex items-center justify-center font-heading text-[1.5rem] font-medium text-[#586c38]">
                                          {rev.initial || rev.author?.charAt(0) || 'A'}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-[0.8rem]">
                                            <span className="font-heading text-[1.5rem] font-medium text-black">
                                              {rev.author}
                                            </span>
                                            {rev.verified && (
                                              <span className="px-[0.6rem] py-[0.1rem] bg-[#586c38] text-white text-[1rem] uppercase tracking-[0.5px]">
                                                Verified
                                              </span>
                                            )}
                                          </div>
                                          <div className="mt-[0.2rem]">
                                            <StarIcons rating={rev.rating} size={13} />
                                          </div>
                                        </div>
                                      </div>
                                      {rev.date && (
                                        <time className="text-[1.2rem] text-black/60">
                                          {rev.date}
                                        </time>
                                      )}
                                    </div>

                                    {rev.title && (
                                      <b className="font-heading text-[1.6rem] font-medium text-black">
                                        {rev.title}
                                      </b>
                                    )}
                                    <p className="m-0 text-[1.5rem] leading-[1.6] font-light text-black/85">
                                      {rev.body}
                                    </p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Multicolumn Section ("Why Choose..." & "How to Use...") */}
      {product.multicolumn && (
        <section className="section-multicolumn">
          <div className="multicolumn bg-white">
            <div className="page-width py-[27px] md:py-[36px]">
              <div className="row">
                <div className="title-wrapper-with-link text-left mb-[3rem]">
                  {product.multicolumn.subHeading && (
                    <h6 className="sub-heading m-0 mb-[0.8rem] font-body text-[1.4rem] uppercase tracking-[2px] text-[#586c38] font-medium">
                      {product.multicolumn.subHeading}
                    </h6>
                  )}
                  {product.multicolumn.title && (
                    <h2 className="title m-0 mb-[1.6rem] font-heading text-[2.6rem] sm:text-[3.4rem] xl:text-[4rem] font-medium text-black leading-[1.25]">
                      {product.multicolumn.title}
                    </h2>
                  )}
                  {product.multicolumn.description && (
                    <p className="description m-0 text-[1.6rem] leading-[1.75] font-light text-black/85">
                      {product.multicolumn.description}
                    </p>
                  )}
                </div>

                {product.multicolumn.cards && product.multicolumn.cards.length > 0 && (
                  <ul className="multicolumn-list grid grid-cols-1 gap-[2.4rem] list-none m-0 p-0">
                    {product.multicolumn.cards.map((card, idx) => (
                      <li key={idx} className="multicolumn-list__item">
                        <div className="multicolumn-card h-full bg-black/[0.04] p-[2.5rem] sm:p-[3rem]">
                          <div className="multicolumn-card__info">
                            <h2 className="m-0 mb-[1.4rem] font-heading text-[2.2rem] sm:text-[2.6rem] font-semibold text-black">
                              {card.heading}
                            </h2>
                            <div
                              className="rte text-[1.6rem] leading-[1.75] font-light text-black space-y-[1.2rem] [&_ul]:list-disc [&_ul]:pl-[2rem] [&_li]:mb-[0.6rem]"
                              dangerouslySetInnerHTML={{ __html: card.contentHtml }}
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Related Products Section (Top Rated / Related Products Carousel reusing ProductCard) */}
      {relatedProducts.length > 0 && (
        <section className="section-recommendation">
          <div className="page-full-width page-full-width_spacing pt-[38px] pb-[30px] md:pt-[50px] md:pb-[50px]">
            <div className="row">
              <div className="title-wrapper-with-link text-center mb-[3.5rem]">
                <h6 className="sub-heading m-0 mb-[0.6rem] font-body text-[1.4rem] uppercase tracking-[2px] text-[#586c38] font-medium">
                  Top Rated
                </h6>
                <h2 className="title m-0 font-heading text-[2.8rem] sm:text-[3.4rem] font-medium text-black">
                  Related Products
                </h2>
              </div>

              <div className="relative group/rec">
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={20}
                  slidesPerView={1}
                  navigation={{
                    prevEl: '.rec-swiper-prev',
                    nextEl: '.rec-swiper-next',
                  }}
                  pagination={{
                    clickable: true,
                    el: '.rec-swiper-pagination',
                  }}
                  breakpoints={{
                    480: { slidesPerView: 2, spaceBetween: 20 },
                    750: { slidesPerView: 3, spaceBetween: 24 },
                    990: { slidesPerView: 4, spaceBetween: 30 },
                    1440: { slidesPerView: 5, spaceBetween: 30 },
                  }}
                  className="pb-[4rem]"
                >
                  {relatedProducts.map((relProd) => (
                    <SwiperSlide key={relProd._id} className="h-auto">
                      <ProductCard product={relProd} aspectRatio="125%" />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Navigation Arrows */}
                <button
                  type="button"
                  aria-label="Previous related products"
                  className="rec-swiper-prev hidden md:flex absolute left-[1rem] top-[40%] -translate-y-1/2 z-20 w-[4rem] h-[4rem] rounded-full bg-white border border-[#f7e9e3] text-black hover:bg-[#586c38] hover:text-white items-center justify-center shadow-md cursor-pointer transition-all opacity-0 group-hover/rec:opacity-100"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Next related products"
                  className="rec-swiper-next hidden md:flex absolute right-[1rem] top-[40%] -translate-y-1/2 z-20 w-[4rem] h-[4rem] rounded-full bg-white border border-[#f7e9e3] text-black hover:bg-[#586c38] hover:text-white items-center justify-center shadow-md cursor-pointer transition-all opacity-0 group-hover/rec:opacity-100"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                <div className="rec-swiper-pagination flex justify-center mt-[2rem]" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. Fullscreen Image Zoom Lightbox Modal (`product-media-modal`) */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[101] bg-white overflow-y-auto"
          role="dialog"
          aria-label="Media gallery"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close"
            className="fixed top-[2rem] right-[2rem] md:right-[5rem] z-10 w-[4.4rem] h-[4.4rem] rounded-full bg-white border border-black/15 text-black/70 hover:text-black flex items-center justify-center cursor-pointer shadow-md"
          >
            <svg width="18" height="18" viewBox="0 0 25 25" fill="currentColor">
              <path d="M23.214,25a1.78,1.78,0,0,1-1.263-.523L.523,3.048A1.786,1.786,0,0,1,3.048.523L24.477,21.952A1.786,1.786,0,0,1,23.214,25" />
              <path d="M1.786,25A1.786,1.786,0,0,1,.523,21.952L21.952.523a1.786,1.786,0,1,1,2.525,2.525L3.048,24.477A1.78,1.78,0,0,1,1.786,25" />
            </svg>
          </button>

          <div className="max-w-[110rem] mx-auto py-[4rem] px-[2rem] md:px-[8rem] space-y-[2rem]">
            {galleryImages.map((imgUrl, i) => (
              <img
                key={i}
                src={imgUrl}
                alt={`${product.title} full view ${i + 1}`}
                className="w-full h-auto block mx-auto border border-[#f7e9e3]"
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. Sticky Bottom Add-to-Cart Bar (`#sticky-bar-form`) */}
      {showStickyBar && !stickyBarDismissed && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#f7e9e3] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-[1.2rem] px-[2rem] hidden md:block">
          <div className="page-width flex items-center justify-between gap-[2rem]">
            {/* Left: Sticky Thumb + Title + Price */}
            <div className="flex items-center gap-[1.5rem]">
              <img
                src={currentMainImage}
                alt={product.title}
                className="w-[5.5rem] h-[5.5rem] object-cover border border-[#f7e9e3]"
              />
              <div>
                <div className="font-heading text-[1.7rem] font-medium text-black">
                  {product.title}
                </div>
                <div className="text-[1.5rem] text-black/80">{displayFormattedPrice}</div>
              </div>
            </div>

            {/* Right: Variant Select + Add Cart + Close */}
            <div className="flex items-center gap-[1.8rem]">
              {product.variants && product.variants.length > 0 && (
                <div className="flex items-center gap-[1rem]">
                  <label className="font-heading text-[1.5rem] font-medium text-black">
                    Size:
                  </label>
                  <select
                    value={selectedVariant?.id || ''}
                    onChange={(e) => {
                      const found = product.variants.find((v) => v.id === e.target.value);
                      if (found) handleSelectVariant(found);
                    }}
                    className="h-[4rem] px-[1.2rem] bg-white border border-[#f7e9e3] text-[1.4rem] text-black outline-none"
                  >
                    {product.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.size} - {v.formattedPrice}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                disabled={!isAvailable}
                onClick={handleAddToCart}
                className="min-h-[4.2rem] px-[3.2rem] bg-[#586c38] hover:bg-[#2f3e10] text-white border-0 text-[1.3rem] uppercase tracking-[1.4px] font-medium cursor-pointer transition-colors disabled:opacity-50"
              >
                {isAvailable ? 'Add cart' : 'Sold out'}
              </button>

              <button
                type="button"
                onClick={() => setStickyBarDismissed(true)}
                aria-label="Close sticky bar"
                className="bg-transparent border-0 p-[0.5rem] text-black/60 hover:text-black cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 25 25" fill="currentColor">
                  <path d="M23.214,25a1.78,1.78,0,0,1-1.263-.523L.523,3.048A1.786,1.786,0,0,1,3.048.523L24.477,21.952A1.786,1.786,0,0,1,23.214,25" />
                  <path d="M1.786,25A1.786,1.786,0,0,1,.523,21.952L21.952.523a1.786,1.786,0,1,1,2.525,2.525L3.048,24.477A1.78,1.78,0,0,1,1.786,25" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

