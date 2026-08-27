import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { showAlert } from '../components/AppAlert';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { uploadLabelImage } from '../api/labelPhotos';
import { patchChosenWine } from '../api/chosenWines';
import { updateCellarWine } from '../api/cellar';
import { useAuth } from './useAuth';

// The "add a photo" action sheet shared by the reviews list and the review
// input screens. A restaurant wine picked from a scanned list has no label
// shot, so we let the user attach one three ways — camera, library, or an
// online label search — and store it against the right row (chosen_wines for
// restaurant/other reviews, cellar_wines for cellar wines).
export type AttachKind = 'chosen' | 'cellar';

export function useAttachLabelPhoto() {
  const { session } = useAuth();
  const qc = useQueryClient();

  async function attachLocal(kind: AttachKind, wineId: string, uri: string) {
    const userId = session?.user.id;
    if (!userId) return;
    const path = await uploadLabelImage(userId, uri, wineId);
    if (kind === 'cellar') {
      // This is the user's OWN photo (camera/library), not a web-fetched label —
      // label_image_fetched must stay false so the wine still appears in the
      // "Select from Cellar" pool and on shareable/community cards.
      await updateCellarWine(wineId, { label_image_path: path, label_image_fetched: false } as any);
      qc.invalidateQueries({ queryKey: ['cellar'] });
    } else {
      await patchChosenWine(wineId, { label_image_path: path });
      qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
    }
    qc.invalidateQueries({ queryKey: ['label-image', path] });
  }

  async function pick(kind: AttachKind, wineId: string, source: 'camera' | 'library') {
    try {
      if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
      const res = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (res.canceled || !res.assets[0]) return;
      await attachLocal(kind, wineId, res.assets[0].uri);
    } catch (err) {
      showAlert({ title: 'Could not add that photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  function searchOnline(kind: AttachKind, wineId: string, producer: string | null, wineName: string | null) {
    router.push(
      `/label/find-label?kind=${kind}&wineId=${wineId}&producer=${encodeURIComponent(producer ?? '')}&wineName=${encodeURIComponent(wineName ?? '')}` as any,
    );
  }

  async function remove(kind: AttachKind, wineId: string) {
    const userId = session?.user.id;
    if (!userId) return;
    try {
      if (kind === 'cellar') {
        await updateCellarWine(wineId, { label_image_path: null, label_image_fetched: false } as any);
        qc.invalidateQueries({ queryKey: ['cellar'] });
      } else {
        await patchChosenWine(wineId, { label_image_path: null });
        qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
      }
    } catch (err) {
      showAlert({ title: 'Could not remove the image', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Presents the sheet for a saved wine (a row that already has an id).
  // `hasPhoto` adds a Delete option (and reframes the copy) when a label exists.
  function present(opts: { kind: AttachKind; wineId: string; producer: string | null; wineName: string | null; hasPhoto?: boolean }) {
    const { kind, wineId, producer, wineName, hasPhoto } = opts;
    showAlert({
      title: hasPhoto ? 'Label' : 'Add a Label',
      body: hasPhoto ? "Change or remove this wine's label image." : 'Give this wine a label image.',
      buttons: [
        // AppAlert fires onPress as it dismisses; iOS can't present the image
        // picker (or cleanly navigate) mid-dismiss, so defer past the animation.
        { text: 'Scan a Label', onPress: () => setTimeout(() => pick(kind, wineId, 'camera'), 350) },
        { text: 'Upload Image', onPress: () => setTimeout(() => pick(kind, wineId, 'library'), 350) },
        { text: 'Find Image Online', onPress: () => setTimeout(() => searchOnline(kind, wineId, producer, wineName), 350) },
        ...(hasPhoto ? [{ text: 'Delete Image', style: 'destructive' as const, onPress: () => setTimeout(() => void remove(kind, wineId), 200) }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  return { present };
}
