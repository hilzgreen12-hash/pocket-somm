import { View, Text, StyleSheet, type TextStyle } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// A small markdown renderer for the Vinster Journal — enough for a blog without
// pulling in a dependency: headings (##, ###), blockquotes (>), bullet lists
// (- / *), blank-line paragraphs, and inline **bold** / *italic*.

function renderInline(text: string, keyBase: string) {
  // Split on **bold** and *italic* while keeping the delimiters' content.
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) return <Text key={`${keyBase}-${i}`} style={styles.bold}>{p.slice(2, -2)}</Text>;
    if (/^\*[^*]+\*$/.test(p)) return <Text key={`${keyBase}-${i}`} style={styles.italic}>{p.slice(1, -1)}</Text>;
    return <Text key={`${keyBase}-${i}`}>{p}</Text>;
  });
}

export function MarkdownLite({ body }: { body: string }) {
  const lines = (body ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (!para.length) return;
    const text = para.join(' ');
    blocks.push(<Text key={`p-${blocks.length}`} style={styles.p}>{renderInline(text, `p${blocks.length}`)}</Text>);
    para = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <View key={`l-${blocks.length}`} style={styles.list}>
        {list.map((item, i) => (
          <View key={i} style={styles.li}>
            <Text style={styles.bullet}>•</Text>
            <Text style={[styles.p, { flex: 1, marginBottom: 0 }]}>{renderInline(item, `li${blocks.length}-${i}`)}</Text>
          </View>
        ))}
      </View>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flushPara(); flushList(); continue; }
    if (/^###\s+/.test(line)) { flushPara(); flushList(); blocks.push(<Text key={`h3-${blocks.length}`} style={styles.h3}>{line.replace(/^###\s+/, '')}</Text>); continue; }
    if (/^##\s+/.test(line)) { flushPara(); flushList(); blocks.push(<Text key={`h2-${blocks.length}`} style={styles.h2}>{line.replace(/^##\s+/, '')}</Text>); continue; }
    if (/^>\s?/.test(line)) { flushPara(); flushList(); blocks.push(<Text key={`q-${blocks.length}`} style={styles.quote}>{renderInline(line.replace(/^>\s?/, ''), `q${blocks.length}`)}</Text>); continue; }
    if (/^[-*]\s+/.test(line)) { flushPara(); list.push(line.replace(/^[-*]\s+/, '')); continue; }
    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();

  return <View>{blocks}</View>;
}

const base: TextStyle = { fontFamily: fonts.bodyRegular, fontSize: 17, lineHeight: 27, color: '#FFFFFF' };
const styles = StyleSheet.create({
  p: { ...base, marginBottom: spacing.md },
  bold: { fontFamily: fonts.bodyBold },
  italic: { fontFamily: fonts.bodyItalic },
  h2: { fontFamily: fonts.headingSemibold, fontSize: 24, lineHeight: 30, color: '#FFFFFF', marginTop: spacing.md, marginBottom: spacing.sm, letterSpacing: 0.3 },
  h3: { fontFamily: fonts.headingSemibold, fontSize: 19, lineHeight: 25, color: colors.gold, marginTop: spacing.sm, marginBottom: 6, letterSpacing: 0.3 },
  quote: { ...base, fontFamily: fonts.bodyItalic, color: colors.gold, borderLeftWidth: 2, borderLeftColor: colors.gold, paddingLeft: spacing.md, marginBottom: spacing.md },
  list: { marginBottom: spacing.md, gap: 6 },
  li: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  bullet: { color: colors.gold, fontSize: 17, lineHeight: 27 },
});
