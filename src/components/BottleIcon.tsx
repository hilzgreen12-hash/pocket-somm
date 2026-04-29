import { View } from 'react-native';

interface Props {
  color: string;
  size?: number;
}

export function BottleIcon({ color, size = 22 }: Props) {
  const s = size / 22;
  const b = Math.max(1, Math.round(s));

  return (
    <View style={{ width: size, height: size * 1.5, alignItems: 'center' }}>
      {/* Foil cap */}
      <View style={{
        width: 6 * s,
        height: 3 * s,
        borderTopLeftRadius: 2 * s,
        borderTopRightRadius: 2 * s,
        borderWidth: b,
        borderColor: color,
        borderBottomWidth: 0,
      }} />
      {/* Neck */}
      <View style={{
        width: 6 * s,
        height: 8 * s,
        borderLeftWidth: b,
        borderRightWidth: b,
        borderColor: color,
      }} />
      {/* Shoulder — left */}
      <View style={{
        position: 'absolute',
        top: (3 + 8) * s,
        left: '50%',
        marginLeft: -(3 * s + b / 2),
        width: 5 * s,
        height: 4 * s,
        borderBottomLeftRadius: 5 * s,
        borderLeftWidth: b,
        borderBottomWidth: b,
        borderColor: color,
        transform: [{ scaleX: -1 }],
      }} />
      {/* Shoulder — right */}
      <View style={{
        position: 'absolute',
        top: (3 + 8) * s,
        left: '50%',
        marginLeft: -(2 * s),
        width: 5 * s,
        height: 4 * s,
        borderBottomRightRadius: 5 * s,
        borderRightWidth: b,
        borderBottomWidth: b,
        borderColor: color,
      }} />
      {/* Body */}
      <View style={{
        width: 14 * s,
        height: 12 * s,
        borderLeftWidth: b,
        borderRightWidth: b,
        borderBottomWidth: b,
        borderBottomLeftRadius: 2 * s,
        borderBottomRightRadius: 2 * s,
        borderColor: color,
        marginTop: 3 * s,
      }} />
    </View>
  );
}
