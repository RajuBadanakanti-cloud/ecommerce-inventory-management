import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { Layers, AlertTriangle, RefreshCw, Plus, Minus, History, X, ShieldCheck } from 'lucide-react';

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Adjustment Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [changeQty, setChangeQty] = useState(5);
  const [reason, setReason] = useState('Stock replenishing from distributor');
  const [adjusting, setAdjusting] = useState(false);

  const fetchInventory = async () => {
    try {
      const invResponse = await axiosInstance.get('/inventory');
      const movemResponse = await axiosInstance.get('/inventory/movements?limit=15');
      const dataInv = invResponse.data;
      const dataMovem = movemResponse.data;

      setItems(dataInv.data || []);
      setMovements(dataMovem.data || []);
    } catch (err) {
      console.error(err.response?.data?.message || "Admin Inventory failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('A valid reason is required for audit logs');
      return;
    }
    setAdjusting(true);
    try {
      await axiosInstance.post(`/inventory/${selectedProduct._id}/adjust`, {
        changeQuantity: Number(changeQty),
        reason
      });
      setSelectedProduct(null);
      fetchInventory();
      alert('Stock successfully adjusted and logged into InventoryMovement!');
    } catch (err) {
      alert(err.message);
    } finally {
      setAdjusting(false);
    }
  };

  const displayedItems = filterLowStock ? items.filter((i) => i.status === 'low_stock' || i.status === 'out_of_stock') : items;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Layers className="text-blue-600 shrink-0" size={28} /> Inventory & Audit Trail
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">Manage stock levels with mandatory enterprise audit logs</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setFilterLowStock(!filterLowStock)}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-sm ${
              filterLowStock
                ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20'
                : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            type="button"
          >
            <AlertTriangle size={14} /> {filterLowStock ? 'Low Stock Only' : 'Filter Low Stock'}
          </button>
          <button
            onClick={fetchInventory}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
            type="button"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Inventory Section: Responsive Card View for Mobile & Table View for Desktop */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm mb-10">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Current Product Stock Overview</h3>

        {/* Mobile & Tablet Card View (< 768px) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {displayedItems.map((item) => (
            <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{item.name}</h4>
                    <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">{item.sku}</code>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                  item.status === 'in_stock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  item.status === 'low_stock' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div>
                  <span className="block text-slate-400 font-medium text-[10px] uppercase">Category</span>
                  <span className="font-semibold text-slate-700 truncate block">{item.category}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium text-[10px] uppercase">Stock</span>
                  <span className="font-extrabold text-slate-950">{item.stock} units</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium text-[10px] uppercase">Threshold</span>
                  <span className="font-semibold text-slate-700">{item.reorderThreshold}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedProduct(item)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all"
                  type="button"
                >
                  Adjust Stock
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-4 font-bold">Product</th>
                <th className="pb-4 font-bold">SKU</th>
                <th className="pb-4 font-bold">Category</th>
                <th className="pb-4 font-bold">Current Stock</th>
                <th className="pb-4 font-bold">Threshold</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayedItems.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80'}
                        alt=""
                        className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <strong className="font-bold text-slate-900">{item.name}</strong>
                    </div>
                  </td>
                  <td className="py-4">
                    <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-700">{item.sku}</code>
                  </td>
                  <td className="py-4 font-medium text-slate-600">{item.category}</td>
                  <td className="py-4">
                    <strong className="text-base font-extrabold text-slate-950">{item.stock}</strong> units
                  </td>
                  <td className="py-4 font-medium text-slate-600">{item.reorderThreshold}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      item.status === 'in_stock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      item.status === 'low_stock' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => setSelectedProduct(item)}
                      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all"
                      type="button"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {displayedItems.length === 0 && !loading && (
          <div className="py-12 text-center text-sm text-slate-400">
            No inventory records found.
          </div>
        )}
      </div>

      {/* Movement Audit History */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm overflow-hidden">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <History size={18} className="text-blue-600 shrink-0" /> Recent Stock Movement Logs (Audit Trail)
        </h3>

        {/* Mobile & Tablet Movement Cards */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          {movements.map((m) => (
            <div key={m._id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <strong className="font-bold text-slate-900">{m.product?.name || 'Product'}</strong>
                <span className={`inline-flex items-center gap-0.5 font-extrabold ${m.changeQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {m.changeQuantity > 0 ? <Plus size={12} /> : <Minus size={12} />}
                  {m.changeQuantity > 0 ? `+${m.changeQuantity}` : m.changeQuantity}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Stock Shift: <code className="font-mono text-slate-800">{m.previousStock} → {m.newStock}</code></span>
                <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700 border border-blue-200 text-[10px]">{m.movementType}</span>
              </div>
              <p className="text-slate-500 italic">"{m.reason}"</p>
              <div className="text-[10px] text-slate-400 text-right pt-1 border-t border-slate-200/50">
                {new Date(m.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-4 font-bold">Product</th>
                <th className="pb-4 font-bold">Change</th>
                <th className="pb-4 font-bold">Previous → New</th>
                <th className="pb-4 font-bold">Type</th>
                <th className="pb-4 font-bold">Reason</th>
                <th className="pb-4 font-bold text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {movements.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 font-bold text-slate-900">{m.product?.name || 'Product'}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-0.5 font-extrabold ${m.changeQuantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {m.changeQuantity > 0 ? <Plus size={13} /> : <Minus size={13} />}
                      {m.changeQuantity > 0 ? `+${m.changeQuantity}` : m.changeQuantity}
                    </span>
                  </td>
                  <td className="py-4 font-medium text-slate-700 font-mono text-xs">{m.previousStock} → {m.newStock}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                      {m.movementType}
                    </span>
                  </td>
                  <td className="py-4 text-xs font-medium text-slate-600">{m.reason}</td>
                  <td className="py-4 text-right text-xs text-slate-400 font-medium">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {movements.length === 0 && !loading && (
          <div className="py-12 text-center text-sm text-slate-400">
            No recent movement logs found.
          </div>
        )}
      </div>

      {/* Adjustment Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center z-9999 p-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 w-full max-w-120 shadow-2xl relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              type="button"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 mb-1 pr-6">
              Adjust Stock: {selectedProduct.name}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Current stock: <strong className="font-bold text-slate-800">{selectedProduct.stock}</strong> units
            </p>

            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Stock Change Quantity (+ or -)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    value={changeQty}
                    onChange={(e) => setChangeQty(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  />
                </div>
                <span className="block mt-1.5 text-[11px] text-slate-400">
                  Enter positive (e.g. 10) to add stock, or negative (e.g. -2) to deduct.
                </span>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Audit Reason (Mandatory)</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 sm:px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="inline-flex items-center gap-1.5 px-5 sm:px-6 py-2.5 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all disabled:opacity-60"
                >
                  <ShieldCheck size={16} /> {adjusting ? 'Saving...' : 'Confirm Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}