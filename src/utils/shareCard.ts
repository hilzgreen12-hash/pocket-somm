import { Platform, Share } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// One place that shares a captured/generated Vinster "result" (image or PDF) so
// EVERY outbound share is consistent:
//  - a MEANINGFUL filename ("<name> has shared a Vinster result with you.<ext>")
//  - iOS: the branded file PLUS a tappable message with the App Store link, so
//    a recipient can actually install Vinster from the message.
//  - Android: the branded file (there's no public Android build to link to yet;
//    an iOS App Store link wouldn't help an Android recipient install).

const APP_STORE_URL = 'https://apps.apple.com/app/id6763607127';

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

  // iOS: native share sheet carries the file (url) AND the tappable-link message.
  if (Platform.OS === 'ios') {
    await Share.share({ url: uri, message });
    return;
  }
  // Android: RN Share ignores `url`; use expo-sharing so the branded file still
  // goes out (named meaningfully). The App Store link is added here once there's
  // a public Android build to point at.
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: mime,
      dialogTitle: opts.dialogTitle ?? 'Share a Vinster result',
      UTI: mime === 'application/pdf' ? 'com.adobe.pdf' : 'public.png',
    });
  }
}
