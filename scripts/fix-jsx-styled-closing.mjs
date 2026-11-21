/**
 * Fix TSX after partial migration: match styled opening tags and fix closing tags.
 * Also migrate className="kebab" on HTML tags to styled components.
 */
import fs from 'fs';
import path from 'path';

function pascal(name) {
  return name
    .split('-')
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : ''))
    .join('');
}

function isStyledName(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name) && name.length > 2;
}

function migrateFile(tsxPath) {
  const dir = path.dirname(tsxPath);
  const base = path.basename(tsxPath, '.tsx');
  const stylesPath = path.join(dir, `${base}.styles.ts`);
  if (!fs.existsSync(stylesPath)) return;

  const stylesSrc = fs.readFileSync(stylesPath, 'utf8');
  const exportNames = new Set(
    [...stylesSrc.matchAll(/^export const (\w+) = styled/gm)].map((x) => x[1]),
  );
  const cssPath = path.join(dir, `${base}.css`);
  const classToExport = new Map();
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf8');
    for (const cls of [...css.matchAll(/^\.([a-z0-9-]+)/gm)].map((x) => x[1])) {
      const en = pascal(cls);
      if (exportNames.has(en)) classToExport.set(cls, en);
    }
  }

  let src = fs.readFileSync(tsxPath, 'utf8');
  src = src.replace(new RegExp(`import '\\./${base}\\.css';\\n?`, 'g'), '');
  src = src.replace(new RegExp(`import "\\./${base}\\.css";\\n?`, 'g'), '');

  const htmlTags = new Set([
    'div', 'section', 'nav', 'header', 'footer', 'span', 'p', 'h1', 'h2', 'h3', 'h4',
    'button', 'a', 'label', 'input', 'select', 'textarea', 'table', 'thead', 'tbody',
    'tr', 'td', 'th', 'ul', 'li', 'form', 'svg', 'img', 'article', 'main', 'aside',
  ]);

  const used = new Set();

  // Replace <tag className="single-class"> with styled component
  for (const [cls, en] of classToExport) {
    const esc = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const tag of htmlTags) {
      const openRe = new RegExp(`<${tag}\\s+className="${esc}"([^>]*)>`, 'g');
      src = src.replace(openRe, (match, rest) => {
        used.add(en);
        return `<${en}${rest}>`;
      });
      const openRe2 = new RegExp(`<${tag}\\s+className='${esc}'([^>]*)>`, 'g');
      src = src.replace(openRe2, (match, rest) => {
        used.add(en);
        return `<${en}${rest}>`;
      });
    }
  }

  // Fix closing tags via stack
  const tagRe = /<\/?([A-Za-z][\w.-]*)\b[^>]*\/?>/g;
  const stack = [];
  let result = '';
  let lastIndex = 0;
  let m;
  while ((m = tagRe.exec(src)) !== null) {
    result += src.slice(lastIndex, m.index);
    const full = m[0];
    const name = m[1];
    const isClose = full.startsWith('</');
    const isSelfClosing = full.endsWith('/>') || /^(input|img|br|hr|meta|link|area|base|col|embed|source|track|wbr)\b/i.test(name);

    if (isClose) {
      if (stack.length && stack[stack.length - 1].name === name) {
        stack.pop();
        result += full;
      } else if (stack.length) {
        const expected = stack.pop();
        result += `</${expected.name}>`;
        tagRe.lastIndex = m.index;
        continue;
      } else {
        result += full;
      }
    } else if (isSelfClosing) {
      result += full;
    } else {
      stack.push({ name });
      result += full;
    }
    lastIndex = tagRe.lastIndex;
  }
  result += src.slice(lastIndex);
  src = result;

  if (used.size && !src.includes(`from './${base}.styles'`)) {
    const imports = [...used].sort().join(',\n  ');
    src = `import {\n  ${imports},\n} from './${base}.styles';\n${src}`;
  }

  fs.writeFileSync(tsxPath, src);
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith('.tsx')) migrateFile(p);
  }
}

walk(path.resolve('src'));
console.log('fixed jsx closings');
