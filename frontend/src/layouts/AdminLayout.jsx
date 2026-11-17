
import { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import AdminSidebar from '../components/layout/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ArrowLeft } from 'lucide-react';

export default function AdminLayout() {
  const { user, loading, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center py-32 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
        <p className="text-sm font-medium">Authenticating admin access...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Sidebar Wrapper */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen
            ? 'translate-x-0 shadow-2xl'
            : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Content */}
      <div className="min-h-screen lg:ml-64">

        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-md px-5 sm:px-8">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="inline-flex lg:hidden items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle Sidebar"
              type="button"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="text-xs sm:text-sm text-slate-500 font-medium">
              Admin: <strong className="font-bold text-slate-900">
                {user?.name}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
            >
              <ArrowLeft size={14} /> Storefront
            </Link>
          </div>
        </header>

        {/* Dashboard Pages */}
        <main className="min-h-[calc(100vh-4rem)] p-5 sm:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
