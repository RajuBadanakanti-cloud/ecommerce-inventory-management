import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  Ticket,
  Plus,
  Trash2,
  X,
  Loader2,
  CalendarDays,
  Tag,
  Sparkles,
  Percent,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscount: 500,
    expiryDate: "2026-12-31",
    usageLimit: 100,
  });

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  // GET ALL COUPONS
  const fetchCoupons = async () => {
    try {
      const response = await axiosInstance.get("/coupons");
      const data = response.data;
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Unable to fetch coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // CREATE NEW COUPON
  const handleCreate = async (e) => {
    e.preventDefault();
    if (creating) return;

    setCreating(true);
    try {
      await axiosInstance.post("/coupons", newCoupon);
      setShowModal(false);
      await fetchCoupons();
      showToast("success", "Coupon created successfully!");
    } catch (err) {
      showToast("error", err.response?.data?.message || err.message || "Unable to create coupon.");
    } finally {
      setCreating(false);
    }
  };

  // DELETE COUPON
  const handleDelete = async () => {
    if (!couponToDelete || deletingId) return;

    const id = couponToDelete._id;
    setDeletingId(id);
    try {
      await axiosInstance.delete(`/coupons/${id}`);
      setCoupons((currentCoupons) => currentCoupons.filter((coupon) => coupon._id !== id));
      setCouponToDelete(null);
      showToast("success", "Coupon deleted successfully.");
    } catch (err) {
      showToast("error", err.response?.data?.message || err.message || "Unable to delete coupon.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const CouponDetails = ({ coupon }) => (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 px-3 py-2 shadow-sm">
          <Ticket size={14} className="text-blue-600" />
          <code className="font-mono text-sm font-extrabold tracking-wider text-blue-800">
            {coupon.code}
          </code>
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            coupon.discountType === "percentage"
              ? "bg-violet-100 text-violet-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {coupon.discountType === "percentage"
            ? `${coupon.discountValue}% OFF`
            : `₹${coupon.discountValue} OFF`}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <p className="text-xs font-medium text-slate-400">Minimum order</p>
          <p className="mt-1 font-semibold text-slate-800">₹{coupon.minOrderAmount}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Maximum discount</p>
          <p className="mt-1 font-semibold text-slate-800">
            {coupon.maxDiscount ? `₹${coupon.maxDiscount}` : "No cap"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Used / Limit</p>
          <p className="mt-1 font-semibold text-slate-800">
            {coupon.usedCount} / {coupon.usageLimit}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Expires</p>
          <p className="mt-1 font-semibold text-slate-800">{formatDate(coupon.expiryDate)}</p>
        </div>
      </div>
    </>
  );

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* TOAST POPUP */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-4 z-10000 flex w-[calc(100%-2rem)] max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-2xl ${
            toast.type === "success"
              ? "border-emerald-200 bg-white"
              : "border-rose-200 bg-white"
          }`}
        >
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900">
              {toast.type === "success" ? "Success" : "Something went wrong"}
            </p>
            <p className="mt-1 wrap-break-words text-sm leading-5 text-slate-600">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Dismiss notification"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* PAGE HEADER */}
      <div className="mb-7 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles size={13} />
            Promotions & offers
          </div>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Ticket size={22} />
            </span>
            Promotional Coupons
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Create and manage discount codes for your customers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:w-auto"
        >
          <Plus size={18} />
          Create New Coupon
        </button>
      </div>

      {/* SUMMARY */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Ticket size={19} />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500">Total coupons</p>
            <p className="text-xl font-extrabold text-slate-900">{coupons.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <Percent size={19} />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-500">Discount campaigns</p>
            <p className="text-xl font-extrabold text-slate-900">{coupons.length}</p>
          </div>
        </div>
      </div>

      {/* COUPON LIST */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-100 px-4 py-4 sm:px-6">
          <h2 className="font-bold text-slate-900">All coupons</h2>
          <p className="text-xs text-slate-500">Review discount details and usage limits</p>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center">
            <Loader2 className="mb-3 animate-spin text-blue-600" size={34} />
            <p className="text-sm font-semibold text-slate-700">Loading coupons...</p>
            <p className="mt-1 text-xs text-slate-400">Please wait while we fetch your coupons.</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Ticket size={25} />
            </span>
            <h3 className="font-bold text-slate-800">No coupons yet</h3>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Create your first promotional coupon to offer discounts to customers.
            </p>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={16} /> Create coupon
            </button>
          </div>
        ) : (
          <>
            {/* MOBILE COUPON CARDS */}
            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:hidden">
              {coupons.map((coupon) => (
                <article
                  key={coupon._id}
                  className="relative overflow-hidden rounded-2xl border border-blue-100 bg-linear-to-br from-white via-white to-blue-50/70 p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                >
                  <div className="absolute -right-7 -top-7 h-20 w-20 rounded-full bg-blue-100/60" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <CouponDetails coupon={coupon} />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCouponToDelete(coupon)}
                      disabled={deletingId === coupon._id}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Delete coupon"
                      aria-label={`Delete coupon ${coupon.code}`}
                    >
                      {deletingId === coupon._id ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                  <div className="relative mt-4 flex items-center gap-2 border-t border-blue-100 pt-3 text-xs text-slate-500">
                    <CalendarDays size={14} />
                    Expires {formatDate(coupon.expiryDate)}
                  </div>
                </article>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Coupon code</th>
                    <th className="px-4 py-4">Discount</th>
                    <th className="px-4 py-4">Min order</th>
                    <th className="px-4 py-4">Max discount</th>
                    <th className="px-4 py-4">Used / limit</th>
                    <th className="px-4 py-4">Expires</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="transition hover:bg-blue-50/40">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                          <Ticket size={14} className="text-blue-600" />
                          <code className="font-mono text-xs font-extrabold tracking-wider text-blue-800">
                            {coupon.code}
                          </code>
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-700">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}%`
                          : `₹${coupon.discountValue} Flat`}
                      </td>
                      <td className="px-4 py-4 text-slate-600">₹{coupon.minOrderAmount}</td>
                      <td className="px-4 py-4 text-slate-600">
                        {coupon.maxDiscount ? `₹${coupon.maxDiscount}` : "No cap"}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {coupon.usedCount} / {coupon.usageLimit}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                        {formatDate(coupon.expiryDate)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setCouponToDelete(coupon)}
                          disabled={deletingId === coupon._id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete coupon"
                          aria-label={`Delete coupon ${coupon.code}`}
                        >
                          {deletingId === coupon._id ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <Trash2 size={17} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* CREATE COUPON MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-9998 flex items-end justify-center bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !creating) setShowModal(false);
          }}
        >
          <div className="relative max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              disabled={creating}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              aria-label="Close modal"
            >
              <X size={19} />
            </button>

            <div className="mb-6 pr-10">
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Tag size={20} />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                Create promo coupon
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Set up a discount code for your customers.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Coupon code
                </label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. FESTIVE20"
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-semibold uppercase text-slate-950 outline-none transition placeholder:normal-case placeholder:font-normal focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Discount type
                  </label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, discountType: e.target.value })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Discount value
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newCoupon.discountValue}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Minimum order (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Maximum discount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCoupon.maxDiscount}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, maxDiscount: Number(e.target.value) })
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Expiry date
                </label>
                <input
                  type="date"
                  required
                  value={newCoupon.expiryDate}
                  onChange={(e) =>
                    setNewCoupon({ ...newCoupon, expiryDate: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                  className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {creating ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Save coupon
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION POPUP */}
      {couponToDelete && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle size={23} />
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">Delete this coupon?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono font-bold text-blue-700">
                {couponToDelete.code}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCouponToDelete(null)}
                disabled={Boolean(deletingId)}
                className="min-h-10 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={Boolean(deletingId)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {deletingId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete coupon
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
