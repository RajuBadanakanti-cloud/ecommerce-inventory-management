
import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";

import {
  Plus,
  Trash2,
  Package,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ImageOff,
} from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);

  // Toast notification
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // New product state
  const [newProd, setNewProd] = useState({
    name: "",
    sku: "",
    description: "",
    category: "",
    price: 999,
    discountPrice: 799,
    stock: 20,
    reorderThreshold: 5,
    images:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
  });

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });
  };

  // Automatically hide toast
  useEffect(() => {
    if (!toast.show) return;

    const timer = window.setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [toast]);

  // Fetch products and categories
  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        axiosInstance.get("/product/admin?limit=50"),
        axiosInstance.get("/category"),
      ]);

      const productsData = pRes.data;
      const categoryData = cRes.data;

      setProducts(productsData.products || []);
      setCategories(categoryData.categories || []);

      if (categoryData.categories?.length > 0) {
        setNewProd((prev) => ({
          ...prev,
          category: prev.category || categoryData.categories[0]._id,
        }));
      }
    } catch (err) {
      console.error("Admin Product Fetch Error:", err);

      showToast(
        err.response?.data?.message ||
          "Failed to load products. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format product price
  const formatPrice = (product) => {
    const price =
      product.priceInPaise !== undefined
        ? product.priceInPaise / 100
        : Number(product.price || 0);

    return `₹${(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // CREATE NEW PRODUCT
  const handleCreate = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    try {
      await axiosInstance.post("/product", {
        ...newProd,
        images: newProd.images.trim()
          ? [newProd.images.trim()]
          : [],
      });

      setShowModal(false);

      setNewProd({
        name: "",
        sku: "",
        description: "",
        category: categories[0]?._id || "",
        price: 999,
        discountPrice: 799,
        stock: 20,
        reorderThreshold: 5,
        images:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      });

      await fetchData();

      showToast("Product created successfully!", "success");
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Product creation failed. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // OPEN DELETE CONFIRMATION
  const openDeleteConfirmation = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // DELETE PRODUCT
  const handleDelete = async () => {
    if (!selectedProduct || deleting) return;

    setDeleting(true);

    try {
      await axiosInstance.delete(`/product/${selectedProduct._id}`);

      setShowDeleteModal(false);
      setSelectedProduct(null);

      await fetchData();

      showToast("Product deleted successfully!", "success");
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          "Product deletion failed. Please try again.",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  // Close create modal
  const closeCreateModal = () => {
    if (submitting) return;
    setShowModal(false);
  };

  // Close delete confirmation
  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 top-4 z-10000 w-[calc(100%-2rem)] max-w-sm animate-in slide-in-from-top-3 duration-300"
        >
          <div
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-xl ${
              toast.type === "success"
                ? "border-emerald-200 bg-white"
                : "border-rose-200 bg-white"
            }`}
          >
            <div
              className={`mt-0.5 shrink-0 ${
                toast.type === "success"
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={21} />
              ) : (
                <AlertCircle size={21} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">
                {toast.type === "success" ? "Success" : "Something went wrong"}
              </p>

              <p className="mt-1 wrap-break-words text-xs leading-5 text-slate-600">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setToast((prev) => ({ ...prev, show: false }))
              }
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close notification"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            <Package className="shrink-0 text-blue-600" size={28} />
            Product Catalog
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Add, manage, and remove store products
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-[0.98] sm:w-auto"
        >
          <Plus size={18} />
          Add New Product
        </button>
      </div>

      {/* PRODUCT LIST */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-600" size={30} />
            <p className="text-sm font-medium text-slate-500">
              Loading products...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center text-center">
            <Package size={38} className="mb-3 text-slate-300" />

            <h3 className="text-sm font-bold text-slate-700">
              No products found
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Start by adding your first product.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE PRODUCT CARDS */}
            <div className="grid grid-cols-1 gap-3.5 md:hidden">
              {products.map((p) => (
                <div
                  key={p._id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          loading="lazy"
                          className="h-14 w-14 shrink-0 rounded-xl border border-slate-200 bg-white object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-300">
                          <ImageOff size={20} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <strong className="block truncate text-sm font-bold text-slate-900">
                          {p.name}
                        </strong>

                        <code className="mt-1 inline-block max-w-full truncate rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                          {p.sku}
                        </code>

                        {p.isActive === false && (
                          <span className="mt-1 block text-[10px] font-semibold text-rose-600">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openDeleteConfirmation(p)}
                      type="button"
                      aria-label={`Delete ${p.name}`}
                      className="shrink-0 rounded-xl p-2.5 text-rose-500 transition-colors hover:bg-rose-100 active:bg-rose-200"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-200/70 pt-3">
                    <div className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Price
                      </span>

                      <strong className="mt-1 block truncate text-sm font-extrabold text-slate-950">
                        {formatPrice(p)}
                      </strong>
                    </div>

                    <div className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Stock
                      </span>

                      <span className="mt-1 block truncate text-sm font-semibold text-slate-700">
                        {p.stock} units
                      </span>
                    </div>

                    <div className="min-w-0">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Category
                      </span>

                      <span className="mt-1 block truncate text-sm font-semibold text-slate-600">
                        {p.category?.name || "General"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-175 border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-4 pr-4">Product</th>
                    <th className="pb-4 pr-4">SKU</th>
                    <th className="pb-4 pr-4">Price</th>
                    <th className="pb-4 pr-4">Stock</th>
                    <th className="pb-4 pr-4">Category</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {products.map((p) => (
                    <tr
                      key={p._id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          {p.images?.[0] ? (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              loading="lazy"
                              className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-300">
                              <ImageOff size={17} />
                            </div>
                          )}

                          <div>
                            <strong className="font-bold text-slate-900">
                              {p.name}
                            </strong>

                            {p.isActive === false && (
                              <span className="ml-2 text-[10px] font-semibold text-rose-600">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 pr-4">
                        <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs font-bold text-slate-700">
                          {p.sku}
                        </code>
                      </td>

                      <td className="py-4 pr-4 font-extrabold text-slate-950">
                        {formatPrice(p)}
                      </td>

                      <td className="py-4 pr-4 font-medium text-slate-700">
                        {p.stock}
                      </td>

                      <td className="py-4 pr-4 font-medium text-slate-600">
                        {p.category?.name || "General"}
                      </td>

                      <td className="py-4 text-right">
                        <button
                          onClick={() => openDeleteConfirmation(p)}
                          type="button"
                          title="Delete product"
                          aria-label={`Delete ${p.name}`}
                          className="inline-flex items-center justify-center rounded-xl p-2.5 text-rose-500 transition-colors hover:bg-rose-50 active:bg-rose-100"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* CREATE PRODUCT MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-9998 flex items-end justify-center overflow-y-auto bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCreateModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-product-title"
            className="relative max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:max-h-[90vh] sm:rounded-2xl sm:p-8"
          >
            <button
              onClick={closeCreateModal}
              disabled={submitting}
              type="button"
              aria-label="Close modal"
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            >
              <X size={20} />
            </button>

            <h2
              id="create-product-title"
              className="mb-2 pr-8 text-xl font-extrabold tracking-tight text-slate-900"
            >
              Add New Product
            </h2>

            <p className="mb-6 text-xs text-slate-500">
              Enter the product information below.
            </p>

            <form id="product-admin" onSubmit={handleCreate} className="space-y-4">
              {/* PRODUCT NAME */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Product Name
                </label>

                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={newProd.name}
                  onChange={(e) =>
                    setNewProd({ ...newProd, name: e.target.value })
                  }
                  placeholder="Enter product name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* SKU AND CATEGORY */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    SKU
                  </label>

                  <input
                    type="text"
                    required
                    value={newProd.sku}
                    onChange={(e) =>
                      setNewProd({
                        ...newProd,
                        sku: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="SKU-001"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Category
                  </label>

                  <select
                    required
                    value={newProd.category}
                    onChange={(e) =>
                      setNewProd({
                        ...newProd,
                        category: e.target.value,
                      })
                    }
                    disabled={categories.length === 0}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {categories.length === 0 ? (
                      <option value="">No categories available</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* PRICE */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Price (₹)
                  </label>

                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={newProd.price}
                    onChange={(e) =>
                      setNewProd({
                        ...newProd,
                        price: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Discount Price (₹)
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={newProd.discountPrice}
                    onChange={(e) =>
                      setNewProd({
                        ...newProd,
                        discountPrice:
                          e.target.value === ""
                            ? ""
                            : Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* STOCK */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Initial Stock
                  </label>

                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={newProd.stock}
                    onChange={(e) =>
                      setNewProd({
                        ...newProd,
                        stock: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Low Stock Threshold
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newProd.reorderThreshold}
                    onChange={(e) =>
                      setNewProd({
                        ...newProd,
                        reorderThreshold:
                          e.target.value === ""
                            ? ""
                            : Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* IMAGE URL */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Image URL
                </label>

                <input
                  type="url"
                  value={newProd.images}
                  onChange={(e) =>
                    setNewProd({
                      ...newProd,
                      images: e.target.value,
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description
                </label>

                <textarea
                  rows={3}
                  required
                  maxLength={2000}
                  value={newProd.description}
                  onChange={(e) =>
                    setNewProd({
                      ...newProd,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your product..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={submitting}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || categories.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={17} />
                      Save Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedProduct && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-description"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                <AlertTriangle size={24} />
              </div>

              <div>
                <h2
                  id="delete-title"
                  className="text-lg font-extrabold text-slate-900"
                >
                  Delete Product?
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Please confirm your action
                </p>
              </div>
            </div>

            <p
              id="delete-description"
              className="text-sm leading-6 text-slate-600"
            >
              Are you sure you want to delete{" "}
              <strong className="font-bold text-slate-900">
                {selectedProduct.name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
