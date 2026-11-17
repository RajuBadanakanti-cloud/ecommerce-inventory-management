import { useState } from "react";
import {Link} from "react-router-dom"
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Footer() {
  const { isAuthenticated, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <footer className="relative mt-16 sm:mt-20 overflow-hidden border-t border-slate-800 bg-slate-950 text-slate-400">

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-10">

        {/* Service Highlights */}
        <div className="grid grid-cols-1 gap-8 border-b border-slate-800 pb-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">

          <div className="group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 transition-all duration-300 group-hover:bg-blue-500/20">
              <Truck size={26} className="text-blue-400" />
            </div>

            <h3 className="mt-4 mb-2 text-lg font-bold text-white">
              Convenient Delivery
            </h3>

            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Enjoy a smooth and convenient shopping experience.
            </p>
          </div>

          <div className="group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 transition-all duration-300 group-hover:bg-blue-500/20">
              <ShieldCheck size={26} className="text-blue-400" />
            </div>

            <h3 className="mt-4 mb-2 text-lg font-bold text-white">
              Secure Shopping
            </h3>

            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Shop with confidence through a simple checkout process.
            </p>
          </div>

          <div className="group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 transition-all duration-300 group-hover:bg-blue-500/20">
              <RefreshCw size={26} className="text-blue-400" />
            </div>

            <h3 className="mt-4 mb-2 text-lg font-bold text-white">
              Easy Order Management
            </h3>

            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Track and manage your orders with ease.
            </p>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col items-center justify-between gap-6 pt-8 sm:flex-row sm:gap-4">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5">
            <ShoppingBag size={26} className="text-blue-400" />

            <span className="text-xl font-extrabold tracking-tight text-white">
              Shop<span className="text-blue-400">Sphere</span>
            </span>
          </Link>

          {/* Copyright */}
          <p className="m-0 text-center text-xs leading-relaxed text-slate-500 sm:text-sm">
            © {new Date().getFullYear()} ShopSphere. All rights reserved.
          </p>

          {/* Conditional Logout */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut size={17} />

              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          )}

        </div>

      </div>
    </footer>
  );
}
