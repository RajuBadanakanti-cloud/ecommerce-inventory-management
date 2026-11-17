import { useState, useEffect } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { DollarSign, ShoppingCart, Users, Package, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigate()

  // dashboard >>>
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get('/analytics/dashboard');
        const data = response.data;
        setData(data);
      } catch (err) {
        console.error(err.response?.data?.message || "Admin Dashboard analytics failed");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center py-32 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
        <p className="text-sm font-medium">Loading real-time database analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-32 text-center text-red-900 font-semibold flex flex-col justify-center items-center">
       <p className='text-base md:text-xl'>Failed to load analytics</p>
        <button 
        type='button'
        className='px-4 py-2 text-red-50 bg-red-900 border-red-200 shadow border rounded mt-4 md:mt-5' 
        onClick={() => navigation("/", {replace:true})}>Try again later</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-4xl font-extrabold tracking-tight text-slate-900">Business Analytics & Overview</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">Overview of your store's performance</p>
      </div>

      {/* Low Stock Warning Banner if any */}
      {data.lowStockCount > 0 && (
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600 shrink-0" size={20} />
            <strong className="text-xs sm:text-sm md:text-base font-bold">{data.lowStockCount} products are running low on inventory!</strong>
          </div>
          <Link
            to="/admin/inventory"
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all self-end sm:self-auto"
          >
            Review Stock Now <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-10">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">TOTAL REVENUE</span>
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-950 truncate">
            ₹{data.totalRevenue?.toLocaleString('en-IN') || 0}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 font-medium">Paid orders revenue</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">TOTAL ORDERS</span>
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ShoppingCart size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-950">
            {data.totalOrders}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 font-medium">{data.paidOrders} confirmed & paid</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">ACTIVE PRODUCTS</span>
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Package size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-950">
            {data.totalProducts}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 font-medium">Available in catalog</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2 sm:mb-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">TOTAL CUSTOMERS</span>
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Users size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-950">
            {data.totalCustomers}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 mt-1 font-medium">Registered buyers</div>
        </div>
      </div>

      {/* Recent Orders & Top Sellers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">

        {/* Recent Orders */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 lg:p-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 mb-4">
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">Recent Customer Orders</h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View All →
            </Link>
          </div>

          {/* Mobile Card Stack for Recent Orders (< 768px) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {data.recentOrders.map((o) => (
              <div key={o._id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="font-bold text-slate-900">{o.orderNumber}</strong>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    o.orderStatus === 'confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    o.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {o.orderStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600 font-medium">
                  <span className="truncate pr-2">Customer: <strong className="text-slate-900">{o.user?.name || 'Customer'}</strong></span>
                  <strong className="text-slate-950 shrink-0">₹{o.totalAmount?.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-bold">Order No</th>
                  <th className="pb-3 font-bold">Customer</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {data.recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5"><strong className="font-bold text-slate-900">{o.orderNumber}</strong></td>
                    <td className="py-3.5 font-medium text-slate-700">{o.user?.name || 'Customer'}</td>
                    <td className="py-3.5 font-medium text-slate-900">₹{o.totalAmount?.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        o.orderStatus === 'confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        o.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 lg:p-8 shadow-sm">
          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600 shrink-0" /> Top Selling Items
          </h3>
          {data.topProducts?.length === 0 ? (
            <p className="text-xs sm:text-sm text-slate-500 py-8 text-center">Place demo orders to see real-time sales volume.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {data.topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-100 pb-3 last:border-none last:pb-0">
                  <div className="pr-3 min-w-0">
                    <strong className="font-bold text-slate-900 block mb-0.5 truncate">{p.name}</strong>
                    <div className="text-[11px] sm:text-xs text-slate-400">{p.totalSold} units sold</div>
                  </div>
                  <strong className="font-extrabold text-blue-600 whitespace-nowrap">₹{p.totalRevenue?.toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}