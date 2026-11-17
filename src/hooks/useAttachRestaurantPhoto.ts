import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { showAlert } from '../components/AppAlert';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { uploadRestaurantPhoto } from '../api/labelPhotos';
import { setRestaurantPhotoPath } from '../api/restaurantSessions';
import { useAuth } from './useAuth';

// How long to wait for an alert or full-screen Modal to finish animating out
// before presenting the image picker or navigating. Started mid-dismiss, iOS
// drops the picker and a router.push lands behind the closing Modal.
export const DISMISS_DELAY_MS = 350;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The "add a photo of the night" action sheet for a restaurant visit: camera,
// library, or an online search for a photo of the restaurant. The photo is
// stored on the scan_sessions row (restaurant_photo_path), not on a wine.
export function useAttachRestaurantPhoto() {
  const { session } = useAuth();
  const qc = useQueryClient();

  function refresh() {
    qc.invalidateQueries({ queryKey: ['scan-archive'] });
  }

  async function pick(sessionId: string, source: 'camera' | 'library') {
    const userId = session?.user.id;
    if (!userId) return;
    try {
      if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
      const res = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (res.canceled || !res.assets[0]) return;
      const path = await uploadRestaurantPhoto(userId, res.assets[0].uri, sessionId);
      await setRestaurantPhotoPath(sessionId, path);
      refresh();
    } catch (err) {
      showAlert({ title: 'Could not add that photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Find Online is a separate screen. A screen pushed while the review Modal is
  // open renders underneath it, so a caller showing the Modal passes
  // `leaveModal`, which saves the draft and closes the Modal (the caller
  // reopens it when the screen regains focus).
  async function searchOnline(sessionId: string, restaurant: string | null, city: string | null, leaveModal?: () => Promise<void>) {
    try {
      if (leaveModal) {
        await leaveModal();
        await wait(DISMISS_DELAY_MS);
      }
      router.push(
        `/restaurants/find-photo?sessionId=${sessionId}&restaurant=${encodeURIComponent(restaurant ?? '')}&city=${encodeURIComponent(city ?? '')}` as any,
      );
    } catch (err) {
      showAlert({ title: 'Could not search for a photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function remove(sessionId: string) {
    try {
      await setRestaurantPhotoPath(sessionId, null);
      refresh();
    } catch (err) {
      showAlert({ title: 'Could not remove that photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Presents the sheet for a visit. `hasPhoto` adds a Remove option.
  function present(opts: { sessionId: string; restaurant: string | null; city: string | null; hasPhoto?: boolean; leaveModal?: () => Promise<void> }) {
    const { sessionId, restaurant, city, hasPhoto, leaveModal } = opts;
    showAlert({
      title: hasPhoto ? 'Change photo' : 'Add a photo of the night',
      body: hasPhoto ? 'Replace or remove this restaurant photo.' : 'Add a photo of your evening, or find one of the restaurant online.',
      buttons: [
        // AppAlert fires onPress as it dismisses — defer past its animation.
        { text: 'Take a Photo', onPress: () => setTimeout(() => pick(sessionId, 'camera'), DISMISS_DELAY_MS) },
        { text: 'Upload a Photo', onPress: () => setTimeout(() => pick(sessionId, 'library'), DISMISS_DELAY_MS) },
        { text: 'Find Online', onPress: () => setTimeout(() => searchOnline(sessionId, restaurant, city, leaveModal), DISMISS_DELAY_MS) },
        ...(hasPhoto ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: () => remove(sessionId) }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  return { present };
}
