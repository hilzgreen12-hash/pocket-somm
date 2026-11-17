import * as ImagePicker from 'expo-image-picker';
import { showAlert } from '../components/AppAlert';

// The camera and photo library, opened through one place so a known Android
// failure is explained the same way everywhere.
//
// A share from another app (a PDF from Adobe Acrobat, say) can open Vinster
// inside that app's window; expo-share-intent then restarts Vinster's screen in
// its own window and closes the old one. Closing it unregisters the pickers, and
// Expo only re-registers them the next time Vinster returns from the
// background — until then every picker is rejected with "Attempting to launch
// an unregistered ActivityResultLauncher". Leaving Vinster and coming back
// fixes it, so say that instead of showing the raw Android error.

type LibraryOptions = Parameters<typeof ImagePicker.launchImageLibraryAsync>[0];
type CameraOptions = Parameters<typeof ImagePicker.launchCameraAsync>[0];

const CANCELLED: ImagePicker.ImagePickerResult = { canceled: true, assets: null };

function isLostPickerLink(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  return /unregistered ActivityResultLauncher/i.test(msg);
}

async function launchOrExplain(launch: () => Promise<ImagePicker.ImagePickerResult>): Promise<ImagePicker.ImagePickerResult> {
  try {
    return await launch();
  } catch (err) {
    if (!isLostPickerLink(err)) throw err;
    showAlert({
      title: "Vinster can't open your photos just now",
      body: 'Switch to another app and back to Vinster (or close Vinster and reopen it), then try again.',
    });
    return CANCELLED;
  }
}

export function launchImageLibrary(options?: LibraryOptions): Promise<ImagePicker.ImagePickerResult> {
  return launchOrExplain(() => ImagePicker.launchImageLibraryAsync(options));
}

export function launchCamera(options?: CameraOptions): Promise<ImagePicker.ImagePickerResult> {
  return launchOrExplain(() => ImagePicker.launchCameraAsync(options));
}
