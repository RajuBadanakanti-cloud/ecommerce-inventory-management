import  { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');

  //  >>>>>>>>>>>>>>> Product Properties >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const displayPrice = product.priceInPaise / 100;
const maxDisplayPrice = product.compareAtPriceInPaise
  ? product.compareAtPriceInPaise / 100
  : null;

const hasDiscount =
    product.compareAtPriceInPaise > 0 &&
    product.compareAtPriceInPaise > product.priceInPaise;

const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPriceInPaise - product.priceInPaise) /
            product.compareAtPriceInPaise) * 100
      )
    : 0;

const isLowStock =
    product.stock > 0 &&
    product.stock <= (product.lowStockThreshold || 5);

const isOutOfStock = product.stock === 0;

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  // add to cart feature >>
  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to add items to your cart');
      return;
    }
    try {
      setAdding(true);
      await addToCart(product._id, 1);
      setMsg('Added! ✓');
      setTimeout(() => setMsg(''), 1500);
    } catch (err) {
      alert(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300/80 hover:shadow-xl hover:shadow-slate-900/5">
      {/* Product Image Container */}
      <Link
        to={`/product/${product._id}`}
        className="relative block aspect-4/3 w-full overflow-hidden bg-slate-100"
      >
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute left-3 top-3 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}

        {/* Low Stock Badge */}
        {isLowStock && (
          <span className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
            <AlertCircle size={12} /> Only ${product.stock} left
          </span>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/65 text-xs font-extrabold tracking-widest text-white backdrop-blur-[2px]">
            OUT OF STOCK
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {product.category?.name || 'General'}
          </span>

          <Link to={`/product/${product._id}`} className="block">
            <h3 className="mt-1 mb-2.5 line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 sm:text-base">
              {product.name}
            </h3>
          </Link>

          <div className="mb-3 flex items-center gap-1.5">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-800">{product.rating || '4.5'}</span>
            <span className="text-xs text-slate-400">({product.numReviews || 12})</span>
          </div>
        </div>

        {/* Price & Action Footer */}
        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3.5">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-slate-950">
              ₹{displayPrice?.toLocaleString('en-IN')}
            </div>
            {hasDiscount && (
              <div className="text-xs font-medium text-slate-400 line-through">
                ₹{maxDisplayPrice?.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding}
            type="button"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
              isOutOfStock
                ? 'cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                : msg
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:bg-blue-500 active:scale-95 disabled:opacity-60'
            }`}
          >
            <ShoppingBag size={14} />
            {adding ? '...' : (msg || 'Add')}
          </button>
        </div>
      </div>
    </div>
  );
}