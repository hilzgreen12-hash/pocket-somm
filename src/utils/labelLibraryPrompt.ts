import { showAlert } from '../components/AppAlert';

// Shared "Add label to Label Library?" Yes/No prompt. Used from both capture
// points — the Scan Wine Label intel result and Your Wine Reviews · Scan /
// Upload — so the wording stays identical. onNo is optional; the flow should
// always continue whichever way the user answers.
export function promptAddToLabelLibrary(onYes: () => void, onNo?: () => void) {
  showAlert({
    title: 'Add label to Label Library in Your Stuff?',
    body: 'Keep this label in Your Label Library — date and location stamped.',
    buttons: [
      { text: 'No', style: 'cancel', onPress: onNo },
      { text: 'Yes', onPress: onYes },
    ],
  });
}
