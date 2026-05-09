import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Home" };

const featured = [
  { id: 1, name: "Field Tee",      category: "Tops",    price: "$48" },
  { id: 2, name: "Canvas Tote",    category: "Bags",    price: "$36" },
  { id: 3, name: "Harvest Beanie", category: "Headwear",price: "$32" },
  { id: 4, name: "Linen Overshirt",category: "Tops",    price: "$95" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[calc(100svh-4rem)] overflow-hidden bg-forest flex items-end">
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/mp4.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/18" />
        </div>
        {/* <div className="relative section-padding page-container w-full pb-20">
          <p className="text-xs tracking-[0.3em] uppercase text-fern mb-4">
            The Fallowkind Issue — Regenerative Living
          </p>
          <h1 className="text-linen text-5xl md:text-7xl leading-tight max-w-2xl mb-8">
            The Future<br />is Conscious.
          </h1>
          <Link href="/shop" className="btn-primary inline-block">
            Shop the Collection
          </Link>
        </div> */}
      </section>

      {/* Featured products */}
      <section className="section-padding page-container">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-3xl md:text-4xl text-forest">New Arrivals</h2>
          <Link href="/shop" className="text-xs tracking-widest uppercase text-sage hover:text-forest transition-colors">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map((item) => (
            <ProductCard key={item.id} {...item} />
          ))}
        </div>
      </section>

      {/* Brand strip */}
      <section className="bg-sage section-padding">
        <div className="page-container text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-linen/60 mb-4">Our commitment</p>
          <h2 className="text-linen text-3xl md:text-5xl max-w-2xl mx-auto leading-snug">
            Binatural materials, made to last.
          </h2>
        </div>
      </section>

      {/* Our story teaser */}
      <section className="section-padding page-container grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-moss mb-4">Who we are</p>
          <h2 className="text-3xl md:text-4xl mb-6">Rooted in the land.</h2>
          <p className="text-forest/70 leading-relaxed mb-8 max-w-md">
            Fallowkind was born from a belief that clothing can be a gentle act — a choice that honours
            the soil, the seasons, and the people who work with their hands.
          </p>
          <Link href="/our-story" className="btn-outline inline-block">
            Our Story
          </Link>
        </div>
        <div className="bg-cream aspect-square rounded-sm" />
      </section>
    </>
  );
}

function ProductCard({ name, category, price }: { name: string; category: string; price: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="bg-cream aspect-[3/4] mb-3 overflow-hidden">
        <div className="w-full h-full bg-fern/20 group-hover:scale-105 transition-transform duration-500" />
      </div>
      <p className="text-xs tracking-widest uppercase text-moss mb-1">{category}</p>
      <div className="flex justify-between items-baseline">
        <p className="text-sm font-medium text-forest">{name}</p>
        <p className="text-sm text-sage">{price}</p>
      </div>
    </div>
  );
}
