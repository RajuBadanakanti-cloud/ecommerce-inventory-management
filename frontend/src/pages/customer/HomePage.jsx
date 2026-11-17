import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../../components/layout/HeroSection';
import { ArrowRight, Sparkles, Zap, Shield, Flame, Copy, Check} from 'lucide-react';
import {
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  Shirt,
  Home,
  Camera,
  Gamepad2,
  BookOpen,
  Dumbbell,
} from "lucide-react";

import axiosInstance from '../../api/axiosInstance';
import ProductCard from '../../components/products/ProductCard';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // loading >>
  const [coupons, setCoupons] = useState([]); // active coupons >>
  const [copiedCode, setCopiedCode] = useState("");


  // categories and produtcs getting and COUPONS >>
  useEffect(() => {
    const fetchData = async () => {
      try {
        const produstsResponse = await axiosInstance.get('/product/all?limit=6') // top 6
        const categorisResponse = await axiosInstance.get('/category')
        const prodData = produstsResponse.data
        const cateData = categorisResponse.data

       // console.log("prodData: ", prodData)
        //console.log("cateData: ", cateData)

      setFeaturedProducts(prodData.products || []);
      setCategories(cateData.categories || []);

      } catch (err) {
        console.error(err?.response?.data?.message || "Home Page fetcing Failed!");
      } finally {
        setLoading(false);
      }
    };

    // Active COUPONS >>
    const fetchCoupons = async () => {
    try {
      const response = await axiosInstance.get("/coupons/active");
      setCoupons(response.data.coupons || []);
    } catch (err) {
      console.error(
        err?.response?.data?.message || "Failed to fetch coupons"
      );
    }
  };
    fetchData();
    fetchCoupons();
  }, []);

