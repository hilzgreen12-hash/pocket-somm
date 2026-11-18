import { showAlert } from '../components/AppAlert';
import { isNetworkError } from '../api/invokeResilient';
import { prepareImageBase64, scanLabel } from '../api/label';
import { handleGuestLimit } from './guestLimit';
import { isWineNotFound } from './pricing';
import { launchImageLibrary } from '../utils/imagePicker';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { ensureConnectionForUpload } from '../utils/connectionGuard';
import { useLabelStore } from '../stores/labelStore';
import { useScanStore } from '../stores/scanStore';
import type { WineDetails } from '../types/wine';

// What a label read turned out to be, and the one place the label-scan screens
// get their messages from — so a server or connection problem is never blamed
// on the user's photo, and a photo that isn't a label is never treated as one.

type LabelReadKind = 'label' | 'list' | 'not-wine' | 'unreadable';

export function classifyLabelRead(d: WineDetails): LabelReadKind {
  if (d.imageType === 'list') return 'list';
  if (d.imageType === 'other') return 'not-wine';
  if (!(d.producer ?? '').trim() && !(d.wineName ?? '').trim()) return 'unreadable';
  return 'label';
}

type Extra = { text: string; onPress: () => void };

function ask(title: string, body: string, extra?: Extra) {
  showAlert({ title, body, buttons: extra ? [{ text: 'Try Again' }, extra] : [{ text: 'Try Again' }] });
}

// The photo isn't a wine label, or nothing on it could be read.
export function alertBadLabelPhoto(kind: 'not-wine' | 'unreadable', extra?: Extra) {
  if (kind === 'not-wine') {
    ask("That doesn't look like a wine label", 'Please photograph the front label of the bottle.', extra);
  } else {
    ask("Couldn't read that label", 'Please try another photo, with the label filling the frame and in focus.', extra);
  }
}

// A read or card that failed: say what actually went wrong.
export function alertLabelFailure(err: unknown, extra?: Extra) {
  if (handleGuestLimit(err)) return;
  const msg = err instanceof Error ? err.message : '';
  if (isWineNotFound(err)) {
    ask("Vinster couldn't find this wine", 'The label may have been misread. Please try another photo, or search for the wine.', extra);
  } else if (/a lot of requests/i.test(msg)) {
    ask('Please try again shortly', msg, extra);
  } else if (isNetworkError(err)) {
    ask('Connection problem', "Vinster couldn't reach its server. Please check your signal and try again.", extra);
  } else {
    ask('Something went wrong', 'Vinster had a problem reading the label. Please try again in a moment.', extra);
  }
}

// "This looks like a wine list" — resolves true to read it as a list, false to
// carry on with it as a label.
export function askReadAsList(): Promise<boolean> {
  return new Promise((resolve) => {
    showAlert({
      title: 'This looks like a wine list',
      body: "Read it as a wine list for Vinster's top three picks?",
      dismissable: false,
      buttons: [
        { text: 'Read Wine List', onPress: () => resolve(true) },
        { text: "No, it's a label", style: 'cancel', onPress: () => resolve(false) },
      ],
    });
  });
}

// "Upload Label": pick a photo from the library and read it the same way the
// label camera does. Starts from a clean label store, so a failed read can never
// carry the previous wine onto the Confirm screen. Resolves:
//   'label' — a usable label; its details are in the label store, go to Confirm
//   'list'  — the user chose to read a wine list; the scan store holds it
//   null    — cancelled, or the photo couldn't be used (the user has been told)
// `enterManually` is offered alongside "Try Again" when the read fails.
export async function readLabelFromLibrary(opts: { setReading: (reading: boolean) => void; enterManually: Extra }): Promise<'label' | 'list' | null> {
  if (!(await ensureMediaPermission('library'))) return null;
  const result = await launchImageLibrary({ mediaTypes: ['images'], quality: 1 });
  if (result.canceled || !result.assets[0]) return null;
  const uri = result.assets[0].uri;
  if (!(await ensureConnectionForUpload())) return null;
  const label = useLabelStore.getState();
  label.reset();
  opts.setReading(true);
  try {
    const base64 = await prepareImageBase64(uri);
    label.setImage(uri, base64);
    const details = await scanLabel(base64);
    const kind = classifyLabelRead(details);
    if (kind === 'list') {
      opts.setReading(false);
      if (await askReadAsList()) {
        useScanStore.getState().setImage(uri, 'upload');
        return 'list';
      }
    } else if (kind === 'not-wine' || kind === 'unreadable') {
      alertBadLabelPhoto(kind, opts.enterManually);
      return null;
    }
    label.setWineDetails(details);
    return 'label';
  } catch (err) {
    alertLabelFailure(err, opts.enterManually);
    return null;
  } finally {
    opts.setReading(false);
  }
}
