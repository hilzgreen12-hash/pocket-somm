import { showAlert } from '../components/AppAlert';
import { isNetworkError } from '../api/invokeResilient';
import { handleGuestLimit } from './guestLimit';
import { isWineNotFound } from './pricing';
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