const handleCopyCoupon = async (code) => {
  try {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
  } catch (error) {
    console.error("Unable to copy coupon code:", error);
  }
};

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  return (
    <div className="min-h-screen bg-slate-50/50 selection:bg-blue-600 selection:text-white">
      {/* Her Section */}
        <HeroSection/>

      {/* Categories Section */}
    <section className="relative isolate overflow-hidden border-b border-slate-200/70 bg-linear-to-b from-white via-slate-50 to-blue-50/60 py-20 md:py-28">

      {/* Background Lighting Effects */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-300/20 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-indigo-300/20 blur-[100px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-200/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">

        {/* Section Header */}
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-14">

          <div>
            {/* Premium Label */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5">
              <Sparkles size={14} className="text-blue-600" />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-700">
                Explore Our Collections
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Find Your{" "}
              <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Perfect Category.
              </span>
            </h2>

            {/* Description */}
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              Explore a wide range of premium products across carefully selected
              categories, all in one place.
            </p>
          </div>

          {/* Explore All Button */}
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 rounded-xl border border-blue-200/70 bg-white/80 px-6 py-3.5 text-sm font-bold text-blue-700 shadow-lg shadow-blue-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:shadow-xl hover:shadow-blue-600/20"
          >
            Explore All Categories
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

        </div>

        {/* Category Cards */}
        <div className="flex gap-5 overflow-x-auto px-1 pb-8 pt-3 scrollbar-none sm:gap-6">

          {categories.map((cat) => {

            // Select icons based on category name
            const categoryName = cat.name.toLowerCase();

            const CategoryIcon =
              categoryName.includes("laptop") ||
              categoryName.includes("computer") ||
              categoryName.includes("electronics")
                ? Laptop
                : categoryName.includes("mobile") ||
                  categoryName.includes("phone")
                ? Smartphone
                : categoryName.includes("audio") ||
                  categoryName.includes("headphone")
                ? Headphones
                : categoryName.includes("watch")
                ? Watch
                : categoryName.includes("fashion") ||
                  categoryName.includes("clothing") ||
                  categoryName.includes("apparel")
                ? Shirt
                : categoryName.includes("home") ||
                  categoryName.includes("furniture")
                ? Home
                : categoryName.includes("camera") ||
                  categoryName.includes("photography")
                ? Camera
                : categoryName.includes("gaming") ||
                  categoryName.includes("game")
                ? Gamepad2
                : categoryName.includes("security")
                ? Shield
                : categoryName.includes("accessories")
                ? Zap
                : categoryName.includes("books")
                ? BookOpen
                : categoryName.includes("sport") ||
                  categoryName.includes("fitness") ||
                  categoryName.includes("gym")
                ? Dumbbell
                : Sparkles;

            return (
              <Link
                key={cat._id}
                to={`/products?category=${cat._id}`}
                className="group relative flex min-w-50 shrink-0 flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-5 shadow-[0_8px_35px_rgba(30,64,175,0.07)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-blue-200 hover:bg-white hover:shadow-[0_20px_50px_rgba(37,99,235,0.16)] sm:min-w-60 sm:p-6"
              >

                {/* Card Glossy Background */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-blue-50/80 via-white/20 to-indigo-100/50 opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Top Highlight */}
                <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-linear-to-r from-transparent via-blue-300/80 to-transparent" />

                {/* Hover Shine Effect */}
                <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/70 to-transparent opacity-0 transition-all duration-700 group-hover:left-full group-hover:opacity-100" />

                <div className="relative z-10">

                  {/* Category Icon */}
                  <div className="relative mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-linear-to-br from-blue-500 via-indigo-600 to-violet-600 text-white shadow-[0_8px_22px_rgba(79,70,229,0.28)] transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_12px_30px_rgba(79,70,229,0.4)]">

                    {/* Icon Glow */}
                    <div className="absolute inset-0 rounded-2xl bg-white/10 blur-md" />

                    <CategoryIcon
                      size={22}
                      strokeWidth={1.8}
                      className="relative drop-shadow-md"
                    />

                    {/* Icon Shine */}
                    <div className="absolute left-3 top-2 h-3 w-7 -rotate-45 rounded-full bg-white/30 blur-sm" />
                  </div>

                  {/* Category Name */}
                  <h3 className="mb-2 text-base font-extrabold tracking-tight text-slate-800 transition-colors duration-300 group-hover:text-blue-700 sm:text-lg">
                    {cat.name}
                  </h3>

                  {/* Category Description */}
                  <div className="flex items-center justify-between gap-2">

                    <span className="text-xs font-medium text-slate-400 transition-colors duration-300 group-hover:text-blue-500">
                      Explore Collection
                    </span>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-500 shadow-sm transition-all duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30">
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </div>

                  </div>

                </div>

                {/* Bottom Premium Accent */}
                <div className="absolute bottom-0 left-0 h-1 w-0 rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 transition-all duration-500 group-hover:w-full" />

              </Link>
            );
          })}

        </div>

      </div>
    </section>


    {/* Trending Products Section */}
      <section className="bg-slate-50/50 py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">

          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
          {/* tyrending iconn fire */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-fuchsia-100 bg-fuchsia-50 px-3.5 py-1.5">
            <Flame  size={14} className="text-fuchsia-600" />
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-fuchsia-700">
              Trending Collections
            </span>
          </div>

          <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Trending Products
              </h2>
              <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
                Hand-picked top-rated products from our active database
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-600 hover:bg-blue-50/50 hover:text-blue-600 hover:shadow"
            >
              Explore All Products
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
              <p className="text-sm font-medium">Loading catalog...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((p) => (
                <div key={p._id} className="transition-transform duration-300 hover:-translate-y-1">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

    {/* >>> Promotional Coupons Section */}
        {coupons.length > 0 && (
          <section className="bg-white pb-20 pt-6 md:pb-28">
            <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">

              <div className="mb-10">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3.5 py-1.5">
                  <Sparkles size={14} className="text-green-600" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-green-700">
                    Exclusive Offers
                  </span>
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Special <span className="text-blue-600">Deals.</span>
                </h2>

                <p className="mt-3 text-sm text-slate-500 sm:text-base">
                  Grab the latest offers and save more on your shopping.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

                {coupons.map((coupon) => (
                  <div
                    key={coupon._id}
                    className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-linear-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10"
                  >
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-blue-200/30 blur-2xl" />

                    <div className="relative">

                      <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                        Limited Time Offer
                      </span>

                      <h3 className="mt-5 text-3xl font-extrabold tracking-tight text-blue-700">
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} OFF`}
                      </h3>

                      <p className="mt-2 text-sm text-slate-600">
                        {coupon.discountType === "percentage"
                          ? "Get a discount on your eligible purchase."
                          : "Save on your eligible purchase."}
                      </p>

                      {coupon.minOrderAmount > 0 && (
                        <p className="mt-3 text-xs font-medium text-slate-500">
                          Minimum order: ₹{coupon.minOrderAmount}
                        </p>
                      )}

                      {coupon.discountType === "percentage" &&
                        coupon.maxDiscount > 0 && (
                          <p className="mt-1 text-xs text-slate-500">
                            Maximum discount: ₹{coupon.maxDiscount}
                          </p>
                        )}

                      <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-dashed border-blue-300 bg-white/80 p-3">

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Coupon Code
                          </p>

                          <p className="truncate font-mono text-base font-extrabold tracking-wider text-slate-900">
                            {coupon.code}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCoupon(coupon.code)}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
                        >
                          {copiedCode === coupon.code ? (
                            <>
                              <Check size={14} />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy
                            </>
                          )}
                        </button>

                      </div>

                      <p className="mt-3 text-[11px] text-slate-400">
                        Valid until{" "}
                        {new Date(coupon.expiryDate).toLocaleDateString("en-IN")}
                      </p>

                    </div>
                  </div>
                ))}

              </div>

              <div className="mt-8 text-center">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  Start Shopping
                  <ArrowRight size={17} />
                </Link>
              </div>

            </div>
          </section>
        )}

    </div>
  );
}