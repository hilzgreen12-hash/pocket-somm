import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../components/AppAlert';

// The "Added to your cellar" confirmation popup, shared across the add flows,
// with a persisted "Don't show me this again" opt-out. Once the user opts out
// the popup is skipped entirely — the wine is already saved and they're on the
// destination screen (the rack or the Full Cellar List), so nothing is lost.
const KEY = 'vinster-hide-add-cellar-confirm';

export async function showAddedToCellar(body: string, onViewList?: () => void): Promise<void> {
  try {
    if ((await AsyncStorage.getItem(KEY)) === '1') return;
  } catch { /* ignore — show the popup if the flag can't be read */ }
  const buttons: { text: string; style?: 'cancel'; onPress?: () => void }[] = [];
  if (onViewList) buttons.push({ text: 'View in Full Cellar List', onPress: onViewList });
  buttons.push({ text: "Don't show me this again", onPress: () => { AsyncStorage.setItem(KEY, '1').catch(() => {}); } });
  buttons.push({ text: 'Done', style: 'cancel' });
  showAlert({ title: 'Added to your cellar', body, buttons });
}
