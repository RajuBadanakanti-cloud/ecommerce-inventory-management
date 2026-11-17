import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Ticket,
  ArrowLeft,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ onNavigate }) {
  const { logout, user } = useAuth();

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/inventory', label: 'Inventory & Stock', icon: Layers },
    { to: '/admin/products', label: 'Product Catalog', icon: Package },
    { to: '/admin/orders', label: 'Customer Orders', icon: ShoppingBag },
    { to: '/admin/coupons', label: 'Promo Coupons', icon: Ticket },
  ];

  const handleLinkClick = () => {
    if (onNavigate) onNavigate();
  };

  return (
      <aside className="fixed top-0 left-0 z-40 h-screen w-65 overflow-y-auto bg-slate-950 text-white flex flex-col shrink-0 border-r border-slate-800">      <div className="p-6 border-b border-slate-800 flex items-center gap-2.5">
        <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-md shadow-blue-600/20">
          <ShieldAlert size={20} />
        </div>
        <div>
          <div className="text-base font-extrabold tracking-tight">ShopSphere</div>
          <div className="text-[11px] text-blue-400 font-bold tracking-wider">ADMIN CONTROL</div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="p-3 flex flex-col gap-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={handleLinkClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Switcher */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <Link
          to="/"
          onClick={handleLinkClick}
          className="flex items-center gap-2.5 text-slate-400 hover:text-white text-xs font-medium px-2.5 py-2 rounded-lg hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Storefront
        </Link>
        <button
          onClick={() => { logout(); handleLinkClick(); }}
          className="w-full flex items-center gap-2.5 text-red-400 hover:text-red-300 text-xs font-medium px-2.5 py-2 rounded-lg hover:bg-red-950/30 transition-colors text-left"
          type="button"
        >
          <LogOut size={16} /> Sign Out ({user?.name?.split(' ')[0]})
        </button>
      </div>
    </aside>
  );
}