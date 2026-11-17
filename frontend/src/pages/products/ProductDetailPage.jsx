import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  Star,
  ShieldCheck,
  Truck,
  RefreshCw,
  ShoppingBag,
  Plus,
  Minus,
  PackageSearch,
  CheckCircle2,
  LogIn,
  MessageSquareText,
  LoaderCircle,
  ArrowLeft,
  LockKeyhole,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState("");
  const [notice, setNotice] = useState({
    type: "",
    message: "",
  });

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product details and customer reviews
  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);

      try {
        const response = await axiosInstance.get(`/product/${id}`);

        if (isMounted) {
          setProduct(response.data.product || null);
        }
      } catch (err) {
        console.error(
          "Fetch product error:",
          err.response?.data || err
        );

        if (isMounted) setProduct(null);
      }

      // Fetch reviews separately
      try {
        const revRes = await axiosInstance.get(
          `/reviews/product/${id}`
        );

        if (isMounted) {
          setReviews(
            Array.isArray(revRes.data) ? revRes.data : []
          );
        }
      } catch (err) {
        console.error(
          "Fetch reviews error:",
          err.response?.data || err
        );

        if (isMounted) setReviews([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Product Loading UI
  if (loading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 sm:p-10">
          <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-4xl bg-blue-50">
            <ShoppingBag
              size={42}
              className="animate-pulse text-blue-600"
            />

            <span className="absolute -right-1 -top-1 flex h-6 w-6">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40" />

              <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                <LoaderCircle
                  size={13}
                  className="animate-spin"
                />
              </span>
            </span>
          </div>

          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Getting Product Ready
          </h2>

          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
            Please wait while we fetch the product details for you.
          </p>

          <div className="mx-auto mt-7 h-1.5 w-48 overflow-hidden rounded-full bg-blue-100">
            <div className="h-full w-1/2 animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-blue-600" />
          </div>

          <p className="mt-4 text-[11px] font-bold tracking-[0.18em] text-slate-400">
            LOADING PRODUCT DETAILS
          </p>
        </div>
      </div>
    );
  }

  // Product Not Found UI
  if (!product) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-200/40 sm:p-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
            <PackageSearch size={38} />
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Product Not Found
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            The product you are looking for does not exist or may have been removed from our store.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] sm:w-auto"
          >
            <ArrowLeft size={17} />
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  // Price Calculation
  const displayPrice = product.priceInPaise / 100;

  const hasDiscount =
    product.compareAtPriceInPaise > product.priceInPaise;

  // Add to Cart Function
  const handleAddToCart = async () => {
    if (adding) return;

    if (!user) {
      setNotice({
        type: "error",
        message:
          "Please login to purchase or add items to your cart.",
      });
      return;
    }

    try {
      setAdding(true);

      await addToCart(product._id, quantity);

      setMsg("Added to Cart Successfully! ✓");

      setNotice({
        type: "success",
        message: "Product added to your cart.",
      });

      setTimeout(() => setMsg(""), 6000);
    } catch (err) {
      console.error(
        "Add to cart error:",
        err.response?.data || err
      );

      setNotice({
        type: "error",
        message:
          err.response?.data?.message ||
          "Unable to add this quantity. Please check the available stock in your cart.",
      });
    } finally {
      setAdding(false);
    }
  };

  // Submit a verified-purchase review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setNotice({
        type: "error",
        message: "Please login before submitting a review.",
      });
      return;
    }

    if (!comment.trim()) {
      setNotice({
        type: "error",
        message: "Please enter your review comment.",
      });
      return;
    }

    try {
      setSubmittingReview(true);

      setNotice({
        type: "",
        message: "",
      });

      await axiosInstance.post(`/reviews/product/${id}`, {
        rating,
        comment: comment.trim(),
      });

      // Fetch latest reviews after successful submission
      const revRes = await axiosInstance.get(
        `/reviews/product/${id}`
      );

      setReviews(
        Array.isArray(revRes.data) ? revRes.data : []
      );

      setComment("");
      setRating(5);

      setNotice({
        type: "success",
        message:
          "Thank you! Your review has been submitted successfully.",
      });
    } catch (err) {
      console.error(
        "Submit review error:",
        err.response?.data || err
      );

      setNotice({
        type: "error",
        message:
          err.response?.data?.message ||
          "Unable to submit your review. Please try again.",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 sm:mb-8 sm:text-sm">
          <Link
            to="/"
            className="transition hover:text-blue-600"
          >
            Home
          </Link>

          <span className="text-slate-300">/</span>

          <Link
            to="/products"
            className="transition hover:text-blue-600"
          >
            Store
          </Link>

          <span className="text-slate-300">/</span>

          <span className="max-w-45 truncate font-semibold text-slate-900 sm:max-w-xs">
            {product.name}
          </span>
        </div>

        {/* Product Detail Main Section */}
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-2 lg:gap-12">
          {/* Product Image */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="relative overflow-hidden bg-slate-100">
              <img
                src={
                  product.images && product.images[0]
                    ? product.images[0]
                    : "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
                }
                alt={product.name}
                className="aspect-square w-full object-cover transition duration-700 hover:scale-105 sm:aspect-5/4 lg:aspect-square"
              />

              {hasDiscount && (
                <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg">
                  Special Price
                </span>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="min-w-0">
            {/* Category */}
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <ShoppingBag size={13} />
              {product.category?.name || "General Category"}
            </span>

            {/* Product Name */}
            <h1 className="mb-3 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {/* SKU */}
            <div className="mb-5 text-xs text-slate-400">
              SKU:{" "}
              <strong className="font-semibold text-slate-700">
                {product.sku}
              </strong>
            </div>

            {/* Rating */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
                <Star
                  size={16}
                  className="fill-amber-400 text-amber-400"
                />

                <strong className="text-sm font-bold text-slate-900">
                  {product.rating || "4.5"}
                </strong>
              </div>

              <span className="text-sm font-medium text-slate-500">
                ({reviews.length} customer reviews)
              </span>
            </div>

            {/* Price Section */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Product Price
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                  ₹{displayPrice.toLocaleString("en-IN")}
                </span>

                {hasDiscount && (
                  <span className="text-lg font-medium text-slate-400 line-through">
                    ₹
                    {(
                      product.compareAtPriceInPaise / 100
                    ).toLocaleString("en-IN")}
                  </span>
                )}

                {hasDiscount && (
                  <span className="rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
                    Save ₹
                    {(
                      (product.compareAtPriceInPaise -
                        product.priceInPaise) /
                      100
                    ).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>

            {/* Stock Availability */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  In Stock ({product.stock} units ready to ship)
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  Out of Stock
                </span>
              )}
            </div>

            {/* Product Description */}
            <div className="mb-8">
              <h3 className="mb-2 text-sm font-bold text-slate-900">
                Product Description
              </h3>

              <p className="text-sm leading-7 text-slate-600 sm:text-base">
                {product.description}
              </p>
            </div>

            {/* Add to Cart Section */}
            {product.stock > 0 && (
              <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Quantity
                </p>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Quantity Selector */}
                  <div className="flex w-fit items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <button
                      onClick={() =>
                        setQuantity(Math.max(1, quantity - 1))
                      }
                      className="flex h-12 w-12 items-center justify-center text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
                      type="button"
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={17} />
                    </button>

                    <span className="flex h-12 min-w-14 items-center justify-center border-x border-slate-200 bg-white px-4 text-base font-bold text-slate-900">
                      {quantity}
                    </span>

                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(product.stock, quantity + 1)
                        )
                      }
                      className="flex h-12 w-12 items-center justify-center text-slate-600 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40"
                      type="button"
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                    >
                      <Plus size={17} />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    type="button"
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {adding ? (
                      <>
                        <LoaderCircle
                          size={19}
                          className="animate-spin"
                        />
                        Adding to Cart...
                      </>
                    ) : msg ? (
                      <>
                        <CheckCircle2 size={19} />
                        {msg}
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={19} />
                        Add To Cart
                      </>
                    )}
                  </button>
                </div>

                {!user && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <LockKeyhole size={13} />
                    Login is required to add products to your cart.

                    <Link
                      to="/login"
                      className="font-bold text-blue-600 hover:text-blue-700"
                    >
                      Login
                    </Link>
                  </p>
                )}
              </div>
            )}

            {/* Service Features */}
            <div className="grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
              <div className="flex flex-col items-center gap-2 px-1 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
                  <Truck size={20} />
                </div>

                <span className="text-[10px] font-semibold leading-tight text-slate-600 sm:text-xs">
                  Fast Shipping
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 px-1 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
                  <ShieldCheck size={20} />
                </div>

                <span className="text-[10px] font-semibold leading-tight text-slate-600 sm:text-xs">
                  Idempotent Mock Pay
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 px-1 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 sm:h-11 sm:w-11">
                  <RefreshCw size={20} />
                </div>

                <span className="text-[10px] font-semibold leading-tight text-slate-600 sm:text-xs">
                  Easy Cancellations
                </span>
              </div>
            </div>
          </div>
        </div>        {/* Customer Reviews Section */}
        <section className="mt-14 border-t border-slate-200 pt-10 sm:mt-20 sm:pt-16">
          <div className="mb-7 flex items-center gap-3 sm:mb-9">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MessageSquareText size={21} />
            </div>

            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Customer Reviews
              </h2>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Share your experience with this product
              </p>
            </div>
          </div>

          {/* Inline Notification */}
          {notice.message && (
            <div
              role="alert"
              aria-live="polite"
              className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
                notice.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >
              {notice.type === "success" ? (
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />
              ) : (
                <LockKeyhole
                  size={18}
                  className="mt-0.5 shrink-0"
                />
              )}

              <p className="min-w-0 flex-1">
                {notice.message}
              </p>

              <button
                type="button"
                onClick={() =>
                  setNotice({
                    type: "",
                    message: "",
                  })
                }
                className="shrink-0 rounded-md px-1 font-bold opacity-70 transition hover:opacity-100"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 lg:gap-10">
            {/* Reviews List */}
            <div>
              {reviews.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                    <Star size={26} />
                  </div>

                  <h3 className="font-bold text-slate-800">
                    No Reviews Yet
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                    Be the first to share your thoughts about this product!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {reviews.map((r) => (
                    <div
                      key={r._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <strong className="text-sm font-bold text-slate-900">
                          {r.user?.name || "Verified Buyer"}
                        </strong>

                        <div className="flex items-center gap-1">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className="fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-sm leading-relaxed text-slate-600">
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leave a Review Form */}
            <div className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Leave a Review
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your feedback helps other customers.
                </p>
              </div>

              {user ? (
                <form
                  onSubmit={handleReviewSubmit}
                  className="space-y-5"
                >
                  {/* Rating */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Rating
                    </label>

                    <select
                      value={rating}
                      onChange={(e) =>
                        setRating(Number(e.target.value))
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value={5}>
                        ⭐⭐⭐⭐⭐ (5 - Excellent)
                      </option>

                      <option value={4}>
                        ⭐⭐⭐⭐ (4 - Very Good)
                      </option>

                      <option value={3}>
                        ⭐⭐⭐ (3 - Average)
                      </option>

                      <option value={2}>
                        ⭐⭐ (2 - Poor)
                      </option>

                      <option value={1}>
                        ⭐ (1 - Terrible)
                      </option>
                    </select>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Comment
                    </label>

                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us about the build quality, performance..."
                      value={comment}
                      onChange={(e) =>
                        setComment(e.target.value)
                      }
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingReview ? (
                      <>
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <MessageSquareText size={18} />
                        Post Review
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                    <LogIn size={23} />
                  </div>

                  <h4 className="font-bold text-slate-900">
                    Login to Share Your Review
                  </h4>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Please login to your account before submitting a product review.
                  </p>

                  <Link
                    to="/login"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    <LogIn size={17} />
                    Login to Continue
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}