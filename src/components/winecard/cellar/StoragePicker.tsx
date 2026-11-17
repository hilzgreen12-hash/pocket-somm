import { useEffect, useState, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { s } from './styles';
import { colors, spacing } from '../../../constants/theme';
import type { StorageLocation, WineRack } from '../../../types/wine';
import type { MoveDestination } from './useWineCardData';

// A centred sheet listing the home storage — every rack/fridge, bin and home
// alt cellar (external cellars never take bottles) — plus any extra rows.
export function StoragePickerSheet({ visible, title, racks, bins, homeLocations, onPick, onClose, children }: {
  visible: boolean;
  title: string;
  racks: WineRack[];
  bins: WineRack[];
  homeLocations: StorageLocation[];
  onPick: (dest: MoveDestination) => void;
  onClose: () => void;
  // Rows after the storage list (e.g. "+ Add New Location", the Full Cellar List).
  children?: ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.cnOverlay}>
        <View style={[s.cnSheet, { maxHeight: '80%' }]}>
          <Text style={s.cnTitle}>{title}</Text>
          <ScrollView style={{ marginTop: spacing.sm }}>
            {racks.map((r) => (
              <DestinationRow key={r.id} name={r.name} type={r.storage_type === 'fridge' ? 'Fridge' : 'Rack'} onPress={() => onPick({ kind: 'rack', id: r.id, name: r.name })} />
            ))}
            {bins.map((b) => (
              <DestinationRow key={b.id} name={b.name} type="Bin" onPress={() => onPick({ kind: 'bin', id: b.id, name: b.name })} />
            ))}
            {homeLocations.map((l) => (
              <DestinationRow key={l.id} name={l.name} type="Alt Cellar" onPress={() => onPick({ kind: 'location', id: l.id, name: l.name })} />
            ))}
            {children}
          </ScrollView>
          <TouchableOpacity style={s.cnCancel} onPress={onClose}>
            <Text style={s.cnDeleteText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export function DestinationRow({ name, type, gold, last, onPress }: { name: string; type?: string; gold?: boolean; last?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[s.destRow, last && { borderBottomWidth: 0 }]} activeOpacity={0.7} onPress={onPress}>
      <Text style={[s.destName, gold && { color: colors.gold }]} numberOfLines={1}>{name}</Text>
      {type ? <Text style={s.destType}>{type}</Text> : null}
    </TouchableOpacity>
  );
}

// "How many bottles?" for an add or a move. The count starts at `initial` each
// time the prompt opens.
export function BottleCountPrompt({ visible, body, initial, actionLabel, busy, busyLabel, onConfirm, onClose }: {
  visible: boolean;
  body: string;
  initial: number;
  actionLabel: string;
  busy: boolean;
  busyLabel: string;
  onConfirm: (count: number) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(String(initial));
  useEffect(() => { if (visible) setText(String(initial)); }, [visible, initial]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={s.cnOverlay}>
        <View style={s.cnSheet}>
          <Text style={s.cnTitle}>How many bottles?</Text>
          <Text style={[s.cnBody, { marginTop: spacing.xs }]}>{body}</Text>
          <TextInput
            style={s.cnInput}
            value={text}
            onChangeText={(t) => setText(t.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            autoFocus
            selectTextOnFocus
          />
          <TouchableOpacity style={s.cnSaveBtn} onPress={() => onConfirm(Math.max(1, parseInt(text, 10) || 1))} disabled={busy} activeOpacity={0.85}>
            <Text style={s.cnSaveText}>{busy ? busyLabel : actionLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.cnCancel} onPress={onClose}>
            <Text style={s.cnDeleteText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
