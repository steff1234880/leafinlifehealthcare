import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import { productService } from '../services/api';
import { productCategories, initialProducts } from '../data/homeData';

const SORT_OPTIONS = [
  { value: 'manual', label: 'Featured' },
  { value: 'most-relevant', label: 'Most relevant' },
  { value: 'best-selling', label: 'Best selling' },
  { value: 'title-ascending', label: 'Alphabetically, A-Z' },
  { value: 'title-descending', label: 'Alphabetically, Z-A' },
  { value: 'price-ascending', label: 'Price, low to high' },
  { value: 'price-descending', label: 'Price, high to low' },
  { value: 'created-ascending', label: 'Date, old to new' },
  { value: 'created-descending', label: 'Date, new to old' },
];

const HIGHEST_PRICE = 180.0;

export default function ShopPage() {
  const location = useLocation();
  const { category: routeCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine whether we are on `/collections` or `/collections/all` or `/collections/:category`
  const isCollectionsRoot = location.pathname === '/collections';

  // Filter & Sort state
  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (routeCategory && routeCategory !== 'all') return routeCategory;
    return searchParams.get('category') || 'all';
  });
  const [availability, setAvailability] = useState([]); // ['in_stock', 'out_of_stock']
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'manual');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Grid / List View Mode ('list', '2', '3', '4', '5')
  const [gridColumns, setGridColumns] = useState('4');

  // Dropdown & Drawer UI state
  const [openDropdown, setOpenDropdown] = useState(null); // 'availability' | 'price' | 'category' | 'sort' | null
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Products state
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(true);

  const filterBarRef = useRef(null);

  // Sync URL search params (e.g. from SearchModal `/collections/all?q=...` or route changes)
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    setSearchQuery(qParam);
    if (routeCategory) {
      setSelectedCategory(routeCategory);
    } else if (location.pathname === '/collections/all' || location.pathname === '/collections') {
      const catParam = searchParams.get('category') || 'all';
      setSelectedCategory(catParam);
    }
  }, [location.pathname, routeCategory, searchParams]);

  // Close desktop filter/sort popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterBarRef.current && !filterBarRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch products dynamically from custom API service whenever filters/sort change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const backendSortMap = {
      'price-ascending': 'price-asc',
      'price-descending': 'price-desc',
      'title-ascending': 'name-asc',
      'title-descending': 'name-desc',
      'created-descending': 'newest',
    };

    productService
      .getProducts({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
        sort: backendSortMap[sortBy] || 'newest',
        limit: 50,
      })
      .then((res) => {
        if (isMounted) {
          const list = res.products || (Array.isArray(res) ? res : initialProducts);
          // Normalize backend products into UI schema
          const mapped = list.map((p) => ({
            ...p,
            _id: p._id || p.id,
            title: p.name || p.title,
            primaryImage: (p.images && p.images[0]) || p.primaryImage || '/assets/images/prod-p2.jpg',
            secondaryImage: (p.images && p.images[1]) || p.secondaryImage || (p.images && p.images[0]) || '/assets/images/prod-pp2.jpg',
            formattedPrice: `Rs. ${(p.discountPrice || p.price).toFixed(2)}`,
            inStock: (p.stock !== undefined ? p.stock > 0 : true),
          }));
          setProducts(mapped);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load products from backend:', err);
        if (isMounted) {
          setProducts([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, availability, minPrice, maxPrice, sortBy, searchQuery, isCollectionsRoot]);

  // Toggle Availability Checkbox
  const handleToggleAvailability = (val) => {
    setAvailability((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  // Reset handlers
  const resetAvailability = () => setAvailability([]);
  const resetPrice = () => {
    setMinPrice('');
    setMaxPrice('');
  };
  const resetCategory = () => {
    setSelectedCategory('all');
    if (searchParams.has('category')) {
      const next = new URLSearchParams(searchParams);
      next.delete('category');
      setSearchParams(next);
    }
  };
  const resetSearchQuery = () => {
    setSearchQuery('');
    if (searchParams.has('q')) {
      const next = new URLSearchParams(searchParams);
      next.delete('q');
      setSearchParams(next);
    }
  };

  const resetAllFilters = () => {
    setAvailability([]);
    setMinPrice('');
    setMaxPrice('');
    setSelectedCategory('all');
    setSearchQuery('');
    setSearchParams({});
  };

  // Active filter count & tags
  const activeFilterTags = [];
  if (selectedCategory && selectedCategory !== 'all') {
    const catObj = productCategories.find(
      (c) => c.slug === selectedCategory || c.value.toLowerCase() === selectedCategory.toLowerCase()
    );
    activeFilterTags.push({
      id: 'category',
      label: `Category: ${catObj ? catObj.label : selectedCategory}`,
      onRemove: resetCategory,
    });
  }
  if (availability.includes('in_stock')) {
    activeFilterTags.push({
      id: 'in_stock',
      label: 'Availability: In stock',
      onRemove: () => handleToggleAvailability('in_stock'),
    });
  }
  if (availability.includes('out_of_stock')) {
    activeFilterTags.push({
      id: 'out_of_stock',
      label: 'Availability: Out of stock',
      onRemove: () => handleToggleAvailability('out_of_stock'),
    });
  }
  if (minPrice !== '' || maxPrice !== '') {
    const fromLabel = minPrice !== '' ? `Rs. ${Number(minPrice).toFixed(2)}` : 'Rs. 0.00';
    const toLabel =
      maxPrice !== '' ? `Rs. ${Number(maxPrice).toFixed(2)}` : `Rs. ${HIGHEST_PRICE.toFixed(2)}`;
    activeFilterTags.push({
      id: 'price',
      label: `${fromLabel} - ${toLabel}`,
      onRemove: resetPrice,
    });
  }
  if (searchQuery) {
    activeFilterTags.push({
      id: 'search',
      label: `Search: "${searchQuery}"`,
      onRemove: resetSearchQuery,
    });
  }

  // Dynamic Breadcrumb Title
  const activeCategoryObj = productCategories.find(
    (c) => c.slug === selectedCategory || c.value.toLowerCase() === selectedCategory.toLowerCase()
  );
  const breadcrumbTitle = isCollectionsRoot
    ? 'All collections'
    : selectedCategory && selectedCategory !== 'all' && activeCategoryObj
    ? activeCategoryObj.label
    : 'all';

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label || 'Featured';

  // Counts for Availability Facet (matches original site: In stock (7), Out of stock (2))
  const inStockCount = initialProducts.filter((p) => p.inStock).length;
  const outOfStockCount = initialProducts.filter(
    (p) => !p.inStock || p.hasOutOfStockVariant || (p.variants && p.variants.some((v) => !v.available))
  ).length;

  // Dynamic responsive grid class based on selected column view mode
  const getGridColumnClasses = () => {
    if (gridColumns === 'list') {
      return 'grid-cols-1 gap-y-[3rem]';
    }
    switch (gridColumns) {
      case '2':
        return 'grid-cols-1 min-[380px]:grid-cols-2 gap-x-[1.2rem] gap-y-[2.4rem] md:gap-x-[3rem] md:gap-y-[3rem]';
      case '3':
        return 'grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-3 gap-x-[1.2rem] gap-y-[2.4rem] md:gap-x-[3rem] md:gap-y-[3rem]';
      case '5':
        return 'grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-[1540px]:grid-cols-5 gap-x-[1.2rem] gap-y-[2.4rem] md:gap-x-[3rem] md:gap-y-[3rem]';
      case '4':
      default:
        return 'grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[1.2rem] gap-y-[2.4rem] md:gap-x-[3rem] md:gap-y-[3rem]';
    }
  };

  return (
    <main id="MainContent" className="content-for-layout focus-none" role="main" tabIndex="-1">
      {/* 1. Breadcrumb Hero Banner Section */}
      <section className="w-full">
        <div
          className="breadcrumb-section relative w-full bg-no-repeat bg-cover bg-center py-[60px] min-[577px]:py-[90px] md:py-[120px] transition-all"
          style={{
            backgroundImage: "url('/assets/images/breadcrumb-bg.jpg')",
          }}
        >
          {/* Soft overlay matching original theme contrast */}
          <div className="page-width relative z-10 text-center">
            <nav
              className="breadcrumb flex flex-col items-center justify-center text-center"
              role="navigation"
              aria-label="breadcrumbs"
            >
              <h1 className="breadcrumb_title m-0 mb-[1rem] font-heading text-[2.6rem] min-[577px]:text-[3.4rem] xl:text-[4rem] font-medium capitalize text-black leading-[1.3]">
                {breadcrumbTitle}
              </h1>

              {!isCollectionsRoot && (
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

                  <Link
                    to="/collections"
                    className="px-[5px] sm:px-[2rem] text-black hover:text-[#2f3e10] transition-colors no-underline"
                  >
                    All collections
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
                    {breadcrumbTitle}
                  </span>
                </div>
              )}
            </nav>
          </div>
        </div>
      </section>

      {/* 2. Collection Main Content Section */}
      <section className="product-collection page-full-width page-full-width_spacing pt-[21px] pb-[15px] md:pt-[28px] md:pb-[20px]">
        <div className="row" ref={filterBarRef}>
          {/* Category Selection Pills Bar */}
          <div className="flex flex-wrap items-center justify-center gap-[0.8rem] sm:gap-[1.2rem] mb-[2.4rem] pb-[1.6rem] border-b border-[#f7e9e3]">
            {productCategories.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.slug.toLowerCase() ||
                selectedCategory.toLowerCase() === cat.value.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-[1.8rem] py-[0.8rem] text-[1.4rem] font-body font-normal tracking-[0.5px] transition-all duration-300 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#586c38] text-white border-[#586c38]'
                      : 'bg-white text-black border-[#f7e9e3] hover:border-[#586c38] hover:text-[#586c38]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Desktop Horizontal Facets Bar (Filter: Availability, Price, Category) */}
          <div className="facets-wrapper mb-[2rem]">
            {/* Desktop Filters (`>= 990px`) */}
            <div className="hidden lg:flex flex-wrap items-center justify-between gap-[2rem]">
              <div className="flex flex-wrap items-center gap-[2.5rem]">
                <h2 className="facets__heading m-0 font-heading text-[1.6rem] font-normal text-black">
                  Filter:
                </h2>

                {/* Facet 1: Availability Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(openDropdown === 'availability' ? null : 'availability')
                    }
                    aria-expanded={openDropdown === 'availability'}
                    className="facets__summary flex items-center gap-[0.8rem] py-[0.6rem] bg-transparent border-0 text-[1.6rem] font-body font-light text-black hover:text-[#2f3e10] cursor-pointer"
                  >
                    <span>Availability</span>
                    {availability.length > 0 && (
                      <span className="text-[1.4rem] text-black/70">({availability.length})</span>
                    )}
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 10 6"
                      className={`w-[10px] h-[6px] transition-transform duration-200 ${
                        openDropdown === 'availability' ? 'rotate-180' : ''
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>

                  {openDropdown === 'availability' && (
                    <div className="facets__display absolute left-0 top-full mt-[0.8rem] w-[32rem] bg-white border border-[#f7e9e3] shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-30">
                      <div className="facets__header flex items-center justify-between px-[2rem] py-[1.4rem] border-b border-[#f7e9e3] text-[1.4rem]">
                        <span className="facets__selected text-black/80">
                          {availability.length} selected
                        </span>
                        <button
                          type="button"
                          onClick={resetAvailability}
                          className="bg-transparent border-0 p-0 text-[1.4rem] text-black underline hover:text-[#586c38] cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                      <ul className="facets__list list-none m-0 p-[1.5rem_2rem] space-y-[1.2rem]">
                        <li className="facets__item">
                          <label className="facet-checkbox flex items-center gap-[1.2rem] cursor-pointer text-[1.5rem] font-light text-black select-none">
                            <input
                              type="checkbox"
                              checked={availability.includes('in_stock')}
                              onChange={() => handleToggleAvailability('in_stock')}
                              className="sr-only"
                            />
                            <span
                              className={`w-[1.6rem] h-[1.6rem] flex items-center justify-center border ${
                                availability.includes('in_stock')
                                  ? 'border-black bg-white'
                                  : 'border-black/40 bg-white'
                              }`}
                            >
                              {availability.includes('in_stock') && (
                                <svg
                                  width="11"
                                  height="7"
                                  viewBox="0 0 11 7"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M1.5 3.5L4.33333 6.33333L9.5 1.16667"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                            <span>In stock ({inStockCount})</span>
                          </label>
                        </li>
                        <li className="facets__item">
                          <label className="facet-checkbox flex items-center gap-[1.2rem] cursor-pointer text-[1.5rem] font-light text-black select-none">
                            <input
                              type="checkbox"
                              checked={availability.includes('out_of_stock')}
                              onChange={() => handleToggleAvailability('out_of_stock')}
                              className="sr-only"
                            />
                            <span
                              className={`w-[1.6rem] h-[1.6rem] flex items-center justify-center border ${
                                availability.includes('out_of_stock')
                                  ? 'border-black bg-white'
                                  : 'border-black/40 bg-white'
                              }`}
                            >
                              {availability.includes('out_of_stock') && (
                                <svg
                                  width="11"
                                  height="7"
                                  viewBox="0 0 11 7"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M1.5 3.5L4.33333 6.33333L9.5 1.16667"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                            <span>Out of stock ({outOfStockCount})</span>
                          </label>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Facet 2: Price Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(openDropdown === 'price' ? null : 'price')
                    }
                    aria-expanded={openDropdown === 'price'}
                    className="facets__summary flex items-center gap-[0.8rem] py-[0.6rem] bg-transparent border-0 text-[1.6rem] font-body font-light text-black hover:text-[#2f3e10] cursor-pointer"
                  >
                    <span>Price</span>
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 10 6"
                      className={`w-[10px] h-[6px] transition-transform duration-200 ${
                        openDropdown === 'price' ? 'rotate-180' : ''
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>

                  {openDropdown === 'price' && (
                    <div className="facets__display absolute left-0 top-full mt-[0.8rem] w-[34rem] bg-white border border-[#f7e9e3] shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-30">
                      <div className="facets__header flex items-center justify-between px-[2rem] py-[1.4rem] border-b border-[#f7e9e3] text-[1.4rem]">
                        <span className="facets__selected text-black/80">
                          The highest price is Rs. {HIGHEST_PRICE.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={resetPrice}
                          className="bg-transparent border-0 p-0 text-[1.4rem] text-black underline hover:text-[#586c38] cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                      <div className="facets__price flex items-center gap-[1.2rem] p-[2rem]">
                        <span className="field-currency text-[1.5rem] text-black/70">₹</span>
                        <div className="field flex-1 relative">
                          <input
                            type="number"
                            min="0"
                            max={HIGHEST_PRICE}
                            placeholder="From"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full h-[4.2rem] px-[1.2rem] border border-[#f7e9e3] focus:border-black outline-none text-[1.4rem] text-black bg-white"
                          />
                        </div>
                        <span className="field-currency text-[1.5rem] text-black/70">₹</span>
                        <div className="field flex-1 relative">
                          <input
                            type="number"
                            min="0"
                            max={HIGHEST_PRICE}
                            placeholder="To"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full h-[4.2rem] px-[1.2rem] border border-[#f7e9e3] focus:border-black outline-none text-[1.4rem] text-black bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Facet 3: Category Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenDropdown(openDropdown === 'category' ? null : 'category')
                    }
                    aria-expanded={openDropdown === 'category'}
                    className="facets__summary flex items-center gap-[0.8rem] py-[0.6rem] bg-transparent border-0 text-[1.6rem] font-body font-light text-black hover:text-[#2f3e10] cursor-pointer"
                  >
                    <span>Category</span>
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      viewBox="0 0 10 6"
                      className={`w-[10px] h-[6px] transition-transform duration-200 ${
                        openDropdown === 'category' ? 'rotate-180' : ''
                      }`}
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>

                  {openDropdown === 'category' && (
                    <div className="facets__display absolute left-0 top-full mt-[0.8rem] w-[28rem] bg-white border border-[#f7e9e3] shadow-[0_4px_16px_rgba(0,0,0,0.08)] z-30">
                      <div className="facets__header flex items-center justify-between px-[2rem] py-[1.4rem] border-b border-[#f7e9e3] text-[1.4rem]">
                        <span className="facets__selected text-black/80">
                          {selectedCategory === 'all' ? 'All Products' : activeCategoryObj?.label}
                        </span>
                        <button
                          type="button"
                          onClick={resetCategory}
                          className="bg-transparent border-0 p-0 text-[1.4rem] text-black underline hover:text-[#586c38] cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>
                      <ul className="facets__list list-none m-0 p-[1.2rem_1.5rem] space-y-[0.4rem]">
                        {productCategories.map((cat) => {
                          const isSelected =
                            selectedCategory.toLowerCase() === cat.slug.toLowerCase() ||
                            selectedCategory.toLowerCase() === cat.value.toLowerCase();
                          return (
                            <li key={cat.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat.slug);
                                  setOpenDropdown(null);
                                }}
                                className={`w-full text-left px-[1rem] py-[0.8rem] text-[1.5rem] font-light bg-transparent border-0 cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'text-[#586c38] font-normal bg-[#fef9ea]'
                                    : 'text-black hover:text-[#586c38]'
                                }`}
                              >
                                {cat.label}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active Facets Pills Row */}
            {activeFilterTags.length > 0 && (
              <div className="active-facets flex flex-wrap items-center gap-[1rem] mt-[1.4rem]">
                {activeFilterTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={tag.onRemove}
                    className="inline-flex items-center gap-[0.8rem] px-[1.2rem] py-[0.5rem] bg-[#fef9ea] border border-[#f7e9e3] text-[1.3rem] text-black hover:border-black cursor-pointer transition-colors"
                  >
                    <span>{tag.label}</span>
                    <svg
                      aria-hidden="true"
                      focusable="false"
                      width="12"
                      height="13"
                      viewBox="0 0 12 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-[1rem] h-[1rem]"
                    >
                      <path
                        d="M8.48627 9.32917L2.82849 3.67098"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.88539 9.38504L8.42932 3.61524"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="bg-transparent border-0 px-[0.8rem] py-[0.5rem] text-[1.3rem] text-black underline hover:text-[#586c38] cursor-pointer"
                >
                  Remove all
                </button>
              </div>
            )}

            {/* Mobile Filter & Sort Trigger Bar (`< 990px`) */}
            <div className="flex lg:hidden items-center justify-between py-[1rem] border-b border-[#f7e9e3]">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="mobile-facets__open flex items-center gap-[0.8rem] bg-transparent border-0 p-0 text-[1.5rem] font-body text-black hover:text-[#586c38] cursor-pointer"
              >
                <svg
                  className="icon icon-filter w-[1.8rem] h-[1.8rem]"
                  aria-hidden="true"
                  focusable="false"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.835 6.968a.5.5 0 01.132-.515l.204-.202a1.7 1.7 0 011.202-.496h12.254a1.7 1.7 0 011.202.496l.204.202a.5.5 0 01.132.515 2.7 2.7 0 01-.557.99l-4.63 5.402a1.7 1.7 0 00-.409 1.106v4.677a.7.7 0 01-.387.626l-2.615 1.307a.7.7 0 01-1.013-.626v-5.984a1.7 1.7 0 00-.409-1.106L5.392 7.958a2.7 2.7 0 01-.557-.99z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <span className="mobile-facets__open-label font-normal">Filter and sort</span>
              </button>

              <div className="product-count text-[1.4rem] text-black/80">
                <span>
                  {products.length} {products.length === 1 ? 'product' : 'products'}
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Toolbar: Results Count + View Mode Switcher + Sort By Dropdown */}
          <div className="facets-vertical-sort flex flex-wrap items-center justify-between gap-[1.5rem] mb-[3rem] py-[1rem]">
            {/* Left: Showing Results Count */}
            <div className="product-count-vertical" role="status">
              <h2 className="product-count__text m-0 font-heading text-[1.6rem] font-normal text-black">
                {products.length > 0
                  ? `Showing 1–${products.length} of ${products.length} Results`
                  : '0 Results'}
              </h2>
            </div>

            {/* Center: Custom Product Grid / List View Switcher */}
            <ul className="custom-product-grid hidden sm:flex items-center list-none m-0 p-0">
              {/* 1. List View */}
              <li
                onClick={() => setGridColumns('list')}
                title="List view"
                className={`min-w-[36px] min-h-[36px] px-[8px] py-[5px] mx-[5px] flex items-center justify-center border border-[#f7e9e3] cursor-pointer transition-all duration-300 ${
                  gridColumns === 'list'
                    ? 'bg-black text-white'
                    : 'bg-transparent text-black hover:bg-black hover:text-white'
                }`}
              >
                <svg
                  className="icon-columns"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="15.25" y="4.25" width="1.5" height="12.5" rx="0.75" transform="rotate(90 15.25 4.25)" fill="currentColor" />
                  <rect x="15.25" y="8.25" width="1.5" height="12.5" rx="0.75" transform="rotate(90 15.25 8.25)" fill="currentColor" />
                  <rect x="15.25" y="12.25" width="1.5" height="12.5" rx="0.75" transform="rotate(90 15.25 12.25)" fill="currentColor" />
                </svg>
              </li>

              {/* 2. 2-Column Grid */}
              <li
                onClick={() => setGridColumns('2')}
                title="2 columns"
                className={`min-w-[36px] min-h-[36px] px-[8px] py-[5px] mx-[5px] flex items-center justify-center border border-[#f7e9e3] cursor-pointer transition-all duration-300 ${
                  gridColumns === '2'
                    ? 'bg-black text-white'
                    : 'bg-transparent text-black hover:bg-black hover:text-white'
                }`}
              >
                <svg
                  className="icon-columns"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="6.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                  <rect x="10.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                </svg>
              </li>

              {/* 3. 3-Column Grid */}
              <li
                onClick={() => setGridColumns('3')}
                title="3 columns"
                className={`hidden md:flex min-w-[36px] min-h-[36px] px-[8px] py-[5px] mx-[5px] items-center justify-center border border-[#f7e9e3] cursor-pointer transition-all duration-300 ${
                  gridColumns === '3'
                    ? 'bg-black text-white'
                    : 'bg-transparent text-black hover:bg-black hover:text-white'
                }`}
              >
                <svg
                  className="icon-columns"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="4.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                  <rect x="8.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                  <rect x="12.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                </svg>
              </li>

              {/* 4. 4-Column Grid */}
              <li
                onClick={() => setGridColumns('4')}
                title="4 columns"
                className={`hidden lg:flex min-w-[36px] min-h-[36px] px-[8px] py-[5px] mx-[5px] items-center justify-center border border-[#f7e9e3] cursor-pointer transition-all duration-300 ${
                  gridColumns === '4'
                    ? 'bg-black text-white'
                    : 'bg-transparent text-black hover:bg-black hover:text-white'
                }`}
              >
                <svg
                  className="icon-columns"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="2.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                  <rect x="6.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                  <rect x="10.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                  <rect x="14.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                </svg>
              </li>

              {/* 5. 5-Column Grid */}
              <li
                onClick={() => setGridColumns('5')}
                title="5 columns"
                className={`hidden min-[1540px]:flex min-w-[36px] min-h-[36px] px-[8px] py-[5px] mx-[5px] items-center justify-center border border-[#f7e9e3] cursor-pointer transition-all duration-300 ${
                  gridColumns === '5'
                    ? 'bg-black text-white'
                    : 'bg-transparent text-black hover:bg-black hover:text-white'
                }`}
              >
                <svg
                  className="icon-columns"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="0.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                  <rect x="4.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                  <rect x="8.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                  <rect x="12.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                  <rect x="16.25" y="2.75" width="1.5" height="12.5" rx="0.75" fill="currentColor" />
                </svg>
              </li>
            </ul>

            {/* Right: Sort By Custom Dropdown */}
            <div className="facet-filters sorting hidden lg:flex items-center gap-[1.2rem]">
              <label
                htmlFor="SortByDropdown"
                className="facet-filters__label font-heading text-[1.6rem] font-normal text-black m-0"
              >
                Sort by:
              </label>

              <div className="relative">
                <button
                  id="SortByDropdown"
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                  className="flex items-center justify-between gap-[1.5rem] min-w-[20rem] px-[1.5rem] py-[0.8rem] bg-white border border-[#f7e9e3] text-[1.5rem] font-body font-light text-black hover:border-black cursor-pointer transition-colors"
                >
                  <span>{currentSortLabel}</span>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 10 6"
                    className={`w-[10px] h-[6px] transition-transform duration-200 ${
                      openDropdown === 'sort' ? 'rotate-180' : ''
                    }`}
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9.354.646a.5.5 0 00-.708 0L5 4.293 1.354.646a.5.5 0 00-.708.708l4 4a.5.5 0 00.708 0l4-4a.5.5 0 000-.708z"
                      fill="currentColor"
                    />
                  </svg>
                </button>

                {openDropdown === 'sort' && (
                  <ul className="absolute right-0 top-full mt-[0.4rem] w-[22rem] bg-white border border-[#f7e9e3] shadow-[0_4px_16px_rgba(0,0,0,0.08)] list-none m-0 py-[0.8rem] z-30">
                    {SORT_OPTIONS.map((option) => (
                      <li key={option.value}>
                        <button
                          type="button"
                          onClick={() => {
                            setSortBy(option.value);
                            setOpenDropdown(null);
                          }}
                          className={`w-full text-left px-[1.6rem] py-[0.8rem] text-[1.4rem] font-body font-light border-0 bg-transparent cursor-pointer transition-colors ${
                            sortBy === option.value
                              ? 'text-[#586c38] font-normal bg-[#fef9ea]'
                              : 'text-black hover:text-[#586c38] hover:bg-[#fef9ea]/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* 3. Product Grid / List Container */}
          <div id="ProductGridContainer" className="collection relative min-h-[300px]">
            {loading ? (
              <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[1.2rem] gap-y-[2.4rem] md:gap-x-[3rem] md:gap-y-[3rem]">
                {[1, 2, 3, 4].map((skeleton) => (
                  <div key={skeleton} className="animate-pulse">
                    <div className="w-full pb-[100%] bg-[#fef9ea]" />
                    <div className="h-[2rem] bg-[#fef9ea] mt-[1.5rem] w-3/4 mx-auto" />
                    <div className="h-[1.6rem] bg-[#fef9ea] mt-[1rem] w-1/3 mx-auto" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="collection--empty text-center py-[8rem] px-[2rem]">
                <h2 className="font-heading text-[2.4rem] md:text-[3rem] font-medium text-black mb-[1.5rem]">
                  No products found
                </h2>
                <p className="text-[1.6rem] text-black/70 mb-[2.5rem]">
                  Use fewer filters or remove all to view all authentic Leaf In Life Ayurvedic products.
                </p>
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="lil-button bg-[#586c38] text-white border-0 hover:bg-[#2f3e10]"
                >
                  Remove all filters
                </button>
              </div>
            ) : (
              <ul
                id="product-grid"
                className={`grid list-none m-0 p-0 ${getGridColumnClasses()}`}
              >
                {products.map((product) => (
                  <li key={product._id} className="grid__item">
                    <ProductCard
                      product={product}
                      aspectRatio={isCollectionsRoot ? '125%' : '100%'}
                      showVendor={!isCollectionsRoot}
                      viewMode={gridColumns === 'list' ? 'list' : 'grid'}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* 4. Mobile Filter & Sort Slide-Out Drawer (`< 990px`) */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-full max-w-[38rem] bg-white h-full flex flex-col justify-between overflow-y-auto shadow-2xl">
            {/* Drawer Header */}
            <div>
              <div className="mobile-facets__header flex items-center justify-between px-[2.5rem] py-[2rem] border-b border-[#f7e9e3]">
                <div>
                  <h2 className="m-0 font-heading text-[2rem] font-medium text-black">
                    Filter and sort
                  </h2>
                  <p className="m-0 mt-[0.4rem] text-[1.4rem] text-black/70">
                    {products.length} of {initialProducts.length} products
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  aria-label="Close"
                  className="bg-transparent border-0 p-[0.5rem] text-black hover:text-[#586c38] cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 18 17"
                    fill="none"
                  >
                    <path
                      d="M.865 15.978a.5.5 0 00.707.707l7.433-7.431 7.579 7.282a.501.501 0 00.846-.37.5.5 0 00-.153-.351L9.712 8.546l7.417-7.416a.5.5 0 10-.707-.708L8.991 7.853 1.413.573a.5.5 0 10-.693.72l7.563 7.268-7.418 7.417z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>

              {/* Drawer Body */}
              <div className="p-[2.5rem] space-y-[2.8rem]">
                {/* Category Filter */}
                <div>
                  <h3 className="m-0 mb-[1.2rem] font-heading text-[1.7rem] font-medium text-black">
                    Category
                  </h3>
                  <ul className="list-none m-0 p-0 space-y-[0.8rem]">
                    {productCategories.map((cat) => {
                      const isSelected =
                        selectedCategory.toLowerCase() === cat.slug.toLowerCase() ||
                        selectedCategory.toLowerCase() === cat.value.toLowerCase();
                      return (
                        <li key={cat.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`w-full text-left px-[1.2rem] py-[0.8rem] text-[1.5rem] border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#586c38] text-white border-[#586c38]'
                                : 'bg-white text-black border-[#f7e9e3]'
                            }`}
                          >
                            {cat.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Availability Filter */}
                <div className="pt-[2rem] border-t border-[#f7e9e3]">
                  <div className="flex items-center justify-between mb-[1.2rem]">
                    <h3 className="m-0 font-heading text-[1.7rem] font-medium text-black">
                      Availability
                    </h3>
                    {availability.length > 0 && (
                      <button
                        type="button"
                        onClick={resetAvailability}
                        className="bg-transparent border-0 p-0 text-[1.3rem] underline text-black cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <ul className="list-none m-0 p-0 space-y-[1.2rem]">
                    <li>
                      <label className="flex items-center gap-[1.2rem] cursor-pointer text-[1.5rem] text-black">
                        <input
                          type="checkbox"
                          checked={availability.includes('in_stock')}
                          onChange={() => handleToggleAvailability('in_stock')}
                          className="w-[1.6rem] h-[1.6rem] accent-[#586c38]"
                        />
                        <span>In stock ({inStockCount})</span>
                      </label>
                    </li>
                    <li>
                      <label className="flex items-center gap-[1.2rem] cursor-pointer text-[1.5rem] text-black">
                        <input
                          type="checkbox"
                          checked={availability.includes('out_of_stock')}
                          onChange={() => handleToggleAvailability('out_of_stock')}
                          className="w-[1.6rem] h-[1.6rem] accent-[#586c38]"
                        />
                        <span>Out of stock ({outOfStockCount})</span>
                      </label>
                    </li>
                  </ul>
                </div>

                {/* Price Filter */}
                <div className="pt-[2rem] border-t border-[#f7e9e3]">
                  <div className="flex items-center justify-between mb-[1rem]">
                    <h3 className="m-0 font-heading text-[1.7rem] font-medium text-black">
                      Price
                    </h3>
                    {(minPrice !== '' || maxPrice !== '') && (
                      <button
                        type="button"
                        onClick={resetPrice}
                        className="bg-transparent border-0 p-0 text-[1.3rem] underline text-black cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <p className="m-0 mb-[1.2rem] text-[1.3rem] text-black/70">
                    The highest price is Rs. {HIGHEST_PRICE.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-[1rem]">
                    <span className="text-[1.4rem] text-black/70">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={HIGHEST_PRICE}
                      placeholder="From"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full h-[4rem] px-[1rem] border border-[#f7e9e3] text-[1.4rem]"
                    />
                    <span className="text-[1.4rem] text-black/70">₹</span>
                    <input
                      type="number"
                      min="0"
                      max={HIGHEST_PRICE}
                      placeholder="To"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full h-[4rem] px-[1rem] border border-[#f7e9e3] text-[1.4rem]"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div className="pt-[2rem] border-t border-[#f7e9e3]">
                  <label
                    htmlFor="MobileSortBy"
                    className="block mb-[1rem] font-heading text-[1.7rem] font-medium text-black"
                  >
                    Sort by:
                  </label>
                  <select
                    id="MobileSortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-[4.4rem] px-[1.2rem] bg-white border border-[#f7e9e3] text-[1.5rem] text-black outline-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="mobile-facets__footer flex items-center gap-[1.2rem] p-[2rem_2.5rem] border-t border-[#f7e9e3] bg-white sticky bottom-0">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 h-[4.4rem] bg-white border border-black text-black text-[1.4rem] uppercase tracking-[1px] cursor-pointer hover:bg-black hover:text-white transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 h-[4.4rem] bg-[#586c38] border-0 text-white text-[1.4rem] uppercase tracking-[1px] cursor-pointer hover:bg-[#2f3e10] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

