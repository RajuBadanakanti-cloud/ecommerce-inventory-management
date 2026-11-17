import { useState, useEffect } from 'react';
import axiosInstance from "../../api/axiosInstance"
import { Ticket, Plus, Trash2, X } from 'lucide-react';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscount: 500,
    expiryDate: '2026-12-31',
    usageLimit: 100
  });


  // GET ALL COUPONS >>>
  const fetchCoupons = async () => {
    try {
      const response = await axiosInstance.get('/coupons');
      const data = response.data
      // console.log(data.coupons)
      setCoupons(data.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);


  // CREATE NEW COUPON >>
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/coupons', newCoupon);
      setShowModal(false);
      fetchCoupons();
      alert('Coupon created successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  // DELETE COUPON >>
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await axiosInstance.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err) {
      alert(err.message);
    }
  };


  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl flex items-center gap-3">
            <Ticket className="text-blue-600" size={32} /> Promotional Coupons
          </h1>
          <p className="mt-1 text-sm text-slate-500">Manage discounts and customer promotion codes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all"
        >
          <Plus size={18} /> Create New Coupon
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-4 font-bold">Code</th>
                <th className="pb-4 font-bold">Discount</th>
                <th className="pb-4 font-bold">Min Order</th>
                <th className="pb-4 font-bold">Max Discount</th>
                <th className="pb-4 font-bold">Used / Limit</th>
                <th className="pb-4 font-bold">Expires</th>
                <th className="pb-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {coupons.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4">
                    <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm font-bold text-slate-800">
                      {c.code}
                    </code>
                  </td>
                  <td className="py-4 font-medium text-slate-700">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue} Flat`}
                  </td>
                  <td className="py-4 font-medium text-slate-700">₹{c.minOrderAmount}</td>
                  <td className="py-4 font-medium text-slate-700">{c.maxDiscount ? `₹${c.maxDiscount}` : 'No Cap'}</td>
                  <td className="py-4 font-medium text-slate-700">{c.usedCount} / {c.usageLimit}</td>
                  <td className="py-4 font-medium text-slate-700">{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors inline-flex items-center justify-center"
                      title="Delete coupon"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-slate-400">
                    No promotional coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center z-9999 p-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 w-full max-w-120 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              type="button"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 mb-6">Create Promo Coupon</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FESTIVE20"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Min Order (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrderAmount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.maxDiscount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}