import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import RNShare from 'react-native-share';
import { VINSTER_APP_STORE_URL, VINSTER_TAGLINE } from '../constants/share';

// One place that shares a captured/generated Vinster "result" (image or PDF) so
// EVERY outbound share is consistent:
//  - a MEANINGFUL filename ("<name> has shared a Vinster result with you.<ext>")
//  - the branded file PLUS a genuinely tappable App Store link.
//
// iOS's UIActivityViewController (which RN's built-in Share uses) cannot reliably
// send an image AND a URL together — Messages drops the text when a file is
// attached, so the App Store link vanished. We use react-native-share's iOS
// `activityItemSources` to hand Messages the file AND the App Store URL as
// SEPARATE items, so the link comes through as a tappable App Store card beside
// the image. On Android the same call sends file + message text (which carries
// the link) natively.

const APP_STORE_URL = VINSTER_APP_STORE_URL;

// Resolve the sharer's display name (display_name -> email prefix -> "Someone").
export function sharerNameFrom(
  session: { user?: { user_metadata?: { display_name?: string } | null; email?: string | null } } | null | undefined,
): string {
  const meta = session?.user?.user_metadata?.display_name?.trim();
  if (meta) return meta;
  const email = session?.user?.email ?? '';
  return email.split('@')[0]?.trim() || 'Someone';
}

// The message that rides along with the share — the tappable "Get Vinster" CTA.
export function vinsterShareMessage(sharerName: string | null | undefined): string {
  const name = (sharerName ?? '').trim() || 'Someone';
  return `${name} has shared a Vinster result with you. Get Vinster: ${APP_STORE_URL}`;
}

function sharedFilename(sharerName: string | null | undefined, ext: string): string {
  const name = (sharerName ?? '').trim() || 'Someone';
  const base = `${name} has shared a Vinster result with you`;
  // Strip only filesystem-illegal characters; keep spaces so the name stays readable.
  const safe = base.replace(/[/\\?%*:|"<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);
  return `${safe}.${ext}`;
}

// Copy the source file to a meaningfully-named file in the cache dir; returns the
// new uri, or the original on any failure (rename must never block a share).
function renameForShare(fromUri: string, sharerName: string | null | undefined, ext: string): string {
  try {
    const dest = new File(Paths.cache, sharedFilename(sharerName, ext));
    try { if (dest.exists) dest.delete(); } catch { /* ignore */ }
    new File(fromUri).copy(dest);
    return dest.uri;
  } catch {
    return fromUri;
  }
}

// Share a captured (captureRef PNG) or generated (expo-print PDF) Vinster result.
export async function shareResult(
  fromUri: string,
  opts: { sharerName?: string | null; mimeType?: string; dialogTitle?: string } = {},
): Promise<void> {
  const mime = opts.mimeType ?? 'image/png';
  const ext = mime === 'application/pdf' ? 'pdf' : 'png';
  const uri = renameForShare(fromUri, opts.sharerName, ext);
  const message = vinsterShareMessage(opts.sharerName);
  const name = (opts.sharerName ?? '').trim() || 'Someone';
  const sentence = `${name} has shared a Vinster result with you.`;

  try {
    await RNShare.open({
      // Android + iOS fallback: file plus a caption that carries the link.
      url: uri,
      message,
      type: mime,
      // Don't reject when the user just backs out of the share sheet.
      failOnCancel: false,
      // iOS only: hand the sheet the file AND the App Store URL as separate
      // items so Messages keeps both — the URL becomes a tappable App Store card.
      activityItemSources: Platform.OS === 'ios' ? [
        {
          placeholderItem: { type: 'text', content: sentence },
          item: { default: { type: 'text', content: sentence } },
        },
        {
          placeholderItem: { type: 'url', content: uri },
          item: { default: { type: 'url', content: uri } },
        },
        {
          placeholderItem: { type: 'url', content: APP_STORE_URL },
          item: {
            default: { type: 'url', content: APP_STORE_URL },
            message: { type: 'url', content: APP_STORE_URL },
          },
          subject: { default: 'Get Vinster' },
          linkMetadata: { originalUrl: APP_STORE_URL, url: APP_STORE_URL, title: `Vinster — ${VINSTER_TAGLINE}` },
        },
      ] : undefined,
    });
  } catch (err) {
    // Swallow the user-cancelled case; surface anything genuinely wrong.
    const msg = err instanceof Error ? err.message.toLowerCase() : '';
    if (msg.includes('cancel') || msg.includes('dismiss') || msg.includes('user did not share')) return;
    throw err;
  }
}
