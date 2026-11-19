import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { wc } from '../wcStyles';
import { s } from './styles';
import { showAlert } from '../../AppAlert';
import { useCellar } from '../../../hooks/useCellar';
import { bottleSizeCl } from '../../BottleSizePicker';
import { colors } from '../../../constants/theme';
import type { CellarWine } from '../../../types/wine';
import type { WineCardData } from './useWineCardData';
import { ArchiveBottlesCard } from './ArchiveBottlesCard';

const CELLAR_NOTE_MAX = 35;

// The Cellar Note, edited in place under the Cellared date and saved when the
// field loses focus (only if it changed). A note saved before the 35-character
// limit keeps its length.
function CellarNoteField({ wine, canEdit }: { wine: CellarWine; canEdit: boolean }) {
  const { updateWine } = useCellar();
  const qc = useQueryClient();
  const saved = wine.cellar_note ?? '';
  const [text, setText] = useState(saved);
  const [dirty, setDirty] = useState(false);
  // Follow the saved note until the user starts typing.
  useEffect(() => { if (!dirty) setText(saved); }, [saved, dirty]);
  const max = Math.max(CELLAR_NOTE_MAX, saved.length);

  async function save() {
    if (!dirty) return;
    setDirty(false);
    const next = text.trim();
    if (next === saved) return;
    try {
      await updateWine.mutateAsync({ id: wine.id, updates: { cellar_note: next || null } });
      void qc.invalidateQueries({ queryKey: ['rack-slots'] });
    } catch {
      showAlert({ title: 'Error', body: 'Could not save note.' });
    }
  }

  if (!canEdit) {
    return saved ? (
      <View style={wc.CellarNoteRow}>
        <Text style={wc.CellarNoteLabel}>Cellar Note: </Text>
        <Text style={wc.CellarNoteInput}>{saved}</Text>
      </View>
    ) : null;
  }
  return (
    <View style={wc.CellarNoteRow}>
      {text.trim() ? <Text style={wc.CellarNoteLabel}>Cellar Note: </Text> : null}
      <TextInput
        style={wc.CellarNoteInput}
        value={text}
        onChangeText={(t) => { setDirty(true); setText(t.slice(0, max)); }}
        onBlur={() => void save()}
        onSubmitEditing={() => Keyboard.dismiss()}
        placeholder="Add Cellar Note"
        placeholderTextColor={colors.gold}
        maxLength={max}
        returnKeyType="done"
        blurOnSubmit
        accessibilityLabel="Cellar Note"
      />
    </View>
  );
}

// A live wine's Cellar tab (an archived wine's card has no tabs).
export function CellarTab({ wine, data, canEdit, moving, onPlace, onAddToLocation, onAdd, onMove, onArchive, onDelete }: {
  wine: CellarWine;
  data: WineCardData;
  canEdit: boolean;
  moving: boolean;
  onPlace: () => void;
  onAddToLocation: () => void;
  onAdd: () => void;
  onMove: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const size = `${bottleSizeCl(wine.bottle_size_ml ?? 750)}cl`;
  const cellaredOn = wine.date_received ?? wine.created_at;
  const { entries, unplaced } = data;

  return (
    <>
      {cellaredOn ? <Text style={wc.Cellared}>Cellared {new Date(cellaredOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text> : null}
      <CellarNoteField wine={wine} canEdit={canEdit} />

      {/* Long-term storage: the same steady 12–13°C suits every wine (serving
          temperature, on the Serve tab, is per wine). */}
      <View style={[wc.VsBar, s.tempBar]}>
        <Text style={wc.Label}>Recommended Cellar Temperature</Text>
        <Text style={wc.VsValue}>12–13°C <Text style={wc.VsDiff}>(54–55°F)</Text></Text>
      </View>

      <View style={wc.Card}>
        <Text style={wc.Label}>Bottles in My Cellar</Text>
        <Text style={wc.Value}>{data.inCellar.label}</Text>
        {entries.length > 0 || unplaced > 0 ? (
          <View style={wc.List}>
            {entries.map((e, i) => {
              const last = i === entries.length - 1 && unplaced === 0;
              const body = (
                <>
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={wc.RowText} numberOfLines={1}>{e.label}{e.isExternal ? ' (external)' : ''}</Text>
                    {e.caseName ? <Text style={wc.Small}>in {e.caseName}</Text> : null}
                  </View>
                  <View style={wc.RowRight}>
                    <Text style={wc.RowScore}>{e.quantity}×{size}</Text>
                    {e.href ? <Text style={wc.Chevron}>›</Text> : null}
                  </View>
                </>
              );
              return e.href ? (
                <TouchableOpacity key={e.key} style={[wc.Row, last && wc.RowLast]} onPress={() => router.push(e.href!)} activeOpacity={0.7}>{body}</TouchableOpacity>
              ) : (
                <View key={e.key} style={[wc.Row, last && wc.RowLast]}>{body}</View>
              );
            })}
            {unplaced > 0 ? (
              <TouchableOpacity style={[wc.Row, wc.RowLast]} onPress={onPlace} disabled={!canEdit} activeOpacity={0.7} accessibilityLabel="Place these bottles">
                <Text style={wc.RowText}>Your Cellar List (not yet placed)</Text>
                <View style={wc.RowRight}>
                  <Text style={wc.RowScore}>{unplaced}×{size}</Text>
                  {canEdit ? <Text style={wc.Chevron}>›</Text> : null}
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
        {canEdit ? (
          <>
            {/* Rule between the storage locations (white) and the commands (gold). */}
            <View style={s.cellarCommandRule} />
            {entries.length === 0 ? (
              <TouchableOpacity onPress={onAddToLocation}><Text style={[s.statAction, s.cellarCommand]}>Add to Location →</Text></TouchableOpacity>
            ) : null}
            <TouchableOpacity onPress={onAdd} activeOpacity={0.7}><Text style={[s.statAction, s.cellarCommand]}>Add Bottles →</Text></TouchableOpacity>
            {data.inCellar.total > 0 ? (
              <>
                <TouchableOpacity onPress={onMove} disabled={moving} activeOpacity={0.7}><Text style={[s.statAction, s.cellarCommand]}>{moving ? 'Moving…' : 'Move Bottles →'}</Text></TouchableOpacity>
                <TouchableOpacity onPress={onArchive} activeOpacity={0.7}><Text style={[s.statAction, s.cellarCommand]}>Archive Bottles →</Text></TouchableOpacity>
              </>
            ) : null}
            <TouchableOpacity onPress={onDelete} activeOpacity={0.7}><Text style={[s.statAction, s.cellarCommand]}>Delete Wine →</Text></TouchableOpacity>
          </>
        ) : null}
      </View>

      <ArchiveBottlesCard data={data} canEdit={canEdit} />
    </>
  );
}
