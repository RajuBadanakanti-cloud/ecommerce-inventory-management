import { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Package,
  CreditCard,
  Lock,
  RefreshCw,
  Receipt,
  Clock,
  Hash,
  LoaderCircle,
  ShoppingBag,
  Check
} from 'lucide-react';


// HELPER FUNCTIONS >>>>>>>>>>.
const createIdempotencyKey = (orderId) => {
  const key = `payment-idempotency-${orderId}`;
  const existingKey = sessionStorage.getItem(key);

  if (existingKey) return existingKey;

  const newKey = `IDEMP-${orderId}-${Date.now()}`;
  sessionStorage.setItem(key, newKey);

  return newKey;
};

const formatPrice = (amountInPaise) => {
  return `₹${(Number(amountInPaise || 0) / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// PAYMENT PAGE >>>>>>>>>>>>>>>>>>>>>>>>>

export default function MockPaymentPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loadingOrder, setLoadingOrder] = useState(!order);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [idempotencyKey, setIdempotencyKey] = useState(
    () => createIdempotencyKey(orderId)
  );


  // FETCH ORDER >>>>>>>>>>>>>>.
  useEffect(() => {
    if (order) return;

    let isActive = true;

    const fetchOrder = async () => {
      try {
        setLoadingOrder(true);
        setErrorMsg('');

        const response = await axiosInstance.get(`/orders/${orderId}`);

        const fetchedOrder =
          response.data?.order ||
          response.data?.data?.order ||
          response.data?.data ||
          response.data;

        if (isActive) {
          setOrder(fetchedOrder);
        }
      } catch (err) {
        if (isActive) {
          setErrorMsg(
            err.response?.data?.message ||
            'Unable to load order details. Please try again.'
          );
        }
      } finally {
        if (isActive) {
          setLoadingOrder(false);
        }
      }
    };

    fetchOrder();

    return () => {
      isActive = false;
    };
  }, [orderId, order]);

  // SIMULATE PAYMENT >>>>>>>>>>>>>>>>>>>>>>
  const handleSimulate = async (scenario) => {
    if (processing || !order?._id) return;

    setProcessing(true);
    setErrorMsg('');

    try {
      const response = await axiosInstance.post('/payments/simulate', {
        orderId: order._id,
        scenario,
        idempotencyKey
      });

      const paymentResult = response.data;

      setResult(paymentResult);

      if (paymentResult.success) {
        sessionStorage.removeItem(`payment-idempotency-${orderId}`);

        // Update local order status after successful payment
        if (paymentResult.data?.order) {
          setOrder((previousOrder) => ({
            ...previousOrder,
            ...paymentResult.data.order
          }));
        }
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        'Payment could not be processed. Please try again.'
      );
    } finally {
      setProcessing(false);
    }
  };

  // RETRY PAYMENT >>>>>>>>>>>.
  const handleRetry = () => {
    const newKey = `IDEMP-${orderId}-${Date.now()}`;

    sessionStorage.setItem(
      `payment-idempotency-${orderId}`,
      newKey
    );

    setIdempotencyKey(newKey);
    setResult(null);
    setErrorMsg('');
  };

  // DUPLICATE PAYMENT TEST >>>>>>
  const handleDuplicateTest = () => {
    handleSimulate('success');
  };

  // ORDER STATUS >>>>>>>>>>>>>>

  const totalAmount =
    order?.totalAmountInPaise ??
    order?.totalAmount ??
    0;

  const orderItems = order?.items || [];

  const isAlreadyPaid = order?.paymentStatus === 'paid';

  const isSuccessful =
    result?.success === true || isAlreadyPaid;

  // const isFailed = result && !isSuccessful;

  // LOADING SCREEN >>>>>>>>>>>>>>>
  if (loadingOrder) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-5">
        <LoaderCircle className="h-10 w-10 animate-spin text-blue-600 mb-4" />

        <p className="text-sm font-semibold text-slate-600">
          Loading secure payment session...
        </p>
      </div>
    );
  }

  // ORDER NOT FOUND >>>>>>>>>>>>>>>>>>>>>>>
  if (!order || !order._id) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 sm:p-10 text-center shadow-sm">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Package size={30} />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900">
            Order Not Found
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {errorMsg ||
              'We could not find the order associated with this payment session.'}
          </p>

          <Link
            to="/orders"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            View My Orders
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    );
  }

  // MAIN UI >>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* PAGE HEADER */}
        <div className="mb-7 text-center sm:mb-9">

          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <Lock size={23} />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {isAlreadyPaid || result?.success
              ? 'Order Confirmation'
              : 'Secure Checkout'}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {isSuccessful
              ? 'Your purchase has been successfully confirmed.'
              : 'Complete your order using our simulated payment gateway.'}
          </p>

        </div>

        {/* SIMULATION NOTICE */}
        {!isSuccessful && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">

            <AlertTriangle
              className="mt-0.5 shrink-0 text-amber-600"
              size={22}
            />

            <div>
              <h3 className="text-sm font-extrabold text-amber-900">
                DEMONSTRATION PAYMENT GATEWAY
              </h3>

              <p className="mt-1 text-xs leading-5 text-amber-800 sm:text-sm">
                This is an academic payment simulation. No real money will be
                deducted, and no actual bank or UPI transaction will take place.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
          {/* PAYMENT / CONFIRMATION SECTION */}
          <section className="lg:col-span-7">

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

              {/* SECTION HEADER */}

              <div className="border-b border-slate-100 p-5 sm:p-7">

                <div className="flex items-center gap-3">

                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isSuccessful
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-blue-50 text-blue-600'
                  }`}>
                    {isSuccessful
                      ? <CheckCircle2 size={22} />
                      : <CreditCard size={22} />}
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {isSuccessful
                        ? 'Order Confirmation'
                        : 'Payment Method'}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {isSuccessful
                        ? 'Your order details and payment status'
                        : 'Select a payment simulation below'}
                    </p>
                  </div>

                </div>
              </div>

              <div className="p-5 sm:p-7">

                {/* ==================================
                    SUCCESS SCREEN
                ================================== */}

                {(result || isAlreadyPaid) ? (

                  isSuccessful ? (

                    <div className="py-5 text-center sm:py-8">

                      {/* SUCCESS ICON */}

                      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <CheckCircle2 size={45} />
                      </div>

                      {/* SUCCESS MESSAGE */}

                      <div className="mx-auto max-w-md">

                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                          <Check size={14} />
                          ORDER CONFIRMED
                        </div>

                        <h2 className="text-2xl font-extrabold text-emerald-700 sm:text-3xl">
                          {isAlreadyPaid && !result
                            ? 'Your Order Is Already Placed!'
                            : 'Order Placed Successfully!'}
                        </h2>

                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
                          Your payment has been confirmed and your order is
                          successfully placed. You can track your order
                          anytime from My Orders.
                        </p>

                      </div>

                      {/* ORDER DETAILS */}

                      <div className="my-7 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-left sm:p-5">

                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-500">
                            Payment Status
                          </span>

                          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                            <CheckCircle2 size={15} />
                            Paid
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-500">
                            Order Status
                          </span>

                          <span className="font-bold text-emerald-700">
                            {order.orderStatus || 'Confirmed'}
                          </span>
                        </div>

                        <div className="mt-3 flex items-start justify-between gap-3 text-sm">
                          <span className="shrink-0 text-slate-500">
                            Order Number
                          </span>

                          <span className="break-all text-right font-semibold text-slate-800">
                            {order.orderNumber || order._id}
                          </span>
                        </div>

                        {result?.data?.payment?.transactionRef && (
                          <div className="mt-3 flex items-start justify-between gap-3 text-sm">
                            <span className="shrink-0 text-slate-500">
                              Transaction Reference
                            </span>

                            <span className="break-all text-right font-mono text-xs font-semibold text-slate-800">
                              {result.data.payment.transactionRef}
                            </span>
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-emerald-100 pt-3 text-sm">
                          <span className="text-slate-500">
                            Amount Paid
                          </span>

                          <span className="text-lg font-extrabold text-slate-900">
                            {formatPrice(totalAmount)}
                          </span>
                        </div>

                      </div>

                      {/* NEXT ACTIONS */}

                      <div className="space-y-3">

                        {/* VIEW MY ORDERS */}

                        <button
                          type="button"
                          onClick={() => navigate('/orders')}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                        >
                          <Package size={18} />
                          View My Orders
                          <ArrowRight size={17} />
                        </button>

                        {/* CONTINUE SHOPPING */}

                        <button
                          type="button"
                          onClick={() => navigate('/products')}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <ShoppingBag size={18} />
                          Continue Shopping
                          <ArrowRight size={17} />
                        </button>

                      </div>

                      <p className="mt-5 text-xs leading-5 text-slate-400">
                        Thank you for shopping with ShopSphere!
                      </p>

                    </div>

                  ) : (

                    /* ==================================
                       FAILED PAYMENT SCREEN
                    ================================== */

                    <div className="py-5 text-center sm:py-8">

                      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                        <XCircle size={42} />
                      </div>

                      <h2 className="text-2xl font-extrabold text-rose-700">
                        Payment Failed
                      </h2>

                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        {result.message ||
                          'The simulated bank declined this transaction.'}
                      </p>

                      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">

                        <button
                          type="button"
                          onClick={handleRetry}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                        >
                          <RefreshCw size={17} />
                          Try Again
                        </button>

                        <Link
                          to="/orders"
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                          View Orders
                        </Link>

                      </div>

                    </div>
                  )

                ) : (

                  /* ==================================
                     PAYMENT OPTIONS
                  ================================== */

                  <>

                    <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Available Payment Options
                    </h3>

                    {/* PAYMENT ACTION */}
                    <button
                      type="button"
                      onClick={() => handleSimulate('success')}
                      disabled={processing}
                      className="group mb-3 flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-blue-400 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-60 sm:p-5"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <CreditCard size={24} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Simulate {order.paymentMethod === 'upi' ? 'UPI' : 'Card'} Payment
                        </h4>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Confirm the payment using your selected checkout method
                        </p>
                      </div>

                      <ArrowRight className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" size={19} />
                    </button>

                    {/* FAILED PAYMENT */}

                    <button
                      type="button"
                      onClick={() => handleSimulate('failure')}
                      disabled={processing}
                      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-rose-300 hover:bg-rose-50/40 disabled:cursor-not-allowed disabled:opacity-60 sm:p-5"
                    >

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <XCircle size={23} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Simulate Payment Failure
                        </h4>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Test a declined transaction
                        </p>
                      </div>

                      <ArrowRight className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-rose-600" size={19} />

                    </button>

                    {/* IDEMPOTENCY TEST */}

                    <div className="mt-6 rounded-2xl border border-dashed border-blue-200 bg-blue-50/50 p-4 sm:p-5">

                      <div className="flex items-start gap-3">

                        <RefreshCw
                          className="mt-0.5 shrink-0 text-blue-600"
                          size={19}
                        />

                        <div className="min-w-0 flex-1">

                          <h4 className="text-sm font-extrabold text-slate-900">
                            Idempotency Test
                          </h4>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Send the same successful payment request again
                            using the same idempotency key to test duplicate
                            payment protection.
                          </p>

                          <button
                            type="button"
                            onClick={handleDuplicateTest}
                            disabled={processing}
                            className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold text-blue-700 transition hover:text-blue-900 disabled:opacity-50"
                          >
                            Test Duplicate Request
                            <ArrowRight size={14} />
                          </button>

                        </div>
                      </div>
                    </div>

                    {/* PROCESSING */}

                    {processing && (
                      <div className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-blue-700">

                        <LoaderCircle
                          size={19}
                          className="animate-spin"
                        />

                        Processing your payment...

                      </div>
                    )}

                    {/* ERROR */}

                    {errorMsg && (
                      <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">

                        <AlertTriangle
                          size={19}
                          className="mt-0.5 shrink-0"
                        />

                        <p className="wrap-break-words">
                          {errorMsg}
                        </p>

                      </div>
                    )}

                  </>
                )}

              </div>

              {/* SECURITY FOOTER */}

              <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-4 text-center text-xs text-slate-500">

                <ShieldCheck
                  size={16}
                  className="shrink-0 text-emerald-600"
                />

                Secure simulated payment session

              </div>

            </div>

          </section>

          {/* ORDER SUMMARY */}
          <aside className="lg:col-span-5">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* SUMMARY HEADER */}
              <div className="border-b border-slate-100 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Receipt size={20} />
                  </div>

                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Order Summary
                    </h2>

                    <p className="text-xs text-slate-500">
                      Review your purchase
                    </p>
                  </div>

                </div>

              </div>

              <div className="p-5 sm:p-6">
                {/* ORDER NUMBER */}
                <div className="mb-5 rounded-xl bg-slate-50 p-4">

                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Order Number
                  </p>

                  <p className="mt-1 break-all text-sm font-extrabold text-slate-900">
                    {order.orderNumber || order._id}
                  </p>

                </div>

                {/* ITEM COUNT */}

                <div className="mb-5 flex items-center justify-between gap-3">

                  <span className="text-sm text-slate-500">
                    Order Items
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {orderItems.length}{' '}
                    {orderItems.length === 1 ? 'Item' : 'Items'}
                  </span>

                </div>

                {/* PRODUCT LIST */}

                {orderItems.length > 0 && (

                  <div className="mb-5 max-h-64 space-y-4 overflow-y-auto pr-1">

                    {orderItems.map((item) => (

                      <div
                        key={item._id || item.product}
                        className="flex items-start justify-between gap-3"
                      >

                        <div className="min-w-0">

                          <p className="warap-break-words text-sm font-semibold text-slate-800">
                            {item.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Quantity: {item.quantity}
                          </p>

                        </div>

                        <span className="shrink-0 text-sm font-bold text-slate-900">
                          {formatPrice(item.itemTotalInPaise)}
                        </span>

                      </div>

                    ))}

                  </div>
                )}

                {/* PRICE BREAKDOWN */}

                <div className="space-y-3 border-t border-slate-100 pt-5 text-sm">

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">
                      Subtotal
                    </span>

                    <span className="font-semibold text-slate-900">
                      {formatPrice(order.subtotalInPaise)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">
                      Discount
                    </span>

                    <span className="font-semibold text-emerald-600">
                      -{formatPrice(order.discountInPaise)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">
                      Shipping
                    </span>

                    <span className="font-semibold text-slate-900">
                      {Number(order.shippingFeeInPaise || 0) === 0
                        ? 'FREE'
                        : formatPrice(order.shippingFeeInPaise)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-slate-500">
                      GST / Tax
                    </span>

                    <span className="font-semibold text-slate-900">
                      {formatPrice(order.taxInPaise)}
                    </span>
                  </div>

                </div>

                {/* TOTAL */}

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">

                  <span className="text-sm font-extrabold text-slate-900">
                    Total Amount
                  </span>

                  <span className="text-2xl font-extrabold tracking-tight text-blue-700">
                    {formatPrice(totalAmount)}
                  </span>

                </div>

                {/* TRUST MESSAGE */}

                <div className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">

                  <ShieldCheck size={16} className="mt-0.5 shrink-0" />

                  <p>
                    Your order amount is calculated and verified by the
                    backend server.
                  </p>

                </div>

              </div>

            </div>

            {/* PAYMENT SESSION DETAILS */}
            {!isSuccessful && (

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">

                <h3 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">

                  <Hash size={15} />

                  Payment Session

                </h3>

                <div className="flex items-start gap-2 text-xs text-slate-500">

                  <Clock size={15} className="mt-0.5 shrink-0" />

                  <div className="min-w-0">

                    <p className="font-semibold text-slate-700">
                      Idempotency Key
                    </p>

                    <p className="mt-1 break-all font-mono text-[10px] leading-5">
                      {idempotencyKey}
                    </p>

                  </div>

                </div>

              </div>

            )}
          </aside>
        </div>

        {/* BACK TO ORDERS */}

        {!result && !isAlreadyPaid && (

          <div className="mt-6 text-center">

            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >

              <ArrowRight size={15} className="rotate-180" />

              Back to My Orders

            </Link>

          </div>

        )}

        {/* FOOTER */}
        <p className="mt-8 text-center text-[11px] leading-5 text-slate-400">
          ShopSphere · Demonstration Payment Environment
        </p>

      </div>

    </main>
  );
}
