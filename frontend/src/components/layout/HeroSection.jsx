import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, PackageCheck, Tag, Zap } from 'lucide-react';

// Product slides for the hero stage. Swap images / labels freely.
const SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80',
    alt: 'Premium wireless headphones',
    label: 'Wireless Headphones',
    stock: '24 in stock',
  },
  {
    src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80',
    alt: 'Classic wrist watch',
    label: 'Classic Watch',
    stock: '12 in stock',
  },
  {
    src: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80',
    alt: 'Red running sneaker',
    label: 'Running Sneakers',
    stock: '38 in stock',
  },
];

const MARQUEE_ITEMS = [
  { icon: Tag, text: 'Exclusive Offers' },
  { icon: ShieldCheck, text: 'Secure Payments' },
  { icon: PackageCheck, text: 'Real-Time Inventory' },
  { icon: Truck, text: 'Seamless Ordering' },
  { icon: Zap, text: 'Premium Products' },
];

const HeroSection = () => {
  const [active, setActive] = useState(0);

  // Auto-rotate the product stage
  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-slate-950 pt-14 text-white sm:pt-20 md:pt-28">
      {/* ---------- Background layers ---------- */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.22),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.16),transparent_50%)]" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 animate-hero-blob rounded-full bg-indigo-600/25 blur-3xl motion-reduce:animate-none" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 animate-hero-blob rounded-full bg-blue-500/25 blur-3xl [animation-delay:-6s] motion-reduce:animate-none" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.09)_1px,transparent_1px)] bg-size:56px_56px] mask-[radial-gradient(ellipse_at_center,black_25%,transparent_75%)]" />

      {/* Tiny floating particles */}
      <span className="pointer-events-none absolute left-[8%] top-[18%] h-2 w-2 animate-hero-float rounded-full bg-blue-400/70 motion-reduce:animate-none" />
      <span className="pointer-events-none absolute left-[46%] top-[10%] hidden h-1.5 w-1.5 animate-hero-float-rev rounded-full bg-indigo-300/70 motion-reduce:animate-none sm:block" />
      <span className="pointer-events-none absolute right-[10%] top-[24%] h-2 w-2 animate-hero-float-slow rounded-full bg-cyan-300/60 motion-reduce:animate-none" />

      {/* ---------- Main content ---------- */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-16 px-5 sm:px-8 lg:flex-row lg:justify-between lg:gap-12 lg:px-12">
        {/* Text column */}
        <div className="w-full text-center lg:flex-[1_1_500px] lg:text-left">
          <span className="mb-6 inline-flex animate-hero-rise items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-400 shadow-sm backdrop-blur-md [animation-delay:100ms] motion-reduce:animate-none sm:text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-hero-ping rounded-full bg-blue-400 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />
            </span>
            <Sparkles size={16} className="text-blue-400" />
            Next-Gen E-Commerce &amp; Inventory Platform
          </span>

          <h1 className="mb-6 animate-hero-rise text-4xl font-extrabold leading-[1.15] tracking-tight [animation-delay:250ms] motion-reduce:animate-none min-[400px]:text-[2.6rem] sm:text-5xl lg:text-6xl">
            Discover Premium <br className="hidden sm:block" />
            <span className="animate-hero-shine bg-linear-to-r from-blue-400 via-indigo-200 to-blue-500 bg-size-[200%_auto] bg-clip-text text-transparent motion-reduce:animate-none">
              Products for Smarter
            </span>{' '}
            Living.
          </h1>

          <p className="mx-auto mb-9 max-w-xl animate-hero-rise text-base leading-relaxed text-slate-400 [animation-delay:400ms] motion-reduce:animate-none sm:text-lg lg:mx-0">
            Find your favorite products, enjoy exclusive offers, and experience seamless ordering
            with secure payments and real-time inventory management
          </p>

          {/* Buttons */}
          <div className="flex animate-hero-rise flex-col items-stretch gap-3 [animation-delay:550ms] motion-reduce:animate-none sm:flex-row sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
            <Link
              to="/products"
              className="group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-blue-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-blue-500/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:translate-y-0 active:scale-[0.98]"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/25 transition-all duration-700 group-hover:left-[150%]" />
              <span className="relative">Start Exploring</span>
              <ArrowRight size={18} className="relative transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>

            <Link
              to="/admin"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/50 px-7 py-4 text-sm font-semibold text-slate-200 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-500/60 hover:bg-slate-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 active:scale-[0.98]"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Product stage */}
        <div className="flex w-full animate-hero-pop justify-center [animation-delay:350ms] motion-reduce:animate-none lg:flex-[1_1_400px]">
          <div className="relative w-full max-w-76 min-[400px]:max-w-84 sm:max-w-md">
            {/* Dashed orbit ring with orbiting dots */}
            <div className="pointer-events-none absolute -inset-5 animate-hero-spin rounded-full border border-dashed border-blue-500/30 motion-reduce:animate-none sm:-inset-9">
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-blue-400 shadow-[0_0_14px_#60a5fa]" />
              <span className="absolute -bottom-1 left-1/4 h-2 w-2 rounded-full bg-indigo-300 shadow-[0_0_10px_#a5b4fc]" />
            </div>

            {/* Glow */}
            <div className="absolute -inset-2 rounded-4xl bg-linear-to-r from-blue-600 to-indigo-600 opacity-40 blur-2xl" />

            {/* Floating frame with spinning gradient border */}
            <div className="relative animate-hero-float motion-reduce:animate-none">
              <div className="relative overflow-hidden rounded-3xl p-0.5 shadow-2xl shadow-black/60">
                <div className="absolute -inset-1/2 animate-hero-spin-fast bg-[conic-gradient(from_0deg,#2563eb,#6366f1,#22d3ee,#2563eb)] motion-reduce:animate-none" />

                <div className="relative aspect-4/5 overflow-hidden rounded-[22px] bg-slate-900">
                  {SLIDES.map((s, i) => (
                    <img
                      key={s.src}
                      src={s.src}
                      alt={s.alt}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                        i === active ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                  {/* Ken-burns zoom on the active image */}
                  <div key={active} className="absolute inset-0 animate-hero-kenburns motion-reduce:animate-none">
                    <img
                      src={SLIDES[active].src}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/10 to-transparent" />

                  {/* Caption + tappable progress bars */}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p key={`l-${active}`} className="animate-hero-rise text-sm font-semibold sm:text-base motion-reduce:animate-none">
                      {SLIDES[active].label}
                    </p>
                    <div className="mt-3 flex gap-2" role="tablist" aria-label="Featured products">
                      {SLIDES.map((s, i) => (
                        <button
                          key={s.label}
                          type="button"
                          role="tab"
                          aria-selected={i === active}
                          aria-label={`Show ${s.label}`}
                          onClick={() => setActive(i)}
                          className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                        >
                          {i === active && (
                            <span
                              key={`p-${active}`}
                              className="absolute inset-0 origin-left animate-hero-progress bg-white motion-reduce:animate-none"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating chips */}
            <div className="absolute -left-2 top-10 flex animate-hero-float-slow items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/85 px-3 py-2 shadow-xl backdrop-blur-md motion-reduce:animate-none sm:-left-12 sm:px-4 sm:py-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400">
                <PackageCheck size={16} />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] text-slate-400 sm:text-xs">Real-time stock</p>
                <p key={active} className="animate-hero-pop text-xs font-semibold sm:text-sm motion-reduce:animate-none">
                  {SLIDES[active].stock}
                </p>
              </div>
            </div>

            <div className="absolute -right-2 bottom-24 flex animate-hero-float-rev items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/85 px-3 py-2 shadow-xl backdrop-blur-md motion-reduce:animate-none sm:-right-12 sm:px-4 sm:py-3">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/15 text-blue-400">
                <ShieldCheck size={16} />
              </span>
              <div className="leading-tight">
                <p className="text-[11px] text-slate-400 sm:text-xs">Checkout</p>
                <p className="text-xs font-semibold sm:text-sm">100% secure</p>
              </div>
            </div>

            {/* Wiggling offer badge */}
            <span className="absolute -right-1 -top-4 animate-hero-wiggle rounded-full bg-amber-400 px-3 py-1.5 text-[11px] font-bold text-slate-900 shadow-lg shadow-amber-500/30 motion-reduce:animate-none sm:right-2 sm:text-xs">
              Exclusive Offers
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Scrolling feature strip ---------- */}
      <div className="relative mt-16 border-y border-white/5 bg-slate-900/40 py-4 backdrop-blur-sm sm:mt-20">
        <div className="overflow-hidden mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-hero-marquee motion-reduce:animate-none">
            {[0, 1].map((copy) => (
              <ul key={copy} className="flex shrink-0 items-center gap-10 pr-10" aria-hidden={copy === 1}>
                {MARQUEE_ITEMS.map(({ icon: Icon, text }) => (
                  <li key={text} className="inline-flex items-center gap-2.5 whitespace-nowrap text-sm font-medium text-slate-300">
                    <Icon size={16} className="text-blue-400" />
                    {text}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;