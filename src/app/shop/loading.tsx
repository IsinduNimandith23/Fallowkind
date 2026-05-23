export default function ShopLoading() {
  return (
    <>
      <section className="relative -mt-20 h-[460px] md:h-[560px] bg-linen/40 animate-pulse" />
      <div className="page-container px-6 md:px-12 lg:px-24 py-10 md:py-14">
        <div className="h-10 border-b border-forest/10 mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[4/5] mb-4 rounded-3xl bg-cream/40 animate-pulse" />
              <div className="px-3 flex items-baseline justify-between gap-3">
                <div className="h-3 w-24 bg-forest/10 rounded animate-pulse" />
                <div className="h-3 w-14 bg-forest/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
