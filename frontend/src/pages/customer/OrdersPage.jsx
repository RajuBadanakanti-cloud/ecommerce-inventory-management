import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trash2,
  ShoppingBag,
  X,
  LoaderCircle,
  CheckCircle2,
  ArrowRight,
  CreditCard
} from 'lucide-react';

// ==========================================
// PRICE HELPERS
// ==========================================

// Convert Paise into Indian Rupees
const formatPaise = (amount = 0) => {
  return (Number(amount || 0) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Format values already stored in Rupees
const formatRupees = (amount = 0) => {
  return Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// ORDERS PAGE <<<<<<<<<<<<
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cancellingId, setCancellingId] = useState(null);
  const [hidingId, setHidingId] = useState(null);

  // Confirmation modal
  const [modal, setModal] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);

  // GET MY ORDERS >>>>>>>>>>>>>>>>>>>>>>
  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/orders/my-orders');

      const data = response.data;

      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);

      showToast(
        'error',
        err.response?.data?.message || 'Unable to load your orders.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // TOAST NOTIFICATION >>>>>>>>>>>>>>>>>>>>>>>
  const showToast = (type, message) => {
    setToast({ type, message });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // OPEN CONFIRMATION MODAL >>>>>>>>>>>>>>>>>>>>
  const openModal = (type, order) => {
    setModal({ type, order });
  };

  // close >>>>>>>>>>>>>
  const closeModal = () => {
    if (cancellingId || hidingId) return;

    setModal(null);
  };

  // CANCEL ORDER >>>>>>>>>>>>>>>>>.
  const handleCancelOrder = async (orderId) => {
    try {
      setCancellingId(orderId);

      const response = await axiosInstance.patch(
        `/orders/${orderId}/cancel`,
        {
          reason: 'Customer requested cancellation'
        }
      );

      setModal(null);

      showToast(
        'success',
        response.data?.message || 'Order cancelled successfully.'
      );

      await fetchOrders();

    } catch (err) {
      console.error('Cancel order error:', err);

      setModal(null);

      showToast(
        'error',
        err.response?.data?.message ||
        err.message ||
        'Failed to cancel order.'
      );

    } finally {
      setCancellingId(null);
    }
  };

  // HIDE CANCELLED ORDER >>>>>>>>>>>>>>>.
  const handleHideOrder = async (orderId) => {
    try {
      setHidingId(orderId);

      const response = await axiosInstance.patch(
        `/orders/${orderId}/hide`
      );

      setModal(null);

      showToast(
        'success',
        response.data?.message ||
        'Cancelled order removed from My Orders.'
      );

      await fetchOrders();

    } catch (err) {
      console.error('Hide order error:', err);

      setModal(null);

      showToast(
        'error',
        err.response?.data?.message ||
        err.message ||
        'Failed to remove order.'
      );

    } finally {
      setHidingId(null);
    }
  };

  // ==========================================
  // CONFIRM MODAL ACTION
  // ==========================================

  const handleConfirmAction = () => {
    if (!modal?.order?._id) return;

    if (modal.type === 'cancel') {
      handleCancelOrder(modal.order._id);
    }

    if (modal.type === 'hide') {
      handleHideOrder(modal.order._id);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center py-24 sm:py-32 px-4 text-slate-400">
        <LoaderCircle className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <p className="text-xs sm:text-sm font-semibold text-slate-600">
          Loading your orders...
        </p>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

      {/* ==================================
          TOAST NOTIFICATION
      ================================== */}

      {toast && (
        <div className="fixed right-4 top-4 sm:right-6 sm:top-6 z-100 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-top-3 duration-300">
          <div
            className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-xl ${
              toast.type === 'success'
                ? 'border-emerald-200 text-emerald-900'
                : 'border-rose-200 text-rose-900'
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {toast.type === 'success'
                ? <CheckCircle2 size={21} />
                : <AlertTriangle size={21} />}
            </div>

            <div className="min-w-0 flex-1">
              <h4
                className={`text-xs sm:text-sm font-extrabold ${
                  toast.type === 'success'
                    ? 'text-emerald-800'
                    : 'text-rose-800'
                }`}
              >
                {toast.type === 'success'
                  ? 'Success'
                  : 'Something went wrong'}
              </h4>

              <p className="mt-0.5 wrap-break-words text-[11px] sm:text-xs leading-4 sm:leading-5 text-slate-600">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 shrink-0"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ==================================
          PAGE HEADER
      ================================== */}

      <div className="mb-6 sm:mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-lg w-fit border border-blue-100">
            <ShoppingBag size={14} />
            Your Shopping Activity
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            My Order History
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Track your purchases and manage your orders seamlessly.
          </p>
        </div>

        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 shadow-sm"
        >
          <ShoppingBag size={16} />
          Continue Shopping
        </Link>
      </div>

      {/* ==================================
          EMPTY ORDERS
      ================================== */}

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-5 py-16 sm:py-24 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Package size={32} />
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
            No Orders Found
          </h3>

          <p className="mx-auto mt-1.5 max-w-sm text-xs sm:text-sm leading-5 sm:leading-6 text-slate-500">
            Your ordered products and purchase history will appear here once you place an order.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Start Shopping
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (

        /* ==================================
            ORDERS LIST
        ================================== */

        <div className="flex flex-col gap-5 sm:gap-6">
          {orders.map((o) => {
            const orderStatus = o.orderStatus?.toLowerCase();
            const paymentStatus = o.paymentStatus?.toLowerCase();

            const canCancel =
              orderStatus === 'pending' &&
              paymentStatus !== 'paid';

            const isCancelled = orderStatus === 'cancelled';

            return (
              <div
                key={o._id}
                className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="p-4 sm:p-6 lg:p-8">

                  {/* ORDER HEADER */}
                  <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-100 pb-4 sm:pb-5">
                    <div>
                      <div className="text-[11px] sm:text-xs text-slate-400">
                        Order ID:{' '}
                        <strong className="font-semibold text-slate-900">
                          {o.orderNumber}
                        </strong>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500">
                        <Clock size={13} className="text-slate-400 shrink-0" />
                        <span>Placed on: {new Date(o.createdAt).toLocaleDateString('en-IN')} at {new Date(o.createdAt).toLocaleTimeString('en-IN')}</span>
                      </div>
                    </div>

                    {/* STATUS BADGES */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold ${
                          orderStatus === 'delivered'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : orderStatus === 'cancelled'
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : orderStatus === 'confirmed'
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        {orderStatus === 'delivered' && <CheckCircle size={12} />}
                        {orderStatus === 'cancelled' && <XCircle size={12} />}
                        {orderStatus === 'confirmed' && <CheckCircle size={12} />}
                        {!['delivered', 'cancelled', 'confirmed'].includes(orderStatus) && (
                          <AlertTriangle size={12} />
                        )}
                        Status: {o.orderStatus}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-bold ${
                          paymentStatus === 'paid'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : paymentStatus === 'failed'
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        <CreditCard size={12} />
                        Pay: {o.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* ==================================
                      ORDER ITEMS
                  ================================== */}

                  <div className="mb-5 sm:mb-6 flex flex-col gap-3 sm:gap-4">
                    {(o.items || []).map((item, idx) => {
                      const unitPrice = item.unitPriceInPaise != null
                        ? formatPaise(item.unitPriceInPaise)
                        : item.priceInPaise != null
                        ? formatPaise(item.priceInPaise)
                        : formatRupees(item.price);

                      const itemSubtotal = item.itemTotalInPaise != null
                        ? formatPaise(item.itemTotalInPaise)
                        : item.subtotalInPaise != null
                        ? formatPaise(item.subtotalInPaise)
                        : formatRupees(item.subtotal);

                      return (
                        <div
                          key={item._id || idx}
                          className="flex items-center justify-between gap-3 sm:gap-4 border-b border-slate-50 pb-3 last:border-none last:pb-0"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              src={
                                item.image ||
                                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'
                              }
                              alt={item.name}
                              className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl border border-slate-200 object-cover shadow-sm"
                            />

                            <div className="min-w-0">
                              <div className="truncate text-xs sm:text-sm font-bold text-slate-900">
                                {item.name}
                              </div>
                              <div className="mt-0.5 text-[11px] sm:text-xs text-slate-500">
                                Qty: {item.quantity} × ₹{unitPrice}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 text-xs sm:text-sm font-extrabold text-slate-950">
                            ₹{itemSubtotal}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ==================================
                      PRICE BREAKDOWN
                  ================================== */}

                  <div className="mb-5 sm:mb-6 space-y-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 sm:p-4 text-xs">
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>Items Subtotal</span>
                      <span className="font-bold text-slate-900">
                        ₹{formatPaise(o.subtotalInPaise)}
                      </span>
                    </div>

                    {o.discountInPaise > 0 && (
                      <div className="flex justify-between font-medium text-slate-600">
                        <span>Discount</span>
                        <span className="font-bold text-emerald-600">
                          - ₹{formatPaise(o.discountInPaise)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between font-medium text-slate-600">
                      <span>Shipping Fee</span>
                      <span className="font-bold text-emerald-600">
                        {o.shippingFeeInPaise === 0
                          ? 'FREE'
                          : `₹${formatPaise(o.shippingFeeInPaise)}`}
                      </span>
                    </div>

                    <div className="flex justify-between font-medium text-slate-600">
                      <span>Taxes & GST</span>
                      <span className="font-bold text-slate-900">
                        ₹{formatPaise(o.taxInPaise)}
                      </span>
                    </div>

                    <div className="flex justify-between border-t border-slate-200/80 pt-2.5 font-bold text-slate-900">
                      <span>Total Amount</span>
                      <span>₹{formatPaise(o.totalAmountInPaise)}</span>
                    </div>
                  </div>

                  {/* ==================================
                      ORDER FOOTER / ACTIONS
                  ================================== */}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:pt-5">
                    <div>
                      <span className="mb-0.5 block text-[10px] sm:text-xs font-medium uppercase tracking-wider text-slate-400">
                        Total Paid / Payable
                      </span>
                      <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950">
                        ₹{formatPaise(o.totalAmountInPaise)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                      {paymentStatus === 'pending' && !isCancelled && (
                        <Link
                          to={`/payment/${o._id}`}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 sm:px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
                        >
                          Complete Payment
                        </Link>
                      )}

                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => openModal('cancel', o)}
                          disabled={cancellingId === o._id}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 sm:px-5 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
                        >
                          {cancellingId === o._id
                            ? <LoaderCircle size={15} className="animate-spin" />
                            : <XCircle size={15} />}
                          {cancellingId === o._id
                            ? 'Cancelling...'
                            : 'Cancel Order'}
                        </button>
                      )}

                      {isCancelled && (
                        <button
                          type="button"
                          onClick={() => openModal('hide', o)}
                          disabled={hidingId === o._id}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 sm:px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60 shadow-sm"
                        >
                          {hidingId === o._id
                            ? <LoaderCircle size={15} className="animate-spin" />
                            : <Trash2 size={15} />}
                          {hidingId === o._id
                            ? 'Removing...'
                            : 'Remove from My Orders'}
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================
          CONFIRMATION MODAL
      ================================== */}

      {modal && (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="w-full max-w-sm sm:max-w-md animate-in zoom-in-95 duration-200 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7 text-left"
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
          >
            <div
              className={`mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${
                modal.type === 'cancel'
                  ? 'bg-rose-50 text-rose-600'
                  : 'bg-amber-50 text-amber-600'
              }`}
            >
              {modal.type === 'cancel'
                ? <AlertTriangle size={24} />
                : <Trash2 size={24} />}
            </div>

            <h2
              id="order-modal-title"
              className="text-lg sm:text-xl font-extrabold text-slate-900"
            >
              {modal.type === 'cancel'
                ? 'Cancel This Order?'
                : 'Remove Cancelled Order?'}
            </h2>

            <p className="mt-1.5 text-xs sm:text-sm leading-5 text-slate-500">
              {modal.type === 'cancel'
                ? 'Are you sure you want to cancel this order? This action will update its order status.'
                : 'Are you sure you want to remove this cancelled order from your order history? It will remain safely stored in our database.'}
            </p>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Order Number
              </p>
              <p className="mt-0.5 break-all text-xs sm:text-sm font-bold text-slate-800">
                {modal.order.orderNumber || modal.order._id}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={Boolean(cancellingId || hidingId)}
                className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Keep Order
              </button>

              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={Boolean(cancellingId || hidingId)}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  modal.type === 'cancel'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-slate-800 hover:bg-slate-900'
                }`}
              >
                {cancellingId || hidingId ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : modal.type === 'cancel' ? (
                  <XCircle size={16} />
                ) : (
                  <Trash2 size={16} />
                )}
                {cancellingId || hidingId
                  ? 'Please wait...'
                  : modal.type === 'cancel'
                  ? 'Yes, Cancel Order'
                  : 'Yes, Remove Order'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}