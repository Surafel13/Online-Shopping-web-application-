import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "../components/ui/button";
import { ProductCard } from "../components/shared/ProductCard";
import type { ProductType } from "../components/shared/ProductCard";
import { useScrollAnimation } from "../hooks/useScrollAnimation";
import { ArrowRight, Send } from "lucide-react";
import { Input } from "../components/ui/input";
import { PageTransition } from "../components/layout/PageTransition";
import { productService, categoryService } from "../services";
import {
  buildCategoryMap,
  mapApiProductToProductType,
  mapCategoriesForHome,
} from "../lib/mappers";

gsap.registerPlugin(ScrollTrigger);

export function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useScrollAnimation({
    direction: "up",
    stagger: 0.15,
    distance: 50,
  });
  const bestsellersRef = useScrollAnimation({ direction: "up", stagger: 0.12 });
  const promoRef = useScrollAnimation({ direction: "left", distance: 60 });
  const newsletterRef = useScrollAnimation({ direction: "up", distance: 30 });
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; image: string; count: number }>
  >([]);
  const [bestSellers, setBestSellers] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [products, apiCategories] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
        ]);
        const categoryMap = buildCategoryMap(apiCategories);
        const mappedProducts = products.map((product) =>
          mapApiProductToProductType(product, categoryMap),
        );
        setCategories(mapCategoriesForHome(apiCategories, products));
        setBestSellers(mappedProducts.slice(0, 4));
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        ".hero-badge",
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      )
        .fromTo(
          ".hero-heading",
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
          "-=0.3",
        )
        .fromTo(
          ".hero-sub",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" },
          "-=0.5",
        )
        .fromTo(
          ".hero-btns",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.3",
        );

      gsap.to(".hero-img", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <PageTransition>
      <div className="flex flex-col w-full selection:bg-blue-500/20">
        {/* Announcement bar */}
        <aside
          aria-label="Announcement"
          className="relative z-30 w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-3 px-4 text-center text-xs sm:text-sm font-medium tracking-wide"
        >
          <div className="container flex items-center justify-center gap-2">
            <span>✨ Free express shipping on orders over $150</span>
            <span className="hidden sm:inline opacity-60">•</span>
            <Link
              to="/collections"
              className="underline underline-offset-4 font-semibold hover:opacity-90 transition-opacity"
            >
              Shop the new collection
            </Link>
          </div>
        </aside>

        {/* Hero */}
        <section
          ref={heroRef}
          className="relative min-h-[92vh] flex items-center justify-center overflow-hidden py-24 lg:py-0"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10 pointer-events-none" />
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
            alt="Elegance Defined"
            className="hero-img absolute inset-0 w-full h-full object-cover object-center scale-110 select-none"
          />
          <div className="relative z-20 text-center text-white px-4 sm:px-6 max-w-5xl mx-auto w-full">
            <span className="hero-badge inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium uppercase tracking-[0.25em] px-5 py-2.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Spring / Summer 2024
            </span>
            <h1 className="hero-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight leading-[1.08] lg:leading-[1.02]">
              Elegance Defined
              <br />
              <span className="bg-gradient-to-r from-blue-200 via-white to-blue-100 bg-clip-text text-transparent">
                By Modernity
              </span>
            </h1>
            <p className="hero-sub text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover our curated collection of sustainably sourced essentials
              designed for the conscious professional.
            </p>
            <div className="hero-btns flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <Link to="/collections" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-gray-900 hover:bg-white/95 h-14 px-8 text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Shop The Collection <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/collections" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-white border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/15 hover:border-white/50 h-14 px-8 text-base font-medium transition-all duration-300"
                >
                  Explore Lookbook
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden md:flex flex-col items-center gap-2 text-white/60 pointer-events-none">
            <span className="text-[10px] uppercase tracking-[0.3em] font-medium">
              Scroll
            </span>
            <div className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent animate-pulse" />
          </div>
        </section>

        {/* Trust strip */}
        <section
          aria-label="Features"
          className="border-y border-border/50 py-10"
        >
          <div className="container px-4 sm:px-6 max-w-screen-xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            {[
              {
                icon: "🚚",
                title: "Global Express",
                sub: "Free on orders over $150",
              },
              {
                icon: "🔒",
                title: "Secure Checkout",
                sub: "100% encrypted payment",
              },
              {
                icon: "↩️",
                title: "Easy Returns",
                sub: "30-day effortless policy",
              },
              {
                icon: "🌱",
                title: "Sustainable",
                sub: "Eco-conscious packaging",
              },
            ].map((badge) => (
              <div key={badge.title} className="flex items-center gap-3">
                <span className="text-2xl shrink-0">{badge.icon}</span>
                <div>
                  <h4 className="font-semibold text-sm tracking-tight">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section ref={categoriesRef} className="py-24 lg:py-32">
          <div className="container px-4 sm:px-6 max-w-screen-xl mx-auto">
            <div className="scroll-anim text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-3 block">
                Curated For You
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                Shop By Category
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                Explore our thoughtfully curated collections designed for every
                aspect of your lifestyle.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/collections?category=${encodeURIComponent(cat.name)}`}
                  className="scroll-anim group relative aspect-[4/5] sm:aspect-[3/4] rounded-3xl overflow-hidden bg-muted"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 text-white">
                    <h3 className="font-bold text-xl sm:text-2xl mb-1.5 tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-white/80 font-medium flex items-center gap-1.5">
                      {cat.count} products
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Best sellers */}
        <section
          ref={bestsellersRef}
          className="py-24 lg:py-32 border-y border-border/40 overflow-hidden"
        >
          <div className="container px-4 sm:px-6 max-w-screen-xl mx-auto">
            <div className="scroll-anim flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-16">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-3 block">
                  Most Popular
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  Best Sellers
                </h2>
              </div>
              <Link
                to="/collections?sort=bestsellers"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors py-2"
              >
                <span>View All Products</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Auto-scrolling marquee */}
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-background to-transparent" />

            {isLoading ? (
              <div className="container px-4 sm:px-6 max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="scroll-anim aspect-[4/5] rounded-2xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="best-seller-viewport px-4 sm:px-6 lg:px-10">
                <div className="best-seller-marquee flex w-max gap-6 lg:gap-8">
                  {[...bestSellers, ...bestSellers].map((product, index) => (
                    <div
                      key={`${product.id}-${index}`}
                      className="w-[260px] sm:w-[300px] lg:w-[320px] shrink-0 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <style>{`
    @keyframes best-seller-scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-50%); }
    }
    .best-seller-viewport {
      overflow: hidden;
    }
    .best-seller-marquee {
      animation: best-seller-scroll 30s linear infinite;
    }
    .best-seller-marquee:hover {
      animation-play-state: paused;
    }
    @media (prefers-reduced-motion: reduce) {
      .best-seller-marquee {
        animation: none;
      }
    }
  `}</style>
        </section>

        {/* Promo */}
        <section ref={promoRef} className="py-24 lg:py-32 overflow-hidden">
          <div className="container px-4 sm:px-6 max-w-screen-xl mx-auto">
            <div className="scroll-anim relative rounded-[2.5rem] overflow-hidden bg-gray-950 flex flex-col lg:flex-row items-stretch">
              <div className="flex-1 p-8 sm:p-12 lg:p-20 text-white z-10">
                <span className="inline-flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Limited Edition
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-[1.1]">
                  The Aura Collection
                  <br />
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                    Has Arrived
                  </span>
                </h2>
                <p className="text-white/70 text-base sm:text-lg mb-10 max-w-lg leading-relaxed">
                  Performance meets luxury. Our signature outerwear line
                  engineered with recycled materials and cutting-edge design.
                </p>
                <Link to="/collections">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Shop Aura Collection <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="w-full lg:w-1/2 h-80 sm:h-96 lg:h-auto relative overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"
                  alt="Aura Collection"
                  className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent lg:hidden" />
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section
          ref={newsletterRef}
          className="py-24 lg:py-32 border-t border-border/40"
        >
          <div className="container px-4 sm:px-6 max-w-screen-xl mx-auto">
            <div className="scroll-anim text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400 mb-3 block">
                Stay Connected
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Join the Sheger Gebeya
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
                Subscribe to receive exclusive access to new arrivals, limited
                drops, and insider-only discounts.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  className="h-14 bg-background px-4 rounded-xl text-base border-border/80 focus-visible:ring-blue-600"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Subscribe <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground/80 mt-4 font-medium">
                By subscribing, you agree to our Privacy Policy. Unsubscribe
                anytime.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
