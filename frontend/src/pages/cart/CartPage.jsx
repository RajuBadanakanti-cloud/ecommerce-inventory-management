import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, CheckCircle, LoaderCircle, AlertTriangle, X } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // State for Clear Cart confirmation modal & Pop-up alerts
  const [showClearModal, setShowClearModal] = useState(false);
  const [popupAlert, setPopupAlert] = useState({ show: false, message: '', type: 'success' });

  // Auto-hide popup alerts
  useEffect(() => {
    if (!popupAlert.show) return;
    const timer = setTimeout(() => {
      setPopupAlert((prev) => ({ ...prev, show: false }));
    }, 4000);
    return () => clearTimeout(timer);
  }, [popupAlert]);

  if (!user) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 sm:px-6 sm:py-32 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Your Shopping Cart is Waiting</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">Please login to view or checkout your items.</p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all"
        >
          Login Now
        </Link>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 sm:px-6 sm:py-32 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mb-2">Your Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all"
        >
          Discover Products
        </Link>
      </div>
    );
  }

  // COUPON APPLYING >>>
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    try {
      const res = await axiosInstance.get(`/coupons/validate/${couponCode.trim()}?subtotal=${cart.subtotal}`);
      setAppliedCoupon(res.data);

      setPopupAlert({ show: true, message: `Coupon code '${res.data.code}' applied successfully!`, type: 'success' });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Invalid coupon code';
      setCouponError(errMsg);
      setAppliedCoupon(null);
      setPopupAlert({ show: true, message: errMsg, type: 'error' });
    } finally {
      setValidatingCoupon(false);
    }
  };

  // CLEAR CART>>>
  const handleConfirmClear = async () => {
    await clearCart();
    setShowClearModal(false);
    setPopupAlert({ show: true, message: 'Your shopping cart has been cleared.', type: 'success' });
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = cart.subtotal > 1500 ? 0 : 99;
  const taxAmount = Math.round((cart.subtotal - discountAmount) * 0.05);
  const totalAmount = Math.max(0, cart.subtotal - discountAmount + shippingFee + taxAmount);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* POP-UP ALERT NOTIFICATION */}
      {popupAlert.show && (
        <div className={`fixed right-4 top-4 sm:right-6 sm:top-6 z-9999 flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3.5 shadow-xl transition-all animate-bounce-short ${
          popupAlert.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-rose-200 bg-rose-50 text-rose-900'
        }`}>
          {popupAlert.type === 'success' ? <CheckCircle size={20} className="text-emerald-600 shrink-0" /> : <AlertTriangle size={20} className="text-rose-600 shrink-0" />}
          <p className="flex-1 text-xs sm:text-sm font-bold">{popupAlert.message}</p>
          <button onClick={() => setPopupAlert(prev => ({ ...prev, show: false }))} className="p-1 rounded-lg hover:bg-black/5 text-slate-500">
            <X size={16} />
          </button>
        </div>
      )}

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-6 sm:mb-8">
        Shopping Cart ({cart.itemCount} items)
      </h1>

      {/* Cart Items and loader */}
      {loading ? (
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
          <LoaderCircle size={42} className="animate-spin text-blue-600" />
          <p className="text-xs sm:text-sm text-slate-500 mt-4 font-medium">Loading Your Cart Items...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">

          {/* Cart Items List */}
          <div className="lg:col-span-2">
            <div className="flex flex-col gap-3.5 sm:gap-4">
              {cart.items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm overflow-x-auto"
                >
                  {/* image & info */}
                  <div className="flex items-center gap-3.5 w-full sm:w-auto min-w-0">
                    <img
                      src={item.product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'}
                      alt={item.product.name}
                      className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product._id}`}>
                        <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 truncate hover:text-blue-600 transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                        SKU: <strong className="font-semibold text-slate-600">{item.product.sku}</strong>
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 sm:hidden">
                        ₹{(item.unitPrice / 100).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Prices */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-3 sm:gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="hidden sm:block text-xs sm:text-sm font-extrabold text-slate-900 w-20">
                      ₹{(item.unitPrice / 100).toLocaleString('en-IN')}
                    </div>

                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-sm shrink-0">
                      <button
                        onClick={() => updateQuantity(item._id, Math.max(0, item.quantity - 1))}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-slate-600 hover:bg-slate-100 transition-colors"
                        type="button"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-900 bg-white border-x border-slate-200">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1, item.product.stock)}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-slate-600 hover:bg-slate-100 transition-colors"
                        type="button"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Item total */}
                    <div className="text-xs sm:text-sm font-extrabold text-slate-950 w-20 text-right">
                      ₹{(item.itemTotal / 100).toLocaleString('en-IN')}
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                      title="Remove item"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                ← Continue Shopping
              </Link>
              <button
                onClick={() => setShowClearModal(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                type="button"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 lg:p-8 shadow-sm h-fit">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-5 sm:mb-6">Order Summary</h2>

            <form id="cart-summary-order" onSubmit={handleApplyCoupon} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-3 text-slate-400">
                  <Tag size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Promo code (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={validatingCoupon}
                className="inline-flex items-center justify-center px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 shadow-sm hover:border-blue-600 hover:text-blue-600 transition-all disabled:opacity-60 shrink-0"
              >
                Apply
              </button>
            </form>

            {appliedCoupon && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700 flex items-center gap-2 shadow-sm">
                <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                <span>Code <strong className="font-bold">{appliedCoupon.code}</strong> applied (-₹{(appliedCoupon.discountAmount)/100})</span>
              </div>
            )}

            {couponError && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                {couponError}
              </div>
            )}

            <div className="flex flex-col gap-3 text-xs sm:text-sm border-b border-slate-100 pb-4 mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-medium text-slate-900">₹{(cart.subtotal / 100).toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-₹{(discountAmount / 100).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span>{shippingFee === 0 ? <strong className="font-bold text-emerald-600">FREE</strong> : `₹${(shippingFee / 100).toLocaleString('en-IN')}`}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (5% GST)</span>
                <span className="font-medium text-slate-900">₹{(taxAmount / 100).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-base sm:text-lg font-extrabold tracking-tight text-slate-950 mb-6">
              <span>Total Amount</span>
              <span className="text-lg sm:text-xl text-blue-600">₹{(totalAmount / 100).toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { couponCode: appliedCoupon?.code } })}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 sm:py-4 text-xs sm:text-sm font-semibold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-500 transition-all"
              type="button"
            >
              Proceed to Checkout <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Clear Cart Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center z-9999 p-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl relative text-center">
            <button
              onClick={() => setShowClearModal(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              type="button"
            >
              <X size={18} />
            </button>

            <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
              <AlertTriangle size={24} />
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 mb-2">Clear Shopping Cart?</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Are you sure you want to remove all items from your shopping cart? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="flex-1 px-4 py-2.5 sm:py-3 rounded-xl bg-rose-600 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-500 transition-all"
              >
                Yes, Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}