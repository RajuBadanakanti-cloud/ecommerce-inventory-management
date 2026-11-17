
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Filter,
  Search,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  X,
} from "lucide-react";

import ProductCard from "../../components/products/ProductCard";
import axiosInstance from "../../api/axiosInstance";

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [error, setError] = useState("");

  const [total, setTotal] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Read filters from URL
  const keyword = searchParams.get("keyword") || "";
  const selectedCat = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // Fetch categories
  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);

        const res = await axiosInstance.get("/category", {
          signal: controller.signal,
        });

        const data = res.data;

        const categoryList = data.categories || [];

        setCategories(categoryList);
      } catch (err) {
        if (
          err.name !== "CanceledError" &&
          err.code !== "ERR_CANCELED"
        ) {
          console.error("Category fetching error:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCategoryLoading(false);
        }
      }
    };

    fetchCategories();

    return () => controller.abort();
  }, []);

  // Fetch products whenever URL filters change
  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        // Build API query parameters
        const params = new URLSearchParams();

        if (keyword.trim()) {
          params.set("search", keyword.trim());
        }

        if (selectedCat) {
          params.set("category", selectedCat);
        }

        if (sort) {
          params.set("sort", sort);
        }

        // Convert rupees to paise
        if (minPrice !== "") {
          params.set(
            "minPrice",
            String(Math.round(Number(minPrice) * 100))
          );
        }

        if (maxPrice !== "") {
          params.set(
            "maxPrice",
            String(Math.round(Number(maxPrice) * 100))
          );
        }

        const res = await axiosInstance.get(
          `/product/all?${params.toString()}`,
          {
            signal: controller.signal,
          }
        );

        const data = res.data;

        setProducts(data.products || []);
        setTotal(data.pagination?.totalProducts || 0);
      } catch (err) {
        if (
          err.name === "CanceledError" ||
          err.code === "ERR_CANCELED"
        ) {
          return;
        }

        console.error("Product fetching error:", err);

        setProducts([]);
        setTotal(0);

        setError(
          err.response?.data?.message ||
            "Unable to load products. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, [keyword, selectedCat, sort, minPrice, maxPrice, refreshKey]);


  // Update URL filters
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    newParams.delete("page");

    setSearchParams(newParams);
  };

  // Reset all filters
  const clearFilters = () => {
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  // Retry product fetching
  const handleRetry = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const activeFilterCount = [
    selectedCat,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
              Discover Products
            </p>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {keyword
                ? `Search Results for "${keyword}"`
                : "All Products Catalog"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {products.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {total}
              </span>{" "}
              available items
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-4 lg:gap-8">

        {/* Filter Sidebar */}
        <aside className="sticky top-16 z-30 h-fit max-h-[calc(100vh-5rem)] self-start overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40 lg:top-24 lg:col-span-1 lg:max-h-[calc(100vh-7rem)]">

          {/* Filter Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <SlidersHorizontal size={19} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                  Filters
                </h3>

                <p className="text-xs text-slate-500">
                  Refine your products
                </p>
              </div>

              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={clearFilters}
                type="button"
                className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
              >
                <RotateCcw size={13} />
                Reset
              </button>

              {/* Mobile Toggle */}
              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen((prev) => !prev)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 lg:hidden"
                aria-label={
                  mobileFiltersOpen
                    ? "Close filters"
                    : "Open filters"
                }
              >
                {mobileFiltersOpen ? (
                  <X size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>

              {/* Desktop indicator */}
              <div className="hidden text-slate-400 lg:block">
                <Filter size={18} />
              </div>
            </div>
          </div>

          {/* Filter Content */}
          <div
            className={`${
              mobileFiltersOpen ? "block" : "hidden"
            } p-4 sm:p-5 lg:block`}
          >

            {/* Category Filter */}
            <div className="mb-6">
              <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Category
              </label>

              <div className="flex max-h-48 flex-col gap-3 overflow-y-auto pr-2">

                <label className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50">
                  <input
                    type="radio"
                    name="category"
                    checked={!selectedCat}
                    onChange={() =>
                      updateFilter("category", "")
                    }
                    className="h-4 w-4 accent-blue-600"
                  />

                  <span className="group-hover:text-blue-700">
                    All Categories
                  </span>
                </label>

                {categoryLoading ? (
                  <p className="px-2 text-sm text-slate-400">
                    Loading categories...
                  </p>
                ) : (
                  categories.map((category) => (
                    <label
                      key={category._id}
                      className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category._id}
                        checked={selectedCat === category._id}
                        onChange={() =>
                          updateFilter("category", category._id)
                        }
                        className="h-4 w-4 accent-blue-600"
                      />

                      <span className="group-hover:text-blue-700">
                        {category.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="mb-6 border-t border-slate-100" />

            {/* Price Filter */}
            <div className="mb-6">
              <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Price Range (₹)
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs text-slate-400">
                    Minimum
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="₹ Min"
                    value={minPrice}
                    onChange={(e) =>
                      updateFilter("minPrice", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-slate-400">
                    Maximum
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="₹ Max"
                    value={maxPrice}
                    onChange={(e) =>
                      updateFilter("maxPrice", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6 border-t border-slate-100" />

            {/* Sort Filter */}
            <div>
              <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Sort By
              </label>

              <select
                value={sort}
                onChange={(e) =>
                  updateFilter("sort", e.target.value)
                }
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                <option value="newest">
                  Featured (Newest)
                </option>

                <option value="oldest">
                  Oldest
                </option>

                <option value="priceLowToHigh">
                  Price: Low to High
                </option>

                <option value="priceHighToLow">
                  Price: High to Low
                </option>

                <option value="nameAZ">
                  Name: A to Z
                </option>

                <option value="nameZA">
                  Name: Z to A
                </option>
              </select>
            </div>

            {/* Mobile Apply / Close */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 lg:hidden"
            >
              View {total} Products
              <ChevronUp size={16} />
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="min-w-0 lg:col-span-3">

          {/* Loading State */}
          {loading ? (
          <div className="flex min-h-87.5 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white px-5 text-center">

            {/* Animated Icon */}
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
              <ShoppingBag
                size={34}
                className="animate-pulse text-blue-600"
              />

              <span className="absolute -right-1 -top-1 flex h-5 w-5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-50" />
                <span className="relative inline-flex h-5 w-5 rounded-full bg-blue-600" />
              </span>
            </div>

            {/* Loading Text */}
            <h3 className="text-base font-bold text-slate-800">
              Finding the Best Products
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
              Just a moment! We're getting everything ready for you.
            </p>

            {/* Animated Progress Bar */}
            <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-blue-100">
              <div className="h-full w-1/2 animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-blue-600" />
            </div>

            <p className="mt-3 text-xs font-medium tracking-wide text-slate-400">
              LOADING PRODUCTS...
            </p>
          </div>

          ) : error ? (
            /* Error State */
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center sm:p-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <X size={22} />
              </div>

              <h3 className="font-bold text-red-700">
                Something went wrong
              </h3>

              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={handleRetry}
                className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>

          ) : products.length === 0 ? (
            /* Empty State */
            <div className="flex min-h-87.5 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <Search size={28} />
              </div>

              <h3 className="text-lg font-bold text-slate-900">
                No products found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Try adjusting your search query or filters to
                discover more products.
              </p>

              <button
                onClick={clearFilters}
                type="button"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
              >
                <RotateCcw size={15} />
                Clear All Filters
              </button>
            </div>

          ) : (
            /* Products */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
