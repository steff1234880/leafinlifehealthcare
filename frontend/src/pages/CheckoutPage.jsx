import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { orderService, paymentService } from '../services/api';

// Supported Indian states for shipping and billing dropdowns
const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, cartSubtotal, clearCart, setIsLoginOpen } = useStore();
  const { user } = useAuth();

  // Mobile Order Summary accordion toggle
  const [isOrderSummaryExpanded, setIsOrderSummaryExpanded] = useState(false);

  // Discount code state (prefilled from URL or localStorage if any)
  const [discountCode, setDiscountCode] = useState(() => {
    return (
      searchParams.get('discount') ||
      (() => {
        try {
          return localStorage.getItem('coupon') || '';
        } catch {
          return '';
        }
      })()
    );
  });
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);

  // Form states
  const [contactInfo, setContactInfo] = useState({
    emailOrPhone: '',
    emailOffers: true,
  });

  const [shippingAddress, setShippingAddress] = useState({
    country: 'India',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Kerala',
    pincode: '',
    phone: '',
    saveInfo: true,
  });

  const [sameAsShipping, setSameAsShipping] = useState(true);

  const [billingAddress, setBillingAddress] = useState({
    country: 'India',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Kerala',
    pincode: '',
    phone: '',
  });

  const [shippingMethod, setShippingMethod] = useState('standard_free'); // 'standard_free'
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' (Razorpay) or 'cod'

  // Validation & Processing states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentErrorBanner, setPaymentErrorBanner] = useState('');

  // Scroll to top upon mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Pre-apply discount if found
  useEffect(() => {
    const code = discountCode || searchParams.get('discount');
    if (code && cartSubtotal > 0 && !appliedDiscount) {
      setDiscountLoading(true);
      cartService
        .validateDiscount(code, cartSubtotal)
        .then((res) => {
          setDiscountLoading(false);
          if (res && res.valid) {
            setAppliedDiscount(res);
          }
        })
        .catch(() => setDiscountLoading(false));
    }
  }, [cartSubtotal]);

  // Recalculate discount if cartSubtotal changes
  useEffect(() => {
    if (appliedDiscount && cartSubtotal > 0) {
      cartService
        .validateDiscount(appliedDiscount.code, cartSubtotal)
        .then((res) => {
          if (res && res.valid) {
            setAppliedDiscount(res);
          }
        });
    }
  }, [cartSubtotal]);

  // Shipping cost logic: Free promotional
  const shippingCost = 0;
  const discountAmount = appliedDiscount ? Number(appliedDiscount.discountAmount || 0) : 0;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  // Format currency
  const formatPrice = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Discount code apply handler
  const handleApplyDiscount = async (e) => {
    if (e) e.preventDefault();
    setDiscountError('');
    if (!discountCode.trim()) {
      setDiscountError('Enter a valid discount code');
      return;
    }
    setDiscountLoading(true);
    try {
      const res = await cartService.validateDiscount(discountCode, cartSubtotal);
      setDiscountLoading(false);
      if (res.valid) {
        setAppliedDiscount(res);
        try {
          localStorage.setItem('coupon', res.code);
        } catch {
          // ignore
        }
      } else {
        setDiscountError(res.message || 'Invalid coupon code');
      }
    } catch {
      setDiscountLoading(false);
      setDiscountError('Error applying discount code');
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    try {
      localStorage.removeItem('coupon');
    } catch {
      // ignore
    }
  };

  // Form input change handlers
  const handleContactChange = (e) => {
    const { name, value, type, checked } = e.target;
    setContactInfo((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleShippingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[`shipping_${name}`]) {
      setErrors((prev) => ({ ...prev, [`shipping_${name}`]: null }));
    }
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[`billing_${name}`]) {
      setErrors((prev) => ({ ...prev, [`billing_${name}`]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errs = {};

    if (!contactInfo.emailOrPhone.trim()) {
      errs.emailOrPhone = 'Enter an email or mobile phone number';
    }

    if (!shippingAddress.firstName.trim()) {
      errs.shipping_firstName = 'Enter a first name';
    }
    if (!shippingAddress.lastName.trim()) {
      errs.shipping_lastName = 'Enter a last name';
    }
    if (!shippingAddress.address.trim()) {
      errs.shipping_address = 'Enter an address';
    }
    if (!shippingAddress.city.trim()) {
      errs.shipping_city = 'Enter a city';
    }
    if (!shippingAddress.state.trim()) {
      errs.shipping_state = 'Select a state / territory';
    }
    if (!shippingAddress.pincode.trim()) {
      errs.shipping_pincode = 'Enter a PIN code';
    } else if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
      errs.shipping_pincode = 'Enter a valid 6-digit PIN code';
    }
    if (!shippingAddress.phone.trim()) {
      errs.shipping_phone = 'Enter a phone number for delivery updates';
    }

    if (!sameAsShipping) {
      if (!billingAddress.firstName.trim()) {
        errs.billing_firstName = 'Enter a first name';
      }
      if (!billingAddress.lastName.trim()) {
        errs.billing_lastName = 'Enter a last name';
      }
      if (!billingAddress.address.trim()) {
        errs.billing_address = 'Enter a billing address';
      }
      if (!billingAddress.city.trim()) {
        errs.billing_city = 'Enter a city';
      }
      if (!billingAddress.state.trim()) {
        errs.billing_state = 'Select a state / territory';
      }
      if (!billingAddress.pincode.trim()) {
        errs.billing_pincode = 'Enter a PIN code';
      } else if (!/^\d{6}$/.test(billingAddress.pincode.trim())) {
        errs.billing_pincode = 'Enter a valid 6-digit PIN code';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Razorpay SDK Script dynamic loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Place Order / Launch Payment Gateway
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPaymentErrorBanner('');

    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    // Duplicate submission prevention
    if (isSubmitting) return;
    setIsSubmitting(true);

    const orderMetadata = {
      customer: {
        emailOrPhone: contactInfo.emailOrPhone,
      },
      shippingAddress: { ...shippingAddress },
      billingAddress: sameAsShipping ? { ...shippingAddress } : { ...billingAddress },
      items: [...cart],
      pricing: {
        subtotal: cartSubtotal,
        discount: discountAmount,
        discountCode: appliedDiscount ? appliedDiscount.code : null,
        shipping: shippingCost,
        grandTotal: grandTotal,
      },
    };

    // 1. CASH ON DELIVERY FLOW
    if (paymentMethod === 'cod') {
      try {
        const response = await orderService.createOrder({
          shippingAddress: {
            firstName: shippingAddress.firstName.trim(),
            lastName: shippingAddress.lastName.trim(),
            phone: shippingAddress.phone || contactInfo.emailOrPhone,
            email: contactInfo.emailOrPhone.includes('@') ? contactInfo.emailOrPhone : (user?.email || 'customer@leafinlifehealthcare.com'),
            address: shippingAddress.address,
            apartment: shippingAddress.apartment || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            pincode: shippingAddress.pincode,
            country: shippingAddress.country || 'India',
          },
          paymentMethod: 'cod',
          customItems: cart.map((it) => ({
            productId: it.productId || it.key,
            name: it.title || it.name,
            quantity: it.quantity,
          })),
        });
        if (response.success && response.order) {
          // Clear cart only after verified order creation
          clearCart();
          try {
            const existingOrders = JSON.parse(localStorage.getItem('leafinlife_orders') || '[]');
            existingOrders.unshift(response.order);
            localStorage.setItem('leafinlife_orders', JSON.stringify(existingOrders));
            localStorage.removeItem('coupon');
          } catch {
            // ignore
          }
          // Redirect to dedicated Order Success Page
          navigate('/order-success', { state: { order: response.order } });
        } else {
          setPaymentErrorBanner(response.message || 'Failed to place Cash on Delivery order.');
          setIsSubmitting(false);
        }
      } catch (err) {
        setPaymentErrorBanner(err.message || 'Error communicating with backend order service.');
        setIsSubmitting(false);
      }
      return;
    }

    // 2. ONLINE PAYMENT GATEWAY FLOW (Razorpay)
    try {
      // Step A: Load SDK
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setPaymentErrorBanner('Could not load payment gateway SDK. Please check your internet connection and try again.');
        setIsSubmitting(false);
        return;
      }

      // Step B: Connect to backend API to create gateway order session
      const createOrderRes = await paymentService.createPaymentOrder({
        amount: grandTotal,
        currency: 'INR',
        items: cart.map((it) => ({
          productId: it.productId || it.key,
          name: it.title || it.name,
          quantity: it.quantity,
        })),
        customer: orderMetadata.customer,
        shippingAddress: {
          firstName: shippingAddress.firstName.trim(),
          lastName: shippingAddress.lastName.trim(),
          phone: shippingAddress.phone || contactInfo.emailOrPhone,
          email: contactInfo.emailOrPhone.includes('@') ? contactInfo.emailOrPhone : (user?.email || 'customer@leafinlifehealthcare.com'),
          address: shippingAddress.address,
          apartment: shippingAddress.apartment || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          country: shippingAddress.country || 'India',
        },
      });

      const { keyId, order: rzpOrder } = createOrderRes;

      // Step C: Initialize Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Leaf In Life Healthcare',
        description: `Order of ${cart.length} item(s) - Ayurvedic Healthcare`,
        order_id: rzpOrder.id,
        image: '/assets/images/favicon.png',
        prefill: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
          email: contactInfo.emailOrPhone.includes('@') ? contactInfo.emailOrPhone : '',
          contact: shippingAddress.phone || (contactInfo.emailOrPhone.match(/^\d+$/) ? contactInfo.emailOrPhone : ''),
        },
        notes: {
          address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`,
        },
        theme: {
          color: '#586c38',
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setPaymentErrorBanner('Payment process was cancelled. Your items are safe in the cart.');
            paymentService.notifyFailure({
              razorpay_order_id: rzpOrder.id,
              error: 'Customer closed payment checkout modal',
            });
          },
        },
        handler: async function (paymentResponse) {
          // Step D: Cryptographic Verification on Backend API
          try {
            const verificationPayload = {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              orderDetails: orderMetadata,
            };

            const verifyResult = await paymentService.verifyPayment(verificationPayload);

            if (verifyResult.success && verifyResult.order) {
              // Step E: CLEAR CART ONLY AFTER SUCCESSFUL VERIFICATION & ORDER CREATION
              clearCart();

              try {
                const existingOrders = JSON.parse(localStorage.getItem('leafinlife_orders') || '[]');
                existingOrders.unshift(verifyResult.order);
                localStorage.setItem('leafinlife_orders', JSON.stringify(existingOrders));
                localStorage.removeItem('coupon');
              } catch {
                // ignore
              }

              // Step F: REDIRECT TO ORDER SUCCESS PAGE
              navigate('/order-success', { state: { order: verifyResult.order } });
            } else {
              setIsSubmitting(false);
              setPaymentErrorBanner(verifyResult.message || 'Payment verification failed on the server.');
            }
          } catch (verifyErr) {
            setIsSubmitting(false);
            setPaymentErrorBanner(
              verifyErr.message || 'Payment was charged but verification failed. Please contact our support team.'
            );
          }
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', function (failureData) {
        setIsSubmitting(false);
        const errMsg = failureData.error?.description || 'Payment was declined by the bank/gateway.';
        setPaymentErrorBanner(`Payment failed: ${errMsg}`);
        paymentService.reportFailure({
          razorpay_order_id: rzpOrder.id,
          error: failureData.error,
        });
      });

      razorpay.open();
    } catch (err) {
      console.error('Payment initialization error:', err);
      setIsSubmitting(false);
      setPaymentErrorBanner(err.message || 'Unable to connect to payment gateway. Please try again.');
    }
  };

  // If cart is empty, show empty state
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-6">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-3">
          Your cart is currently empty
        </h1>
        <p className="text-stone-600 max-w-md mb-8 text-sm">
          You haven't added any authentic Ayurvedic products to your cart yet. Explore our wide range of herbal remedies.
        </p>
        <Link
          to="/collections/all"
          className="inline-block px-8 py-3.5 bg-[#586c38] text-white font-medium rounded hover:bg-[#47572d] transition-colors uppercase tracking-wider text-xs"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-stone-800">
      {/* Checkout Minimal Top Header */}
      <header className="border-b border-stone-200 py-4 px-4 sm:px-8 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2f3e10]">
              Leaf In Life
            </span>
            <span className="hidden sm:inline-block text-[10px] tracking-widest uppercase font-semibold text-[#586c38] px-2 py-0.5 rounded bg-[#fef9ea] border border-[#586c38]/20">
              Healthcare
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/cart"
              className="text-xs sm:text-sm text-stone-600 hover:text-[#586c38] flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Return to cart</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Collapsible Order Summary Bar */}
      <div className="lg:hidden border-b border-stone-200 bg-[#fef9ea]/50">
        <button
          type="button"
          onClick={() => setIsOrderSummaryExpanded(!isOrderSummaryExpanded)}
          className="w-full py-4 px-4 sm:px-6 flex items-center justify-between text-left"
          aria-expanded={isOrderSummaryExpanded}
        >
          <div className="flex items-center space-x-2 text-sm text-[#586c38] font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>{isOrderSummaryExpanded ? 'Hide order summary' : 'Show order summary'}</span>
            <svg
              className={`w-4 h-4 transition-transform ${isOrderSummaryExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <span className="font-bold text-stone-900 text-base">{formatPrice(grandTotal)}</span>
        </button>

        {isOrderSummaryExpanded && (
          <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-stone-200 bg-[#fafafa]">
            {/* Cart items */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.key} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-14 object-cover rounded-lg border border-stone-200"
                      />
                      <span className="absolute -top-2 -right-2 bg-stone-600 text-white text-[11px] font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 text-xs sm:text-sm line-clamp-1">{item.title}</p>
                      {item.variant && <p className="text-[11px] text-stone-500">{item.variant}</p>}
                    </div>
                  </div>
                  <span className="font-medium text-stone-900 text-xs sm:text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Discount Code Input */}
            <div className="mt-4 pt-4 border-t border-stone-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Discount code (e.g. LEAF10)"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setDiscountError('');
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-[#586c38] focus:border-[#586c38] uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={discountLoading}
                  className="px-4 py-2 bg-[#586c38] text-white text-xs font-semibold rounded hover:bg-[#46562d] transition"
                >
                  {discountLoading ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {discountError && <p className="text-red-500 text-xs mt-1">{discountError}</p>}
              {appliedDiscount && (
                <div className="mt-2 flex items-center justify-between bg-green-50 text-[#586c38] px-2.5 py-1.5 rounded text-xs">
                  <div className="flex items-center space-x-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>{appliedDiscount.code} ({appliedDiscount.label})</span>
                  </div>
                  <button onClick={handleRemoveDiscount} className="text-stone-400 hover:text-stone-700">✕</button>
                </div>
              )}
            </div>

            {/* Mobile breakdown */}
            <div className="mt-4 pt-4 border-t border-stone-200 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-[#586c38]">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-[#586c38] font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 text-sm pt-2 border-t border-stone-200">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Checkout Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
          {/* Left Column (Forms): 7 Cols */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handlePlaceOrder} noValidate>
              {/* Payment Error Alert Banner */}
              {paymentErrorBanner && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
                  <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-semibold">{paymentErrorBanner}</p>
                    <p className="mt-1 text-red-600">Please verify your details or choose another payment method.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentErrorBanner('')}
                    className="text-red-400 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Breadcrumbs / Checkout Step tracker */}
              <nav className="flex items-center space-x-2 text-xs text-stone-400 mb-6 font-medium">
                <Link to="/cart" className="text-[#586c38] hover:underline">
                  Cart
                </Link>
                <span>/</span>
                <span className="text-stone-900 font-semibold">Information & Shipping</span>
                <span>/</span>
                <span className="text-stone-400">Payment</span>
              </nav>

              {/* 1. Contact Information */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-stone-900">Contact Information</h2>
                  <button
                    type="button"
                    onClick={() => setIsLoginOpen(true)}
                    className="text-xs text-[#586c38] hover:underline font-medium"
                  >
                    Already have an account? Log in
                  </button>
                </div>

                <div>
                  <label htmlFor="emailOrPhone" className="block text-xs font-medium text-stone-700 mb-1">
                    Email or mobile phone number *
                  </label>
                  <input
                    type="text"
                    id="emailOrPhone"
                    name="emailOrPhone"
                    value={contactInfo.emailOrPhone}
                    onChange={handleContactChange}
                    placeholder="e.g. name@example.com or 9876543210"
                    className={`w-full px-3.5 py-2.5 text-sm rounded border ${
                      errors.emailOrPhone ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                    } focus:outline-none focus:ring-1 focus:ring-[#586c38] focus:border-[#586c38]`}
                  />
                  {errors.emailOrPhone && (
                    <p className="text-red-500 text-xs mt-1">{errors.emailOrPhone}</p>
                  )}
                </div>

                <div className="mt-3 flex items-center">
                  <input
                    id="emailOffers"
                    name="emailOffers"
                    type="checkbox"
                    checked={contactInfo.emailOffers}
                    onChange={handleContactChange}
                    className="h-4 w-4 text-[#586c38] focus:ring-[#586c38] border-stone-300 rounded cursor-pointer"
                  />
                  <label htmlFor="emailOffers" className="ml-2 text-xs text-stone-600 cursor-pointer">
                    Email me with news, seasonal health tips and exclusive offers
                  </label>
                </div>
              </section>

              {/* 2. Shipping Address */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-stone-900 mb-4">Delivery Address</h2>

                <div className="space-y-4">
                  {/* Country */}
                  <div>
                    <label htmlFor="country" className="block text-xs font-medium text-stone-700 mb-1">
                      Country/Region
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={shippingAddress.country}
                      disabled
                      className="w-full px-3.5 py-2.5 text-sm rounded border border-stone-300 bg-stone-50 text-stone-600 focus:outline-none"
                    >
                      <option value="India">India</option>
                    </select>
                  </div>

                  {/* First & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="shipping_firstName" className="block text-xs font-medium text-stone-700 mb-1">
                        First name *
                      </label>
                      <input
                        type="text"
                        id="shipping_firstName"
                        name="firstName"
                        value={shippingAddress.firstName}
                        onChange={handleShippingChange}
                        className={`w-full px-3.5 py-2.5 text-sm rounded border ${
                          errors.shipping_firstName ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                        } focus:outline-none focus:ring-1 focus:ring-[#586c38] focus:border-[#586c38]`}
                      />
                      {errors.shipping_firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.shipping_firstName}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="shipping_lastName" className="block text-xs font-medium text-stone-700 mb-1">
                        Last name *
                      </label>
                      <input
                        type="text"
                        id="shipping_lastName"
                        name="lastName"
                        value={shippingAddress.lastName}
                        onChange={handleShippingChange}
                        className={`w-full px-3.5 py-2.5 text-sm rounded border ${
                          errors.shipping_lastName ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                        } focus:outline-none focus:ring-1 focus:ring-[#586c38] focus:border-[#586c38]`}
                      />
                      {errors.shipping_lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.shipping_lastName}</p>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="shipping_address" className="block text-xs font-medium text-stone-700 mb-1">
                      Address (House no, Building name, Street) *
                    </label>
                    <input
                      type="text"
                      id="shipping_address"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleShippingChange}
                      placeholder="e.g. 12/450, Green Meadows, MG Road"
                      className={`w-full px-3.5 py-2.5 text-sm rounded border ${
                        errors.shipping_address ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                      } focus:outline-none focus:ring-1 focus:ring-[#586c38] focus:border-[#586c38]`}
                    />
                    {errors.shipping_address && (
                      <p className="text-red-500 text-xs mt-1">{errors.shipping_address}</p>
                    )}
                  </div>

                  {/* Apartment / Suite */}
                  <div>
                    <label htmlFor="shipping_apartment" className="block text-xs font-medium text-stone-700 mb-1">
                      Apartment, suite, landmark, unit (optional)
                    </label>
                    <input
                      type="text"
                      id="shipping_apartment"
                      name="apartment"
                      value={shippingAddress.apartment}
                      onChange={handleShippingChange}
                      placeholder="e.g. Near City Hospital"
                      className="w-full px-3.5 py-2.5 text-sm rounded border border-stone-300 focus:outline-none focus:ring-1 focus:ring-[#586c38] focus:border-[#586c38]"
                    />
                  </div>

                  {/* City, State, PIN code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="shipping_city" className="block text-xs font-medium text-stone-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        id="shipping_city"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleShippingChange}
                        className={`w-full px-3.5 py-2.5 text-sm rounded border ${
                          errors.shipping_city ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                        } focus:outline-none focus:ring-1 focus:ring-[#586c38] focus:border-[#586c38]`}
                      />
                      {errors.shipping_city && (
                        <p className="text-red-500 text-xs mt-1">{errors.shipping_city}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="shipping_state" className="block text-xs font-medium text-stone-700 mb-1">
                        State *
                      </label>
                      <select
                        id="shipping_state"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleShippingChange}
                        className={`w-full px-3.5 py-2.5 text-sm rounded border ${
                          errors.shipping_state ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                        } focus:outline-none focus:ring-1 focus:ring-[#586c38] focus:border-[#586c38] bg-white`}
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      {errors.shipping_state && (
                        <p className="text-red-500 text-xs mt-1">{errors.shipping_state}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="shipping_pincode" className="block text-xs font-medium text-stone-700 mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        maxLength="6"
                        id="shipping_pincode"
                        name="pincode"
                        value={shippingAddress.pincode}
                        onChange={handleShippingChange}
                        placeholder="6 digits"
                        className={`w-full px-3.5 py-2.5 text-sm rounded border ${
                          errors.shipping_pincode ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                        } focus:outline-none focus:ring-1 focus:ring-[#586c38] focus:border-[#586c38]`}
                      />
                      {errors.shipping_pincode && (
                        <p className="text-red-500 text-xs mt-1">{errors.shipping_pincode}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="shipping_phone" className="block text-xs font-medium text-stone-700 mb-1">
                      Phone number * (for dispatch & courier OTP)
                    </label>
                    <input
                      type="tel"
                      id="shipping_phone"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleShippingChange}
                      placeholder="10-digit mobile number"
                      className={`w-full px-3.5 py-2.5 text-sm rounded border ${
                        errors.shipping_phone ? 'border-red-500 bg-red-50/20' : 'border-stone-300'
                      } focus:outline-none focus:ring-1 focus:ring-[#586c38] focus:border-[#586c38]`}
                    />
                    {errors.shipping_phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.shipping_phone}</p>
                    )}
                  </div>

                  <div className="flex items-center pt-1">
                    <input
                      id="saveInfo"
                      name="saveInfo"
                      type="checkbox"
                      checked={shippingAddress.saveInfo}
                      onChange={handleShippingChange}
                      className="h-4 w-4 text-[#586c38] focus:ring-[#586c38] border-stone-300 rounded cursor-pointer"
                    />
                    <label htmlFor="saveInfo" className="ml-2 text-xs text-stone-600 cursor-pointer">
                      Save this information for a faster checkout next time
                    </label>
                  </div>
                </div>
              </section>

              {/* 3. Shipping Method */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-stone-900 mb-3">Shipping Method</h2>
                <div className="border border-stone-200 rounded-lg p-4 bg-stone-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="standard_shipping"
                      name="shipping_method"
                      checked={shippingMethod === 'standard_free'}
                      onChange={() => setShippingMethod('standard_free')}
                      className="h-4 w-4 text-[#586c38] focus:ring-[#586c38]"
                    />
                    <label htmlFor="standard_shipping" className="text-sm font-medium text-stone-800 cursor-pointer">
                      Standard Express Delivery (3-5 business days)
                    </label>
                  </div>
                  <span className="text-sm font-semibold text-[#586c38]">FREE</span>
                </div>
              </section>

              {/* 4. Payment Options */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-stone-900">Payment</h2>
                  <span className="text-xs text-stone-500">All transactions are secure and encrypted</span>
                </div>

                <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-200">
                  {/* Option 1: Razorpay Online Payment */}
                  <div className={`p-4 ${paymentMethod === 'online' ? 'bg-[#fef9ea]/40' : 'bg-white'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment_method"
                          value="online"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                          className="h-4 w-4 text-[#586c38] focus:ring-[#586c38]"
                        />
                        <div>
                          <span className="text-sm font-semibold text-stone-900">
                            Pay Online (Cards / UPI / NetBanking / Wallets)
                          </span>
                          <p className="text-xs text-stone-500">Google Pay, PhonePe, Paytm, Visa, Mastercard & Rupay</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5 opacity-80">
                        <span className="text-[10px] bg-stone-100 font-bold px-1.5 py-0.5 rounded text-stone-700">UPI</span>
                        <span className="text-[10px] bg-stone-100 font-bold px-1.5 py-0.5 rounded text-stone-700">Cards</span>
                        <span className="text-[10px] bg-stone-100 font-bold px-1.5 py-0.5 rounded text-stone-700">NetBanking</span>
                      </div>
                    </label>
                    {paymentMethod === 'online' && (
                      <p className="text-xs text-stone-600 mt-3 pt-3 border-t border-stone-200/80">
                        After clicking &quot;Place Order&quot;, you will be redirected to the secure Razorpay payment gateway to complete your purchase safely.
                      </p>
                    )}
                  </div>

                  {/* Option 2: Cash on Delivery (COD) */}
                  <div className={`p-4 ${paymentMethod === 'cod' ? 'bg-[#fef9ea]/40' : 'bg-white'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="payment_method"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="h-4 w-4 text-[#586c38] focus:ring-[#586c38]"
                        />
                        <div>
                          <span className="text-sm font-semibold text-stone-900">Cash on Delivery (COD)</span>
                          <p className="text-xs text-stone-500">Pay cash upon delivery at your doorstep</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 bg-stone-100 text-stone-700 rounded">
                        Available
                      </span>
                    </label>
                    {paymentMethod === 'cod' && (
                      <p className="text-xs text-stone-600 mt-3 pt-3 border-t border-stone-200/80">
                        Please keep exact cash ready upon arrival of your delivery associate. Our courier team will contact you prior to delivery.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* 5. Billing Address */}
              <section className="mb-8">
                <h2 className="text-lg font-bold text-stone-900 mb-3">Billing Address</h2>
                <div className="border border-stone-200 rounded-lg overflow-hidden divide-y divide-stone-200">
                  {/* Same as shipping option */}
                  <div className={`p-4 ${sameAsShipping ? 'bg-[#fef9ea]/40' : 'bg-white'}`}>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="billing_option"
                        checked={sameAsShipping}
                        onChange={() => setSameAsShipping(true)}
                        className="h-4 w-4 text-[#586c38] focus:ring-[#586c38]"
                      />
                      <span className="text-sm font-medium text-stone-800">Same as shipping address</span>
                    </label>
                  </div>

                  {/* Different billing address option */}
                  <div className={`p-4 ${!sameAsShipping ? 'bg-[#fef9ea]/40' : 'bg-white'}`}>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="billing_option"
                        checked={!sameAsShipping}
                        onChange={() => setSameAsShipping(false)}
                        className="h-4 w-4 text-[#586c38] focus:ring-[#586c38]"
                      />
                      <span className="text-sm font-medium text-stone-800">Use a different billing address</span>
                    </label>

                    {!sameAsShipping && (
                      <div className="mt-4 pt-4 border-t border-stone-200 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-stone-700 mb-1">First name *</label>
                            <input
                              type="text"
                              name="firstName"
                              value={billingAddress.firstName}
                              onChange={handleBillingChange}
                              className={`w-full px-3 py-2 text-sm rounded border ${
                                errors.billing_firstName ? 'border-red-500' : 'border-stone-300'
                              } focus:ring-1 focus:ring-[#586c38]`}
                            />
                            {errors.billing_firstName && (
                              <p className="text-red-500 text-xs mt-1">{errors.billing_firstName}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-700 mb-1">Last name *</label>
                            <input
                              type="text"
                              name="lastName"
                              value={billingAddress.lastName}
                              onChange={handleBillingChange}
                              className={`w-full px-3 py-2 text-sm rounded border ${
                                errors.billing_lastName ? 'border-red-500' : 'border-stone-300'
                              } focus:ring-1 focus:ring-[#586c38]`}
                            />
                            {errors.billing_lastName && (
                              <p className="text-red-500 text-xs mt-1">{errors.billing_lastName}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-stone-700 mb-1">Billing Address *</label>
                          <input
                            type="text"
                            name="address"
                            value={billingAddress.address}
                            onChange={handleBillingChange}
                            className={`w-full px-3 py-2 text-sm rounded border ${
                              errors.billing_address ? 'border-red-500' : 'border-stone-300'
                            } focus:ring-1 focus:ring-[#586c38]`}
                          />
                          {errors.billing_address && (
                            <p className="text-red-500 text-xs mt-1">{errors.billing_address}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-stone-700 mb-1">City *</label>
                            <input
                              type="text"
                              name="city"
                              value={billingAddress.city}
                              onChange={handleBillingChange}
                              className={`w-full px-3 py-2 text-sm rounded border ${
                                errors.billing_city ? 'border-red-500' : 'border-stone-300'
                              } focus:ring-1 focus:ring-[#586c38]`}
                            />
                            {errors.billing_city && (
                              <p className="text-red-500 text-xs mt-1">{errors.billing_city}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-700 mb-1">State *</label>
                            <select
                              name="state"
                              value={billingAddress.state}
                              onChange={handleBillingChange}
                              className="w-full px-3 py-2 text-sm rounded border border-stone-300 focus:ring-1 focus:ring-[#586c38] bg-white"
                            >
                              {INDIAN_STATES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-700 mb-1">PIN Code *</label>
                            <input
                              type="text"
                              maxLength="6"
                              name="pincode"
                              value={billingAddress.pincode}
                              onChange={handleBillingChange}
                              className={`w-full px-3 py-2 text-sm rounded border ${
                                errors.billing_pincode ? 'border-red-500' : 'border-stone-300'
                              } focus:ring-1 focus:ring-[#586c38]`}
                            />
                            {errors.billing_pincode && (
                              <p className="text-red-500 text-xs mt-1">{errors.billing_pincode}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Submit CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link to="/cart" className="text-xs sm:text-sm text-[#586c38] hover:underline flex items-center space-x-1">
                  <span>← Return to cart</span>
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#586c38] text-white text-sm font-semibold rounded hover:bg-[#47572d] transition-all duration-200 shadow-sm flex items-center justify-center space-x-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{paymentMethod === 'online' ? 'Connecting Gateway...' : 'Processing Order...'}</span>
                    </>
                  ) : (
                    <span>
                      {paymentMethod === 'online' ? 'Proceed to Pay' : 'Place Order'} • {formatPrice(grandTotal)}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary (Desktop Sticky Sidebar): 5 Cols */}
          <div className="hidden lg:block lg:col-span-5 bg-[#fafafa] border border-stone-200 rounded-xl p-6 sm:p-8 sticky top-24">
            <h2 className="text-base font-bold text-stone-900 mb-6">Order Summary</h2>

            {/* Cart item list */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 divide-y divide-stone-100">
              {cart.map((item) => (
                <div key={item.key} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3.5">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded-md border border-stone-200 bg-white"
                      />
                      <span className="absolute -top-2 -right-2 bg-stone-700 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-stone-900 line-clamp-2 leading-snug">{item.title}</p>
                      {item.variant && <p className="text-xs text-stone-500 mt-0.5">{item.variant}</p>}
                    </div>
                  </div>
                  <span className="font-semibold text-stone-900 flex-shrink-0 ml-4">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Discount Code Input Box */}
            <div className="mt-6 pt-6 border-t border-stone-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Discount code (e.g. LEAF10)"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setDiscountError('');
                  }}
                  className="flex-1 px-3.5 py-2.5 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-[#586c38] focus:border-[#586c38] uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={discountLoading}
                  className="px-5 py-2.5 bg-[#586c38] text-white text-xs font-semibold rounded hover:bg-[#46562d] transition"
                >
                  {discountLoading ? '...' : 'Apply'}
                </button>
              </div>

              {discountError && <p className="text-red-500 text-xs mt-1.5">{discountError}</p>}

              {appliedDiscount && (
                <div className="mt-3 flex items-center justify-between bg-green-50 border border-green-200/60 text-[#586c38] px-3 py-2 rounded text-xs">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="font-semibold">{appliedDiscount.code} ({appliedDiscount.label})</span>
                  </div>
                  <button
                    onClick={handleRemoveDiscount}
                    className="text-stone-400 hover:text-stone-700 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="mt-6 pt-6 border-t border-stone-200 space-y-3 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-stone-900">{formatPrice(cartSubtotal)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-[#586c38] font-medium">
                  <span>Discount ({appliedDiscount.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <span>Shipping</span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider">(Standard)</span>
                </span>
                <span className="text-[#586c38] font-semibold uppercase text-xs tracking-wider">Free</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 text-lg pt-4 border-t border-stone-200">
                <span>Total</span>
                <div className="text-right">
                  <span className="text-xs text-stone-500 font-normal mr-1.5">INR</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 pt-6 border-t border-stone-200 grid grid-cols-2 gap-3 text-[11px] text-stone-500">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-[#586c38] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>100% Authentic Ayurveda</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-[#586c38] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Encrypted & Safe Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
