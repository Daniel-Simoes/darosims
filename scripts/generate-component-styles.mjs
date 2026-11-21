/**
 * Generate Component.styles.ts from Component.css (same directory).
 * Usage: node scripts/generate-component-styles.mjs path/to/Component.css
 */
import fs from 'fs';
import path from 'path';

const cssPath = path.resolve(process.argv[2]);
if (!cssPath || !fs.existsSync(cssPath)) {
  console.error('Usage: node generate-component-styles.mjs path/to/File.css');
  process.exit(1);
}

const outPath = cssPath.replace(/\.css$/, '.styles.ts');
const css = fs.readFileSync(cssPath, 'utf8');
const baseName = path.basename(cssPath, '.css');

function pascal(name) {
  return name
    .split('-')
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : ''))
    .join('');
}

function exportName(cls) {
  return pascal(cls);
}

function tagFor(cls) {
  if (cls.includes('checkbox') || cls === 'doc-hidden-file-input') return 'input';
  if (
    cls.includes('btn') ||
    cls.includes('button') ||
    cls.endsWith('-link') ||
    cls.includes('round-btn') ||
    cls.includes('page-btn') ||
    cls.includes('info-btn') ||
    cls.includes('copy-btn') ||
    cls.includes('resubmit-btn') ||
    cls.includes('action-btn') ||
    cls.includes('tab') ||
    cls.includes('toggle')
  )
    return 'button';
  if (cls === 'doc-input' || cls.endsWith('-input') || cls.includes('search-input')) return 'input';
  if (cls.includes('textarea')) return 'textarea';
  if (cls.includes('select') && !cls.includes('wrap')) return 'select';
  if (cls.endsWith('-label') || cls === 'doc-form-label') return 'label';
  if (cls === 'doc-reg-table' || cls === 'doc-table' || cls.endsWith('-table')) return 'table';
  if (cls.includes('-row') && !cls.includes('arrow')) return 'tr';
  if (cls.startsWith('doc-reg-col') || (cls.includes('col-') && cls.includes('th'))) return 'th';
  if (cls.endsWith('-cell') || cls.includes('title-cell')) return 'td';
  if (cls === 'section' || cls.endsWith('-section')) return 'section';
  if (cls === 'nav' || cls.endsWith('-nav')) return 'nav';
  if (cls === 'header' || cls.endsWith('-header')) return 'header';
  if (cls === 'footer' || cls.endsWith('-footer')) return 'footer';
  if (cls.includes('-icon') && !cls.includes('wrap')) return 'span';
  if (cls.includes('-title') && !cls.includes('group')) return 'h2';
  if (cls.includes('subtitle')) return 'p';
  if (cls.includes('overlay')) return 'div';
  if (cls.includes('svg') || cls === 'icon') return 'svg';
  if (cls.includes('img') || cls.includes('logo')) return 'img';
  if (cls.includes('anchor') || cls === 'link') return 'a';
  return 'div';
}

const keyframesBlocks = [];
let rest = css.replace(/@keyframes[\s\S]*?\}\s*\}/g, (block) => {
  keyframesBlocks.push(block);
  return `\n/*KEYFRAME${keyframesBlocks.length - 1}*/\n`;
});

const mediaEntries = [];
rest = rest.replace(/(@media[^{]+)\{([\s\S]*?)\n\}/g, (_, mq, inner) => {
  mediaEntries.push({ mq: mq.trim(), inner: inner.trim() });
  return `\n/*MEDIA${mediaEntries.length - 1}*/\n`;
});

const rules = [];
const re = /([^{]+)\{([^}]*)\}/g;
let m;
while ((m = re.exec(rest)) !== null) {
  const sel = m[1].trim();
  const body = m[2].trim();
  if (sel.startsWith('/*') || !sel) continue;
  rules.push({ sel, body });
}

const byPrimary = new Map();
for (const r of rules) {
  for (const part of r.sel.split(',')) {
    const first = part.trim();
    if (!first.startsWith('.')) continue;
    const primary = first.replace(/^\./, '').split(/[:\s.#[]+/)[0];
    if (!primary) continue;
    const key = primary;
    if (!byPrimary.has(key)) byPrimary.set(key, []);
    if (!byPrimary.get(key).some((x) => x.sel === r.sel && x.body === r.body)) {
      byPrimary.get(key).push({ ...r, part: first });
    }
  }
}

let out = `import styled, { css, keyframes } from 'styled-components';\n\n`;

for (const kb of keyframesBlocks) {
  const nameMatch = kb.match(/@keyframes\s+([\w-]+)/);
  const constName = pascal(nameMatch?.[1] ?? 'anim');
  out += `export const ${constName} = keyframes${kb.slice(kb.indexOf('{'))};\n\n`;
}

const emitted = new Set();

for (const [primary, rs] of [...byPrimary.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const name = exportName(primary);
  if (emitted.has(name)) continue;
  emitted.add(name);
  const t = tagFor(primary);
  const lines = [];
  for (const r of rs) {
    const sel = r.part || r.sel.split(',')[0].trim();
    if (sel === `.${primary}` || sel.startsWith(`.${primary}:`)) {
      lines.push(r.body);
    } else if (sel.startsWith(`.${primary}`)) {
      let nested = sel.replace(new RegExp(`^\\.${primary}`), '&');
      lines.push(`${nested} {\n    ${r.body}\n  }`);
    }
  }

  let mediaLines = '';
  for (const { mq, inner } of mediaEntries) {
    const relevant = inner
      .split(/\n(?=\.)/)
      .filter((chunk) => chunk.trim().startsWith(`.${primary}`) || chunk.includes(`.${primary} `));
    if (relevant.length) {
      mediaLines += `\n  ${mq} {\n`;
      for (const chunk of relevant) {
        const chunkRules = [];
        let cm;
        const cre = /([^{]+)\{([^}]*)\}/g;
        while ((cm = cre.exec(chunk)) !== null) {
          const s = cm[1].trim();
          const b = cm[2].trim();
          if (s.startsWith(`.${primary}`)) {
            const nested = s.replace(new RegExp(`^\\.${primary}`), '&');
            chunkRules.push(`${nested} {\n      ${b}\n    }`);
          } else if (s === `.${primary}`) {
            chunkRules.push(b);
          }
        }
        mediaLines += `    ${chunkRules.join('\n    ')}\n`;
      }
      mediaLines += `  }\n`;
    }
  }

  if (!lines.length && !mediaLines) continue;
  out += `export const ${name} = styled.${t}\`\n  ${lines.join('\n\n  ')}${mediaLines}\n\`;\n\n`;
}

fs.writeFileSync(outPath, out);
console.log(`Wrote ${outPath} (${emitted.size} exports, ${mediaEntries.length} media blocks)`);
