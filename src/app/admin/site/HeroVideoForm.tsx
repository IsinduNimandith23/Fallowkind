import Link from "next/link";

// The hero video is intentionally served as a static file from /public (mp5.mp4)
// rather than Supabase Storage. A looping autoplay video streamed from Storage on
// every homepage visit blew through the Supabase Free Plan cached-egress quota
// (one 13 MB file x every visit). Vercel serves /public assets from its Fast Data
// Transfer bucket (100 GB) for free, so the video lives in the repo now.
//
// To change the hero video: replace public/mp5.mp4 (keep it small - compress to a
// few MB, drop the audio track) and redeploy. No admin upload, by design.
export default function HeroVideoForm({ currentUrl }: { currentUrl: string }) {
  const preview = currentUrl || "/mp5.mp4";

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current hero</p>
        </div>
        <div className="aspect-video bg-forest relative">
          <video
            key={preview}
            src={preview}
            autoPlay muted loop playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="px-5 py-3 text-xs text-gray-500 break-all">
          <span className="font-medium text-gray-700">File: </span>{preview}
        </div>
      </div>

      {/* Explanation - uploads are disabled on purpose */}
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-5 text-sm text-amber-900 space-y-2">
        <p className="font-semibold">The hero video is a static file, not an upload.</p>
        <p className="text-amber-800">
          It&rsquo;s served from <code className="bg-amber-100 px-1 rounded">public/mp5.mp4</code> in
          the codebase so it doesn&rsquo;t consume Supabase storage egress. To change it, replace that
          file with a small, compressed video (a few MB, no audio) and redeploy.
        </p>
        <p className="text-amber-800">
          Need help swapping it?{" "}
          <Link href="https://vercel.com/docs/storage" className="underline font-medium" target="_blank">
            Vercel static asset docs
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
