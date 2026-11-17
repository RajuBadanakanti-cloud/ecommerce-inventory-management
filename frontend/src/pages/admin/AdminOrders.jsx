import { useState, useEffect } from 'react';
import axiosInstance from "../../api/axiosInstance";
import {
  RefreshCw,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Toast notification
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success"
  });

  // SHOW TOAST
  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type
    });
  };

  // AUTO HIDE TOAST
  useEffect(() => {
    if (!toast.show) return;

    const timer = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false
      }));
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // GET ALL ORDERS
  const fetchOrders = async () => {
    try {
      setRefreshing(true);

      const response = await axiosInstance.get('/orders');

      const data = response.data;

      setOrders(data.orders || []);

    } catch (err) {
      console.error("Fetch Orders Error:", err);

      showToast(
        err.response?.data?.message || "Failed to fetch orders",
        "error"
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // HANDLE STATUS CHANGE
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);

      await axiosInstance.put(`/orders/${orderId}/status`, {
        status: newStatus
      });

      await fetchOrders();

      showToast(
        `Order status updated to ${newStatus}`,
        "success"
      );

    } catch (err) {
      console.error("Update Order Status Error:", err);

      // Restore the previous status in the UI
      await fetchOrders();

      showToast(
        err.response?.data?.message || "Failed to update order status",
        "error"
      );

    } finally {
      setUpdatingOrderId(null);
    }
  };

  // FORMAT PRICE
  const formatPrice = (amountInPaise) => {
    return (amountInPaise / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div
          className={`fixed right-5 top-5 z-50 flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
          role="status"
        >
          {toast.type === "success" ? (
            <CheckCircle size={20} className="shrink-0" />
          ) : (
            <AlertCircle size={20} className="shrink-0" />
          )}

          <p className="flex-1 text-sm font-semibold">
            {toast.message}
          </p>

          <button
            type="button"
            onClick={() =>
              setToast((prev) => ({ ...prev, show: false }))
            }
            className="shrink-0 rounded-lg p-1 hover:bg-black/5"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="flex items-center gap-2.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            <Package className="text-blue-600 shrink-0" size={28} />
            Customer Orders Management
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Track and progress order fulfillment lifecycles
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 self-start sm:self-auto"
          type="button"
        >
          <RefreshCw
            size={15}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh Orders"}
        </button>

      </div>

      {/* ORDERS CONTAINER */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">

        {/* LOADING STATE */}
        {loading && (
          <div className="py-16 text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-blue-600"
            />
            <p className="mt-3 text-sm font-medium text-slate-500">
              Loading customer orders...
            </p>
          </div>
        )}

        {/* MOBILE & TABLET CARD VIEW (< 768px) */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {orders.map((o) => (
              <div key={o._id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <strong className="font-bold text-slate-900 text-sm block">{o.orderNumber}</strong>
                    <span className="text-[11px] text-slate-400">{new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                      o.paymentStatus === 'paid'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : o.paymentStatus === 'failed'
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : 'border-amber-200 bg-amber-50 text-amber-700'
                    }`}
                  >
                    {o.paymentStatus === 'paid' ? <ShieldCheck size={11} /> : <Clock size={11} />}
                    {o.paymentStatus}
                  </span>
                </div>

                <div className="text-xs space-y-1 py-1 border-y border-slate-200/60">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer:</span>
                    <strong className="text-slate-800">{o.user?.name || 'Customer'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Items:</span>
                    <span className="font-medium text-slate-700">{o.items?.length || 0} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Amount:</span>
                    <strong className="font-extrabold text-slate-950">₹{formatPrice(o.totalAmountInPaise || 0)}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-600">Status:</span>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={o.orderStatus}
                      disabled={
                        updatingOrderId === o._id ||
                        o.orderStatus === 'cancelled' ||
                        o.orderStatus === 'delivered' ||
                        o.paymentStatus !== 'paid'
                      }
                      onChange={(e) =>
                        handleStatusChange(o._id, e.target.value)
                      }
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      {o.orderStatus === 'cancelled' && (
                        <option value="cancelled" disabled>
                          Cancelled
                        </option>
                      )}
                    </select>

                    {updatingOrderId === o._id && (
                      <RefreshCw size={14} className="animate-spin text-blue-600" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DESKTOP TABLE VIEW (>= 768px) */}
        {!loading && orders.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-4 font-bold">Order Number</th>
                  <th className="pb-4 font-bold">Customer</th>
                  <th className="pb-4 font-bold">Items</th>
                  <th className="pb-4 font-bold">Total</th>
                  <th className="pb-4 font-bold">Payment</th>
                  <th className="pb-4 font-bold">Order Lifecycle Status</th>
                  <th className="pb-4 text-right font-bold">Placed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map((o) => (
                  <tr
                    key={o._id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="py-4">
                      <strong className="font-bold text-slate-900">
                        {o.orderNumber}
                      </strong>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-slate-900">
                        {o.user?.name || 'Customer'}
                      </div>
                      <div className="text-xs font-medium text-slate-400">
                        {o.user?.email}
                      </div>
                    </td>
                    <td className="py-4 font-medium text-slate-700">
                      {o.items?.length || 0} items
                    </td>
                    <td className="py-4">
                      <strong className="font-extrabold text-slate-950">
                        ₹{formatPrice(o.totalAmountInPaise || 0)}
                      </strong>
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                          o.paymentStatus === 'paid'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : o.paymentStatus === 'failed'
                            ? 'border-rose-200 bg-rose-50 text-rose-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        {o.paymentStatus === 'paid' ? (
                          <ShieldCheck size={13} />
                        ) : (
                          <Clock size={13} />
                        )}
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {o.orderStatus === 'delivered' ? (
                          <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                        ) : o.orderStatus === 'shipped' ? (
                          <Truck size={16} className="shrink-0 text-blue-600" />
                        ) : o.orderStatus === 'cancelled' ? (
                          <XCircle size={16} className="shrink-0 text-rose-600" />
                        ) : (
                          <Clock size={16} className="shrink-0 text-amber-600" />
                        )}

                        <select
                          value={o.orderStatus}
                          disabled={
                            updatingOrderId === o._id ||
                            o.orderStatus === 'cancelled' ||
                            o.orderStatus === 'delivered' ||
                            o.paymentStatus !== 'paid'
                          }
                          onChange={(e) =>
                            handleStatusChange(o._id, e.target.value)
                          }
                          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          {o.orderStatus === 'cancelled' && (
                            <option value="cancelled" disabled>
                              Cancelled
                            </option>
                          )}
                        </select>

                        {updatingOrderId === o._id && (
                          <RefreshCw size={14} className="animate-spin text-blue-600" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right text-xs font-medium text-slate-400">
                      {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && orders.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">
            No customer orders found.
          </div>
        )}

      </div>

    </div>
  );
}