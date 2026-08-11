import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { showAlert } from '../components/AppAlert';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { uploadRestaurantPhoto } from '../api/labelPhotos';
import { setRestaurantPhotoPath } from '../api/restaurantSessions';
import { useAuth } from './useAuth';

// The "add a photo of the night" action sheet for a restaurant review. Mirrors
// useAttachLabelPhoto, but the photo is attached to the scan_sessions row
// (restaurant_photo_path) rather than a wine. Three ways in — camera, library,
// or an online search for a photo of the restaurant itself.
export function useAttachRestaurantPhoto() {
  const { session } = useAuth();
  const qc = useQueryClient();

  async function refresh() {
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
      qc.invalidateQueries({ queryKey: ['label-image', path] });
      await refresh();
    } catch (err) {
      showAlert({ title: 'Could not add that photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  function searchOnline(sessionId: string, restaurant: string | null, city: string | null) {
    router.push(
      `/restaurants/find-photo?sessionId=${sessionId}&restaurant=${encodeURIComponent(restaurant ?? '')}&city=${encodeURIComponent(city ?? '')}` as any,
    );
  }

  async function remove(sessionId: string) {
    try {
      await setRestaurantPhotoPath(sessionId, null);
      await refresh();
    } catch (err) {
      showAlert({ title: 'Could not remove that photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Presents the sheet for a restaurant visit. `hasPhoto` adds a Remove option.
  function present(opts: { sessionId: string; restaurant: string | null; city: string | null; hasPhoto?: boolean }) {
    const { sessionId, restaurant, city, hasPhoto } = opts;
    showAlert({
      title: hasPhoto ? 'Change photo' : 'Add a photo of the night',
      body: hasPhoto ? 'Replace or remove this restaurant photo.' : 'Add a photo of your evening, or find one of the restaurant online.',
      buttons: [
        // AppAlert fires onPress as it dismisses; iOS can't present the image
        // picker (or cleanly navigate) mid-dismiss, so defer past the animation.
        { text: 'Take a Photo', onPress: () => setTimeout(() => pick(sessionId, 'camera'), 350) },
        { text: 'Upload a Photo', onPress: () => setTimeout(() => pick(sessionId, 'library'), 350) },
        { text: 'Find Online', onPress: () => setTimeout(() => searchOnline(sessionId, restaurant, city), 350) },
        ...(hasPhoto ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: () => remove(sessionId) }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  return { present };
}
