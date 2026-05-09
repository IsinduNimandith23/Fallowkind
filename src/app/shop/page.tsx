import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop" };

const categories = ["All", "Tops", "Bags", "Headwear", "Outerwear"];

const products = [
  { id: 1,  name: "Field Tee",          category: "Tops",      price: "$48",  tag: "New"         },
  { id: 2,  name: "Canvas Tote",         category: "Bags",      price: "$36"                      },
  { id: 3,  name: "Harvest Beanie",      category: "Headwear",  price: "$32",  tag: "Bestseller"  },
  { id: 4,  name: "Linen Overshirt",     category: "Outerwear", price: "$95",  tag: "New"         },
  { id: 5,  name: "Earthwork Tee",       category: "Tops",      price: "$44"                      },
  { id: 6,  name: "Market Bag",          category: "Bags",      price: "$42"                      },
  { id: 7,  name: "Fallow Cap",          category: "Headwear",  price: "$38"                      },
  { id: 8,  name: "Moss Crew Sweater",   category: "Outerwear", price: "$120"                     },
];

export default function ShopPage() {
  return (
    <div className="section-padding page-container">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl mb-4">The Collection</h1>
        <p className="text-forest/60 max-w-lg">
          Pieces made for the land and the long run — natural fibres, considered cuts.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`text-xs tracking-widest uppercase px-4 py-2 border transition-colors ${
              cat === "All"
                ? "bg-forest text-linen border-forest"
                : "border-forest/30 text-forest/60 hover:border-forest hover:text-forest"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => (
          <div key={p.id} className="group cursor-pointer">
            <div className="relative bg-cream aspect-[3/4] mb-3 overflow-hidden">
              <div className="w-full h-full bg-fern/20 group-hover:scale-105 transition-transform duration-500" />
              {p.tag && (
                <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase bg-forest text-linen px-2 py-1">
                  {p.tag}
                </span>
              )}
            </div>
            <p className="text-xs tracking-widest uppercase text-moss mb-1">{p.category}</p>
            <div className="flex justify-between items-baseline">
              <p className="text-sm font-medium text-forest">{p.name}</p>
              <p className="text-sm text-sage">{p.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
