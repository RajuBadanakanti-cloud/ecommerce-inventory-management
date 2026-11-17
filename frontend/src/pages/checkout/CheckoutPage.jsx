import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  Truck,
  Lock,
  ArrowRight,
  MapPin,
  Navigation,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Receipt,
  PackageOpen
} from 'lucide-react';

import axiosInstance from "../../api/axiosInstance"

export default function CheckoutPage() {
  const { cart, loading: cartLoading } = useCart();
  const { user, loading: authLoading } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const couponCode = location.state?.couponCode || '';

  // Shipping address form state initialized with user details
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    phone: '9876543210',
    countryCode: '+91',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [submitting, setSubmitting] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [error, setError] = useState('');

  // Geolocation detection handler for automatic address autofill
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setDetectingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          if (!response.ok) {
            throw new Error('Location lookup failed');
          }

          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;

            setAddress((prev) => ({
              ...prev,
              addressLine1:
                `${addr.road || addr.suburb || ''} ${addr.neighbourhood || ''}`.trim() ||
                data.display_name.split(',')[0],
              city:
                addr.city ||
                addr.town ||
                addr.village ||
                addr.state_district ||
                '',
              state: addr.state || '',
              postalCode: addr.postcode || '',
              country: addr.country || 'India'
            }));

            setLocationSuccess(true);
            setTimeout(() => setLocationSuccess(false), 4000);
          } else {
            throw new Error('Unable to retrieve address details');
          }
        } catch (err) {
          console.error('Geocoding error:', err);
          setError('Failed to fetch address details. Please enter manually.');
        } finally {
          setDetectingLocation(false);
        }
      },
      (err) => {
        console.error(err);
        setDetectingLocation(false);
        setError('Permission denied or location unavailable. Please enter address manually.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Order submission and navigation handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      const formattedAddress = {
        fullName: address.fullName.trim(),
        phone: `${address.countryCode} ${address.phone}`.trim(),
        addressLine1: address.addressLine1.trim(),
        city: address.city.trim(),
        state: address.state.trim(),
        postalCode: address.postalCode.trim(),
        country: address.country.trim()
      };

      console.log("Payment Method: ", paymentMethod)
      const response = await axiosInstance.post('/orders', {
        shippingAddress: formattedAddress,
        couponCode: couponCode || undefined,
        paymentMethod
      });

      const order = response.data;

      if (!order?._id) {
        throw new Error('Order was created but order details were not received');
      }

      navigate(`/payment/${order._id}`, {
        state: { order }
      });

    } catch (err) {
      console.error('Order creation error:', err);

      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to create your order. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 text-center">
        <p className="text-base sm:text-lg font-semibold text-slate-600">
          Loading checkout...
        </p>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          No items to checkout
        </h2>

        <Link
          to="/products"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all"
        >
          Go to Store
        </Link>
      </div>
    );
  }

  // Calculation for subtotal, taxes, and rounded integer total amount with promotional adjustment
  const gstAmount = Math.round((cart.subtotal * 0.05) / 100);
  const rawTotal = cart.subtotal / 100 + gstAmount;
  const totalAmount = Math.round(rawTotal);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-6 sm:mb-8">
        Complete Your Order
      </h1>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 mb-6 sm:mb-8 text-xs sm:text-sm text-rose-700 shadow-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {locationSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 mb-6 sm:mb-8 text-xs sm:text-sm text-emerald-700 shadow-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>Location successfully detected and autofilled from GPS!</span>
        </div>
      )}

      <form
        id="checkout-form"
        onSubmit={handlePlaceOrder}
        className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start"
      >
        {/* Shipping Address and Payment Options Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 lg:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck size={20} className="text-blue-600 shrink-0" />
                Shipping Address
              </h2>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={detectingLocation}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 transition-all border border-blue-200 shadow-sm disabled:opacity-60 self-start sm:self-auto"
              >
                <Navigation
                  size={14}
                  className={detectingLocation ? 'animate-spin' : ''}
                />
                {detectingLocation ? 'Detecting Location...' : 'Detect Current Location'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={address.fullName}
                  onChange={(e) =>
                    setAddress({ ...address, fullName: e.target.value })
                  }
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Contact Phone
                </label>
                <div className="flex gap-2">
                  <select
                    value={address.countryCode}
                    onChange={(e) =>
                      setAddress({ ...address, countryCode: e.target.value })
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-3 text-xs font-bold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+971">+971 (AE)</option>
                    <option value="+65">+65 (SG)</option>
                  </select>

                  <input
                    type="tel"
                    required
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Street / Flat / Area
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-slate-400">
                  <MapPin size={16} />
                </span>
                <input
                  type="text"
                  required
                  value={address.addressLine1}
                  onChange={(e) =>
                    setAddress({ ...address, addressLine1: e.target.value })
                  }
                  placeholder="e.g. 402, Lotus Tech Park, Link Road"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  placeholder="Mumbai"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={address.state}
                  onChange={(e) =>
                    setAddress({ ...address, state: e.target.value })
                  }
                  placeholder="Maharashtra"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Postal / PIN Code
                </label>
                <input
                  type="text"
                  required
                  value={address.postalCode}
                  onChange={(e) =>
                    setAddress({ ...address, postalCode: e.target.value })
                  }
                  placeholder="400069"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 lg:p-8 shadow-sm">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-5 sm:mb-6 flex items-center gap-2">
              <Lock size={20} className="text-blue-600 shrink-0" />
              Payment Gateway Method
            </h2>

            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center gap-3.5 rounded-xl border border-slate-200 p-4 transition-all hover:border-blue-500 hover:bg-blue-50/20">
                <input
                  type="radio"
                  name="pay"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                    Credit / Debit Card Secure Checkout
                  </strong>
                  <span className="text-[11px] sm:text-xs text-slate-500">
                    Instant secure payment verification via encrypted gateway
                  </span>
                </div>
              </label>

              <label className="flex cursor-pointer items-center gap-3.5 rounded-xl border border-slate-200 p-4 transition-all hover:border-blue-500 hover:bg-blue-50/20">
                <input
                  type="radio"
                  name="pay"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0"
                />
                <div>
                  <strong className="text-xs sm:text-sm font-bold text-slate-900 block">
                    UPI / QR Code Payment
                  </strong>
                  <span className="text-[11px] sm:text-xs text-slate-500">
                    Pay securely using Google Pay, PhonePe, Paytm, or BHIM
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary & Billing Sidebar */}
        <div className="lg:col-span-5 h-fit rounded-3xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50/60 p-5 sm:p-6 lg:p-8 shadow-xl shadow-slate-950/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500" />

          <div className="flex items-center justify-between mb-5 pt-1">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Receipt size={20} className="text-blue-600 shrink-0" />
              Order Summary
            </h2>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200/60 shrink-0">
              <PackageOpen size={13} />
              {cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          <div className="flex max-h-64 flex-col gap-3 overflow-y-auto mb-5 pr-1 divide-y divide-slate-100">
            {cart.items.map((i) => (
              <div
                key={i._id}
                className="flex items-center justify-between pt-3 first:pt-0 text-xs sm:text-sm"
              >
                <div className="flex items-center gap-3 pr-4 min-w-0">
                  <img
                    src={
                      i.product.image ||
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
                    }
                    alt={i.product.name}
                    className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl object-cover border border-slate-200 shrink-0 shadow-sm"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">
                      {i.product.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block mt-0.5">
                      Qty: {i.quantity}
                    </span>
                  </div>
                </div>

                <strong className="font-extrabold text-slate-900 whitespace-nowrap">
                  ₹{(i.itemTotal / 100).toLocaleString('en-IN')}
                </strong>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/80 p-4 mb-5 shadow-sm space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>Items Subtotal</span>
              <span className="font-bold text-slate-900">
                ₹{(cart.subtotal / 100).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>

            <div className="flex justify-between text-slate-600 font-medium">
              <span>Estimated Shipping</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>

            <div className="flex justify-between text-slate-600 font-medium">
              <span>Estimated Taxes & GST (5%)</span>
              <span className="font-bold text-slate-900">
                ₹{gstAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>

            <div className="flex justify-between text-slate-600 font-medium border-t border-slate-100 pt-2">
              <span>Total Amount</span>
              <span className="font-bold text-slate-900">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
           {/* Coupons */}     
          <div className="border-t border-slate-200/80 pt-4 mb-5">
            {couponCode && (
              <div className="mb-3 rounded-xl border border-green-400 bg-green-200 px-3.5 py-2.5 text-xs font-semibold text-green-900 flex items-center gap-2 shadow-sm">
                <Tag size={14} className="text-green-800 shrink-0" />
                <span>
                  Coupon Applied: <strong className="font-bold">{couponCode}</strong>
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-blue-50/50 border border-blue-100 rounded-xl p-3">
              <ShieldCheck size={16} className="text-blue-600 shrink-0" />
              <span>
                Secure checkout. Final totals and live inventory validation occur securely on the server.
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || cart.items.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-500 transition-all disabled:opacity-60 active:scale-[0.99]"
          >
            {submitting ? 'Creating Order...' : 'Confirm & Proceed to Pay'}
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}