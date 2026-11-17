import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCellar, useArchive } from '../../src/hooks/useCellar';
import { useCellarContext } from '../../src/hooks/useCellarContext';
import { SearchProgress } from '../../src/components/SearchProgress';
import { CellarWineCard } from '../../src/components/winecard/cellar/CellarWineCard';
import { GrapeConfirmModal } from '../../src/components/winecard/cellar/GrapeConfirmModal';
import { useWineIntel, wineCardKey } from '../../src/components/winecard/cellar/useWineIntel';
import { s } from '../../src/components/winecard/cellar/styles';
import { colors } from '../../src/constants/theme';

// The cellar wine card (live and archived wines alike). This screen is only the
// gate: it finds the wine and shows loading, "not found", the brief "removed"
// message after a delete, or the "generating Wine Intel" tracker — and mounts
// the card itself only once the wine is ready. The card's many hooks therefore
// never sit below an early return here (that changed the hook count and crashed
// the card on the tracker ↔ card switch and after a delete).
export default function WineCardScreen() {
  const params = useLocalSearchParams<{
    wineId: string;
    // 'reviews' = opened from Your Wine Reviews (offers Share Review To Community).
    from?: string;
    // The rack slot tapped to open the card; that bottle leaves first.
    fromRackId?: string;
    fromRow?: string;
    fromCol?: string;
    // A sheet to open on arrival (see CardRequest).
    open?: string;
    count?: string;
    t?: string;
  }>();
  const { wines, isLoading } = useCellar();
  const { wines: archived, isLoading: archiveLoading } = useArchive();
  const canEdit = useCellarContext().role !== 'view';
  const wine = wines.find((w) => w.id === params.wineId) ?? archived.find((w) => w.id === params.wineId);
  const intel = useWineIntel(wine, canEdit);
  const [deleted, setDeleted] = useState(false);

  // After a delete, show "removed" for a moment, then go back.
  useEffect(() => {
    if (!deleted) return;
    const timer = setTimeout(() => {
      if (router.canGoBack()) router.back();
      else router.replace('/(tabs)/cellar');
    }, 1400);
    return () => clearTimeout(timer);
  }, [deleted]);

  let content;
  if (deleted) {
    content = (
      <View style={s.toastOverlay}>
        <View style={s.toastSheet}>
          <Text style={s.toastTitle}>Wine has been removed from your records</Text>
        </View>
      </View>
    );
  } else if (!wine && (isLoading || archiveLoading)) {
    // A just-added wine can land here before the cellar refetch does.
    content = <View style={s.center}><ActivityIndicator color={colors.gold} size="large" /></View>;
  } else if (!wine) {
    content = (
      <View style={s.center}>
        <Text style={s.errorText}>Wine not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={s.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (intel.showTracker) {
    content = (
      <SearchProgress
        title="Vinster is generating Wine Intel"
        subtitle="You'll have it in just a moment"
        body="Vinster is pulling together critic scores, market value, the drinking window and a tasting note for this wine."
        durationMs={25000}
      />
    );
  } else {
    const row = parseInt(params.fromRow ?? '', 10);
    const col = parseInt(params.fromCol ?? '', 10);
    content = (
      <CellarWineCard
        // A new identity (Edit Wine changed the producer, name or vintage)
        // remounts the card, so nothing worked out for the old wine carries over.
        key={wineCardKey(wine)}
        wine={wine}
        intel={intel}
        canEdit={canEdit}
        cameFromReviews={params.from === 'reviews'}
        tappedSlot={params.fromRackId && Number.isFinite(row) && Number.isFinite(col) ? { rackId: params.fromRackId, row, col } : null}
        request={{ open: params.open, count: params.count, t: params.t }}
        onDeleted={() => setDeleted(true)}
      />
    );
  }

  return (
    <>
      {content}
      <GrapeConfirmModal wine={wine} grape={intel.grape} />
    </>
  );
}
