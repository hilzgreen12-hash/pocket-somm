import { View, StyleSheet } from 'react-native';

// Three-prong share glyph drawn with bordered Views — three small white
// circles in a triangular arrangement joined by two thin diagonals.
// Mirrors the Android share icon at a compact size. Used inside the
// score / rating cluster on each review card so users can hand the
// review to the native share sheet via the screen's share handler.
//
// Sized ~18x20 — adjust the box dimensions and proportionally update the
// nodes / line geometry if a different visual weight is needed elsewhere.

export function ShareIcon() {
  return (
    <View style={styles.box}>
      <View style={[styles.line, styles.lineTop]} />
      <View style={[styles.line, styles.lineBottom]} />
      <View style={[styles.node, styles.nodeTopRight]} />
      <View style={[styles.node, styles.nodeMiddleLeft]} />
      <View style={[styles.node, styles.nodeBottomRight]} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: 18, height: 20, position: 'relative' },
  node: { position: 'absolute', width: 6, height: 6, borderRadius: 3, borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: '#000000' },
  nodeTopRight: { top: 0, right: 0 },
  nodeMiddleLeft: { top: 7, left: 0 },
  nodeBottomRight: { bottom: 0, right: 0 },
  line: { position: 'absolute', height: 1, backgroundColor: '#FFFFFF' },
  // Diagonal from the middle-left node to the top-right node.
  lineTop: { width: 14, left: 2, top: 6, transform: [{ rotate: '-30deg' }] },
  // Diagonal from the middle-left node to the bottom-right node.
  lineBottom: { width: 14, left: 2, top: 13, transform: [{ rotate: '30deg' }] },
});
