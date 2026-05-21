"""Per-file font-migration helper.

Usage:
  python scripts/font_migrate.py <file_path> '<json_mapping>'

The mapping is a JSON object: style_name -> 'fonts.headingX' or 'fonts.bodyX'.

Behaviour:
  - Adds `import { fonts } from '<correct relative>/constants/fonts'`
    after the existing import from `'.../constants/theme'` if not
    already present. The relative path is inferred from the theme
    import line so each file gets the right depth.
  - Finds each declared style by name, locates the
    `fontFamily: 'CormorantGaramond_<weight>'` line inside that
    style block, and rewrites just that value.

Style declarations are expected to be on the canonical React Native
StyleSheet shape:
    styleName: { ... fontFamily: 'CormorantGaramond_<weight>' ... }

The regex allows the block to span multiple lines (no nested braces).
"""
import sys, re, json

file_path = sys.argv[1]
mapping = json.loads(sys.argv[2])

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add the fonts import line if missing.
if 'from' in content and "constants/fonts" not in content:
    # Detect the relative path from the existing theme import.
    m = re.search(
        r"^(import\s*\{[^}]*\}\s*from\s*')([^']+/constants)/theme(';.*)$",
        content,
        re.MULTILINE,
    )
    if m:
        theme_prefix = m.group(1).rsplit('{', 1)[0]  # 'import '
        base = m.group(2)  # '../../src/constants' or similar
        # Insert AFTER the theme import line.
        theme_line = m.group(0)
        new_import = f"import {{ fonts }} from '{base}/fonts';"
        content = content.replace(theme_line, theme_line + '\n' + new_import, 1)
        print(f'  added fonts import (path: {base}/fonts)')
    else:
        print(f'  WARN: could not locate constants/theme import to anchor fonts import')

# 2. Apply the mapping.
missing = []
replaced = 0

for style_name, token in mapping.items():
    pattern = re.compile(
        r'(\b' + re.escape(style_name) + r'\s*:\s*\{[^{}]*?fontFamily\s*:\s*)\'CormorantGaramond_[A-Za-z0-9_]+\'',
        re.DOTALL,
    )
    new_content, n = pattern.subn(r'\1' + token, content)
    if n == 0:
        missing.append(style_name)
    replaced += n
    content = new_content

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'{file_path}: {replaced} replacements')
if missing:
    print('  missing:', ', '.join(missing))
remaining = len(re.findall(r"'CormorantGaramond_[A-Za-z0-9_]+'", content))
print(f'  remaining Cormorant refs: {remaining}')
