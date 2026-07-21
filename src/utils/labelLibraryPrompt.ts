import { showAlert } from '../components/AppAlert';

// "Add label to your Scan Archive?" Yes/No prompt, shown after a Scan Wine
// Label result — the ONLY remaining flow that saves a label. (Review scans and
// cellar wines no longer feed the archive; that duplication was removed.) onNo
// is optional; the flow should always continue whichever way the user answers.
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
