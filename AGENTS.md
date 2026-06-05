<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Favicon Rules
- **DO NOT TOUCH** the `AnimatedFavicon.tsx` logic unless explicitly instructed.
- The animated favicon uses `canvas.toBlob()` and `URL.createObjectURL()` to generate `blob:` URLs for the `href` attribute.
- **NEVER** switch back to `data:` (Base64) URLs for the animated favicon. Chrome's bookmark sync engine attempts to synchronize `data:` URLs to the bookmark database 60 times a second, which causes extreme flickering/noise (parazit) in the bookmarks bar. `blob:` URLs bypass this issue because they are ephemeral and ignored by the sync engine, keeping the bookmark bar stable while the tab animation runs perfectly.
- Keep the static `<link rel="icon" href="/favicon.ico">` in the DOM and do not remove it, as it acts as a fallback.
