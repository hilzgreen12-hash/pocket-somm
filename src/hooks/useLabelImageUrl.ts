import { useEffect, useState } from 'react';
import { labelSignedUrl } from '../api/labelPhotos';

// Resolves a stored label path to a short-lived signed URL. Async (unlike
// the old public-URL lookup), so callers should treat `null` while a real
// path is still resolving as "loading", not "no photo" — see LabelThumb /
// LabelPhotoViewer. Re-fetches whenever the path changes.
export function useLabelImageUrl(path: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    if (!path) { setUrl(null); return; }
    setUrl(null);
    labelSignedUrl(path)
      .then((u) => { if (alive) setUrl(u); })
      .catch(() => { if (alive) setUrl(null); });
    return () => { alive = false; };
  }, [path]);
  return url;
}
