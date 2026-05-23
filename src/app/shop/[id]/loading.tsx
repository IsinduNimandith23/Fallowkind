export default function ProductLoading() {
  return (
    <div className="section-padding page-container">
      <div className="h-3 w-48 bg-forest/10 rounded mb-10 animate-pulse" />
      <div className="grid lg:grid-cols-[3fr_2fr] gap-10 xl:gap-20">
        <div>
          <div className="aspect-[3/4] w-full mb-3 rounded-3xl bg-cream/40 animate-pulse" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 bg-forest/10 rounded animate-pulse" />
          <div className="h-6 w-32 bg-forest/10 rounded animate-pulse" />
          <div className="h-px bg-forest/10 my-4" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-forest/10 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-forest/10 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-forest/10 rounded animate-pulse" />
          </div>
          <div className="h-12 mt-8 rounded-full bg-forest/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
