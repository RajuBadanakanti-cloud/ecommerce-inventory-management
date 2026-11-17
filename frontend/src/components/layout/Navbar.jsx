import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  LogOut,
  Shield,
  Package,
  Menu,
  X,
  Store,
  User,
  ArrowRight
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    if (searchTerm.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between h-18 px-4 sm:px-8 lg:px-10 gap-3 sm:gap-4">

        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 transition-transform duration-300 group-hover:scale-105">
            <ShoppingBag size={20} />
          </div>

          <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Shop<span className="text-blue-600">Sphere</span>
          </span>
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center flex-1 max-w-md relative"
        >
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
          />

          <Search
            size={16}
            className="absolute left-3.5 text-slate-400 pointer-events-none"
          />
        </form>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Link
            to="/products"
            className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          >
            Store
          </Link>

          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 transition-colors hover:text-blue-600 dark:hover:text-blue-400"
          >
            <ShoppingBag size={18} />
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-blue-500 hover:text-blue-600"
              >
                <Package size={14} />
                My Orders
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500"
                >
                  <Shield size={14} />
                  Admin
                </Link>
              )}

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:border-red-500 hover:text-red-600"
                title="Logout"
                type="button"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Action Buttons (Cart + Menu Toggle) */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-xs">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
            type="button"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Modern Enhanced Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-18 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-2xl px-5 py-6 space-y-5 transition-all animate-in slide-in-from-top-4 duration-200">

          {/* Mobile Search Bar */}
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <Search size={17} className="absolute left-3.5 top-3.5 text-slate-400" />
          </form>

          {/* User Profile Pill if Logged In */}
          {user && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm">
                <User size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Signed in as</span>
                <strong className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate block">{user.name}</strong>
              </div>
            </div>
          )}

          {/* Mobile Nav Links */}
          <div className="flex flex-col space-y-1 font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-200">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Store size={17} className="text-blue-600" />
                <span>All Products Catalog</span>
              </div>
              <ArrowRight size={15} className="text-slate-400" />
            </Link>

            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={17} className="text-blue-600" />
                <span>My Shopping Cart</span>
              </div>
              <div className="flex items-center gap-2">
                {itemCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {itemCount}
                  </span>
                )}
                <ArrowRight size={15} className="text-slate-400" />
              </div>
            </Link>

            {user ? (
              <>
                <Link
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package size={17} className="text-blue-600" />
                    <span>My Orders History</span>
                  </div>
                  <ArrowRight size={15} className="text-slate-400" />
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Shield size={17} className="text-blue-600" />
                      <span>Admin Control Portal</span>
                    </div>
                    <ArrowRight size={15} className="text-slate-400" />
                  </Link>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 text-xs font-semibold hover:bg-red-100 transition-colors"
                    type="button"
                  >
                    <LogOut size={16} />
                    Sign Out From Account
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-center rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 text-center rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 hover:bg-blue-500 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center z-9999 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl w-full max-w-sm text-center shadow-2xl border border-slate-100 dark:border-slate-800"
          >
            <div className="mx-auto w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 shadow-sm">
              <LogOut size={22} />
            </div>

            <h3
              id="logout-title"
              className="text-lg font-extrabold text-slate-900 dark:text-white mb-1.5"
            >
              Confirm Logout
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to logout from your account?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                onClick={() => setShowLogoutConfirm(false)}
                type="button"
              >
                Cancel
              </button>

              <button
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-lg shadow-red-600/25 hover:bg-red-500 transition-all"
                onClick={handleLogout}
                type="button"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}