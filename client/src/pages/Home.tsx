import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '../components/ui/button';
import { ProductCard } from '../components/shared/ProductCard';
import type { ProductType } from '../components/shared/ProductCard';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { ArrowRight, Send } from 'lucide-react';
import { Input } from '../components/ui/input';
import { PageTransition } from '../components/layout/PageTransition';
import { productService, categoryService } from '../services';
import { buildCategoryMap, mapApiProductToProductType, mapCategoriesForHome } from '../lib/mappers';

gsap.registerPlugin(ScrollTrigger);

export function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useScrollAnimation({ direction: 'up', stagger: 0.15, distance: 50 });
  const bestsellersRef = useScrollAnimation({ direction: 'up', stagger: 0.12 });
  const promoRef = useScrollAnimation({ direction: 'left', distance: 60 });
  const newsletterRef = useScrollAnimation({ direction: 'up', distance: 30 });
  const [categories, setCategories] = useState<Array<{ id: string; name: string; image: string; count: number }>>([]);
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
        const mappedProducts = products.map((product) => mapApiProductToProductType(product, categoryMap));
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
      tl.fromTo('.hero-badge', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' })
        .fromTo('.hero-heading', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, '-=0.3')
        .fromTo('.hero-sub', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.5')
        .fromTo('.hero-btns', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3');

      // Parallax on hero image
      gsap.to('.hero-img', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <PageTransition>
      <div className="flex flex-col w-full">
        {/* Top Banner */}
        <div className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2.5 text-center text-sm font-medium tracking-wide">
          ✨ Free express shipping on orders over $150 — <Link to="/collections" className="underline font-semibold ml-1">Shop the new collection</Link>
        </div>

        {/* ─── HERO SECTION ─── */}
        <section ref={heroRef} className="relative h-[90vh] min-h-[650px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60 z-10" />
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
            alt="Elegance Defined"
            className="hero-img absolute inset-0 w-full h-full object-cover scale-110"
          />
          <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
            <span className="hero-badge inline-block bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-[0.25em] px-5 py-2 rounded-full mb-8">
              Spring / Summer 2024
            </span>
            <h1 className="hero-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-[0.95]">
              Elegance Defined<br />
              <span className="bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">By Modernity</span>
            </h1>
            <p className="hero-sub text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover our curated collection of sustainably sourced essentials designed for the conscious professional.
            </p>
            <div className="hero-btns flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/collections">
                <Button size="lg" className="w-full sm:w-auto bg-white text-black hover:bg-white/90 h-13 px-8 text-base font-semibold shadow-xl shadow-white/10">
                  Shop The Collection <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white/40 bg-white/5 backdrop-blur-sm hover:bg-white/15 h-13 px-8 text-base">
                Explore Lookbook
              </Button>
            </div>
          </div>
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/50">
            <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent animate-pulse" />
          </div>
        </section>

        {/* ─── TRUST BADGES ─── */}
        <section className="border-b bg-background py-8">
          <div className="container px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🚚', title: 'Global Express', sub: 'Free on orders over $150' },
              { icon: '🔒', title: 'Secure Checkout', sub: '100% encrypted payment' },
              { icon: '↩️', title: 'Easy Returns', sub: '30-day effortless policy' },
              { icon: '🌱', title: 'Sustainable', sub: 'Eco-conscious packaging' },
            ].map((badge) => (
              <div key={badge.title} className="flex flex-col items-center gap-1.5 group cursor-default">
                <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{badge.icon}</span>
                <h4 className="font-semibold text-sm">{badge.title}</h4>
                <p className="text-xs text-muted-foreground">{badge.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── CATEGORIES ─── */}
        <section ref={categoriesRef} className="py-20 bg-background">
          <div className="container px-4 max-w-screen-xl mx-auto">
            <div className="scroll-anim text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2 block">Curated For You</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Shop By Category</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">Explore our thoughtfully curated collections designed for every aspect of your lifestyle.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/collections?category=${encodeURIComponent(cat.name)}`}
                  className="scroll-anim group relative aspect-[3/4] rounded-2xl overflow-hidden"
                >
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <h3 className="font-bold text-xl mb-1 group-hover:translate-x-1 transition-transform">{cat.name}</h3>
                    <p className="text-sm text-white/70 flex items-center">{cat.count} products <ArrowRight className="ml-1 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" /></p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BEST SELLERS ─── */}
        <section ref={bestsellersRef} className="py-20 bg-muted/30">
          <div className="container px-4 max-w-screen-xl mx-auto">
            <div className="scroll-anim flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-2 block">Most Popular</span>
                <h2 className="text-3xl md:text-4xl font-bold">Best Sellers</h2>
              </div>
              <Link to="/collections?sort=bestsellers" className="text-sm font-semibold flex items-center text-blue-600 hover:text-blue-700">
                View All Products <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="scroll-anim aspect-[4/5] rounded-lg bg-muted animate-pulse" />
                  ))
                : bestSellers.map((product) => (
                    <div key={product.id} className="scroll-anim">
                      <ProductCard product={product} />
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* ─── PROMO BANNER ─── */}
        <section ref={promoRef} className="py-20 bg-background">
          <div className="container px-4 max-w-screen-xl mx-auto">
            <div className="scroll-anim relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 flex flex-col lg:flex-row items-center">
              <div className="flex-1 p-10 md:p-16 text-white">
                <span className="inline-block bg-blue-600/20 text-blue-300 text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-blue-500/30 mb-6">Limited Edition</span>
                <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  The Aura Collection<br />
                  <span className="text-blue-400">Has Arrived</span>
                </h2>
                <p className="text-white/60 mb-8 max-w-md leading-relaxed">
                  Performance meets luxury. Our signature outerwear line engineered with recycled materials and cutting-edge design.
                </p>
                <Link to="/collections">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 h-12 px-8">
                    Shop Aura Collection <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="scroll-anim w-full lg:w-2/5 h-72 lg:h-auto lg:min-h-[420px] relative">
                <img
                  src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop"
                  alt="Aura Collection"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── NEWSLETTER ─── */}
        <section ref={newsletterRef} className="py-24 bg-muted/30">
          <div className="container px-4 max-w-screen-xl mx-auto">
            <div className="scroll-anim text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600 mb-3 block">Stay Connected</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Join the Nexa Community</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Subscribe to receive exclusive access to new arrivals, limited drops, and insider-only discounts.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input placeholder="Enter your email address" className="h-12 bg-background" />
                <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 shrink-0">
                  Subscribe <Send className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
