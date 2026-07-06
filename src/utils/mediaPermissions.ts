import { Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { showAlert } from '../components/AppAlert';

type MediaKind = 'library' | 'camera';

// Make sure we hold the OS permission before opening the image picker. When a
// user has permanently denied access the native picker just fails with no
// explanation ("can't access gallery / photos"), so we surface a clear message
// with a shortcut to the app's Settings page. Returns true when it's safe to
// proceed and false when the caller should abort.
//
// iOS note: launchImageLibraryAsync uses PHPicker, which needs NO permission,
// so we never gate the library path on iOS — doing so would block a picker
// that works fine. Camera access, and photo access on Android, do need a grant.
export async function ensureMediaPermission(kind: MediaKind): Promise<boolean> {
  if (kind === 'library' && Platform.OS === 'ios') return true;

  const current = kind === 'camera'
    ? await ImagePicker.getCameraPermissionsAsync()
    : await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;

  if (current.canAskAgain) {
    const asked = kind === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (asked.granted) return true;
    // Declined the in-the-moment prompt but can still be asked again — respect
    // that choice without pushing them all the way to Settings.
    if (asked.canAskAgain) return false;
  }

  // Permanently denied — the only way back is the OS Settings app.
  showAlert({
    title: kind === 'camera' ? 'Camera access needed' : 'Photo access needed',
    body: kind === 'camera'
      ? 'Vinster needs camera access to take this photo. Turn it on for Vinster in Settings, then try again.'
      : 'Vinster needs access to your photos to upload here. Turn it on for Vinster in Settings, then try again.',
    buttons: [
      { text: 'Open Settings', onPress: () => { Linking.openSettings(); } },
      { text: 'Not now', style: 'cancel' },
    ],
  });
  return false;
}
