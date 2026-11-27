import { View, Text, TouchableOpacity } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { openWhereToBuy, WHERE_TO_BUY_RECENT_KEY, type WhereToBuySource, type WhereToBuyWine } from '../../api/merchantLinks';
import { useWc } from './wcStyles';
import { s } from './cellar/styles';

// Where to Buy — Wine-Searcher's merchants for this wine; each tap is recorded.
// Shared by the cellar wine card and the Wine Intel card.
export function WhereToBuyCard({ wine, source }: { wine: WhereToBuyWine; source: WhereToBuySource }) {
  const wc = useWc();
  const { session } = useAuth();
  const qc = useQueryClient();
  const refreshList = () => void qc.invalidateQueries({ queryKey: [WHERE_TO_BUY_RECENT_KEY] });
  return (
    <View style={wc.Card}>
      <Text style={wc.H2}>Where to Buy</Text>
      <Text style={wc.BodyText}>Compare prices from merchants near you on Wine-Searcher.</Text>
      <TouchableOpacity style={s.generateBtn} onPress={() => openWhereToBuy(wine, session?.user.id, source, refreshList)} activeOpacity={0.7}>
        <Text style={s.generateBtnText}>Find Merchants →</Text>
      </TouchableOpacity>
    </View>
  );
}
