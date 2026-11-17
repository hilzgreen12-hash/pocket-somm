import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { s } from './styles';
import type { CellarWine } from '../../../types/wine';
import type { WineIntel } from './useWineIntel';

// "Confirm this wine": the same producer and name is sold as more than one wine
// (e.g. a Mullineux single-vineyard as both a Syrah and a Chenin Blanc), so
// Vinster asks for the grape rather than guess. Never shown for ordinary wines.
export function GrapeConfirmModal({ wine, grape }: { wine: CellarWine | undefined; grape: WineIntel['grape'] }) {
  return (
    <Modal visible={!!wine && !!grape.variants} transparent animationType="fade" onRequestClose={grape.close}>
      <View style={s.candOverlay}>
        <View style={s.candSheet}>
          <Text style={s.candTitle}>Confirm this wine</Text>
          <Text style={s.candBody}>
            {[wine?.producer, wine?.wine_name].filter(Boolean).join(' ')} is made as more than one wine under this name. Which is this? Vinster needs the grape to get the score, value and notes right.
          </Text>
          <View>
            {(grape.variants ?? []).map((gv, i) => {
              const on = grape.selected === i;
              return (
                <TouchableOpacity key={`${gv.grape}-${i}`} style={s.candRow} onPress={() => grape.select(on ? null : i)} activeOpacity={0.7}>
                  <Text style={[s.candCheck, on && s.candCheckOn]}>{on ? '☑' : '☐'}</Text>
                  <View style={s.candRowText}>
                    <Text style={s.candItemName} numberOfLines={2}>{gv.grape}</Text>
                    {gv.style ? <Text style={s.candItemMeta} numberOfLines={1}>{gv.style}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={[s.candConfirmBtn, grape.selected == null && s.candConfirmBtnDisabled]}
            onPress={grape.confirm}
            disabled={grape.selected == null}
            activeOpacity={0.85}
          >
            <Text style={s.candConfirmText}>Confirm Wine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.candCancel} onPress={grape.letVinsterChoose}>
            <Text style={s.candCancelText}>Not sure — let Vinster choose</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
