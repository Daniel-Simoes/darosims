/**
 * Patch a TSX file: remove .css import, use styled exports for className="kebab-case".
 * Usage: node scripts/patch-tsx-to-styled.mjs path/to/Component.tsx
 */
import fs from 'fs';
import path from 'path';

const tsxPath = path.resolve(process.argv[2]);
const dir = path.dirname(tsxPath);
const base = path.basename(tsxPath, '.tsx');
const stylesPath = path.join(dir, `${base}.styles.ts`);

if (!fs.existsSync(stylesPath)) {
  console.error('Missing styles:', stylesPath);
  process.exit(1);
}

const stylesSrc = fs.readFileSync(stylesPath, 'utf8');
const exportNames = [...stylesSrc.matchAll(/^export const (\w+) = styled/gm)].map((x) => x[1]);

function pascal(name) {
  return name
    .split('-')
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : ''))
    .join('');
}

const classToExport = new Map();
for (const en of exportNames) {
  // reverse: TrustBar -> trust-bar (approximate - match by pascal to kebab)
  classToExport.set(
    en.replace(/([A-Z])/g, (m, _, i) => (i ? '-' : '') + m.toLowerCase()).replace(/^-/, ''),
    en,
  );
}
// Better: read css file if exists
const cssPath = path.join(dir, `${base}.css`);
if (fs.existsSync(cssPath)) {
  const css = fs.readFileSync(cssPath, 'utf8');
  const classes = [...css.matchAll(/^\.([a-z0-9-]+)/gm)].map((x) => x[1]);
  for (const cls of classes) {
    const en = pascal(cls);
    if (exportNames.includes(en)) classToExport.set(cls, en);
  }
}

let c = fs.readFileSync(tsxPath, 'utf8');
c = c.replace(new RegExp(`import '\\./${base}\\.css';\\n?`), '');
c = c.replace(new RegExp(`import "\\./${base}\\.css";\\n?`), '');

const used = new Set();
for (const [cls, en] of classToExport) {
  const tags = ['div', 'section', 'nav', 'header', 'footer', 'span', 'p', 'h1', 'h2', 'h3', 'button', 'a', 'label', 'input', 'table', 'tr', 'td', 'th', 'ul', 'li', 'form', 'svg', 'img', 'article', 'main', 'aside'];
  for (const tag of tags) {
    const re = new RegExp(`<${tag} className="${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
    if (re.test(c)) {
      c = c.replace(re, `<${en}`);
      used.add(en);
    }
    const re2 = new RegExp(`<${tag} className='${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g');
    if (re2.test(c)) {
      c = c.replace(re2, `<${en}`);
      used.add(en);
    }
  }
}

if (used.size) {
  const imports = [...used].sort().join(',\n  ');
  const importLine = `import {\n  ${imports},\n} from './${base}.styles';\n`;
  if (!c.includes(`from './${base}.styles'`)) {
    c = importLine + c;
  }
}

fs.writeFileSync(tsxPath, c);
console.log(`Patched ${tsxPath}, used ${used.size} styled exports`);
