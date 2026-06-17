// The hero video is intentionally served as a static file from /public (hero.mp4)
// rather than Supabase Storage. A looping autoplay video streamed from Storage on
// every homepage visit blew through the Supabase Free Plan cached-egress quota
// (one 13 MB file x every visit). Vercel serves /public assets from its Fast Data
// Transfer bucket (100 GB) for free, so the video lives in the repo now.
//
// To change the hero video: replace public/hero.mp4 (keep it small - compress to a
// few MB, drop the audio track) and redeploy. No admin upload, by design.
export default function HeroVideoForm({ currentUrl }: { currentUrl: string }) {
  const preview = currentUrl || "/hero.mp4";

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

      {/* How to change the hero video */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          How to change the hero video
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 marker:text-gray-400 marker:font-semibold">
          <li>Prepare a short video clip, ideally a few MB and without audio.</li>
          <li>
            In the project code, open the <code className="bg-gray-100 px-1 rounded text-gray-700">public</code>{" "}
            folder and replace the file{" "}
            <code className="bg-gray-100 px-1 rounded text-gray-700">hero.mp4</code> with your new clip
            (keep the same name).
          </li>
          <li>Commit the change and push it to deploy.</li>
          <li>The homepage hero updates automatically once the deploy finishes.</li>
        </ol>
        <p className="text-xs text-gray-400 mt-4">
          The hero is served straight from the site&rsquo;s code for speed, so it&rsquo;s updated by
          swapping the file rather than uploading here.
        </p>
      </div>
    </div>
  );
}
