import { useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../components/AppAlert';
import { useAuth } from './useAuth';
import { useScanHistory } from './useScanHistory';
import { useChosenWines, useWineReviewCards } from './useChosenWines';
import { hasRestaurantReview, isRestaurantVisit, sessionsWithWines } from '../utils/restaurantReview';

// Shown at most once per app open, so moving between tabs doesn't repeat it.
let shownThisOpen = false;

// On arriving at the Review tab: if wines or restaurants are awaiting review
// (they have no carousel tile yet), point the user to the View All lists —
// until they choose "don't show me this again".
export function useAwaitingReviewPrompt() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { awaiting, isLoading: winesLoading } = useWineReviewCards();
  const { archive, archiveLoading } = useScanHistory();
  const { chosenWines } = useChosenWines();
  const loading = winesLoading || archiveLoading;
  const withWines = sessionsWithWines(chosenWines);
  const winesWaiting = awaiting.length > 0;
  const restaurantsWaiting = archive.some((a) => isRestaurantVisit(a, withWines) && !hasRestaurantReview(a));

  useFocusEffect(useCallback(() => {
    if (shownThisOpen || loading || !(winesWaiting || restaurantsWaiting) || !userId) return;
    shownThisOpen = true;
    const key = `vinster-awaiting-review-prompt-off:${userId}`;
    AsyncStorage.getItem(key).then((off) => {
      if (off) return;
      // Name only what's waiting, and offer only the list(s) that have it.
      const what = winesWaiting && restaurantsWaiting ? 'Wines & Restaurants' : winesWaiting ? 'Wines' : 'Restaurants';
      showAlert({
        title: `You Have ${what} Awaiting Review - View All For Details`,
        showCloseX: true,
        buttons: [
          ...(winesWaiting ? [{ text: 'View All Wine Reviews', style: 'gold' as const, onPress: () => router.push('/wines/chosen') }] : []),
          ...(restaurantsWaiting ? [{ text: 'View All Restaurant Reviews', style: 'gold' as const, onPress: () => router.push('/restaurants/reviews') }] : []),
          { text: "don't show me this again", style: 'link', onPress: () => { AsyncStorage.setItem(key, '1').catch(() => {}); } },
        ],
      });
    }).catch(() => {});
  }, [loading, winesWaiting, restaurantsWaiting, userId]));
}
