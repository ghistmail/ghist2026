import { useEffect, useRef } from "react";

/**
 * HilltopAds 320x250 banner (zone #7292013).
 * Reserves layout space up front to avoid CLS; script is appended
 * exactly once per mount via a fresh <script> tag inside the container.
 */
export function BannerAd320x250() {
  const containerRef = useRef<HTMLDivElement>(null);
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current || !containerRef.current) return;
    injected.current = true;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.text = `(function(uddxdr){
var d = document,
    s = d.createElement('script'),
    l = d.scripts[d.scripts.length - 1];
s.settings = uddxdr || {};
s.src = "//relieved-understanding.com/b/XlV.sXdcGBlV0IYYWIcI/keVm/9/uOZ_UGlxk_POTlczyrOsTfIYw/MPTwMRtJNUz/IG5cMAjVADxQNTwv";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})`;
    containerRef.current.appendChild(script);
  }, []);

  return (
    <div className="flex justify-center w-full">
      <div
        ref={containerRef}
        className="min-h-[250px] min-w-[320px] w-[320px] flex items-center justify-center overflow-hidden"
        aria-label="Advertisement"
      />
    </div>
  );
}
