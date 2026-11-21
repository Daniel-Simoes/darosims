import fs from 'fs';
import path from 'path';

const root = path.resolve('src');

function pascal(name) {
  return name
    .split('-')
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : ''))
    .join('');
}

const HTML_TAGS = [
  'div', 'section', 'nav', 'header', 'footer', 'span', 'p', 'h1', 'h2', 'h3', 'h4',
  'button', 'a', 'label', 'input', 'select', 'textarea', 'table', 'thead', 'tbody',
  'tr', 'td', 'th', 'ul', 'li', 'form', 'svg', 'img', 'article', 'main', 'aside',
];

const VOID_TAGS = new Set([
  'input', 'img', 'br', 'hr', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr',
]);

function findMatchingClose(src, openEndIndex, tag) {
  const tagRe = new RegExp(`<(/?)(${tag})\\b[^>]*>`, 'g');
  tagRe.lastIndex = openEndIndex;
  let depth = 1;
  let m;
  while ((m = tagRe.exec(src)) !== null) {
    const isClose = m[1] === '/';
    const full = m[0];
    if (full.endsWith('/>') || VOID_TAGS.has(m[2])) continue;
    if (isClose) {
      depth--;
      if (depth === 0) return { closeStart: m.index, closeEnd: tagRe.lastIndex, closeTag: m[2] };
    } else {
      depth++;
    }
  }
  return null;
}

function replaceClassElement(src, htmlTag, className, newOpenTag) {
  const esc = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const openRe = new RegExp(`<${htmlTag}\\s+className="(${esc})"([^>]*)>`, 'g');
  let result = src;
  let m;
  const opens = [];
  while ((m = openRe.exec(src)) !== null) {
    opens.push({ index: m.index, end: openRe.lastIndex, rest: m[2] });
  }
  for (let i = opens.length - 1; i >= 0; i--) {
    const { index, end, rest } = opens[i];
    const close = findMatchingClose(result, end, htmlTag);
    if (!close) continue;
    const inner = result.slice(end, close.closeStart);
    const replacement = `<${newOpenTag}${rest}>${inner}</${newOpenTag.split(/[\s>]/)[0]}>`;
    result = result.slice(0, index) + replacement + result.slice(close.closeEnd);
  }
  return result;
}

function addStylesImport(src, base, usedExports, functionName) {
  if (!usedExports.size || src.includes(`from './${base}.styles'`)) return src;
  const lines = [...usedExports].sort().map((en) => {
    if (functionName && en === functionName) return `${en} as ${en}Root`;
    return en;
  });
  return `import {\n  ${lines.join(',\n  ')},\n} from './${base}.styles';\n${src}`;
}

function applyStandard(tsxPath) {
  const dir = path.dirname(tsxPath);
  const base = path.basename(tsxPath, '.tsx');
  const functionName = base.replace(/Page$/, 'Page').match(/^[A-Z][a-zA-Z]+/)?.[0] === base ? base : null;
  const fnMatch = fs.readFileSync(tsxPath, 'utf8').match(/export function (\w+)/);
  const exportFn = fnMatch?.[1];

  const stylesPath = path.join(dir, `${base}.styles.ts`);
  const cssPath = path.join(dir, `${base}.css`);
  if (!fs.existsSync(stylesPath) || !fs.existsSync(cssPath)) return false;

  let c = fs.readFileSync(tsxPath, 'utf8');
  if (!c.includes(`${base}.css`)) return false;

  const stylesSrc = fs.readFileSync(stylesPath, 'utf8');
  const exportNames = new Set(
    [...stylesSrc.matchAll(/^export const (\w+) = styled/gm)].map((x) => x[1]),
  );
  const css = fs.readFileSync(cssPath, 'utf8');
  const classes = [...css.matchAll(/^\.([a-z0-9-]+)/gm)].map((x) => x[1]);

  c = c.replace(new RegExp(`import '\\./${base}\\.css';\\n?`, 'g'), '');
  c = c.replace(new RegExp(`import "\\./${base}\\.css";\\n?`, 'g'), '');

  const used = new Set();
  // Multi-class patterns first (longer className strings from CSS compound rules in tsx)
  const compoundPatterns = [
    ...c.matchAll(/className="([^"]+)"/g),
  ].map((x) => x[1]).filter((cn) => cn.includes(' '));

  for (const cn of [...new Set(compoundPatterns)]) {
    const firstCls = cn.split(' ')[0];
    const en = pascal(firstCls);
    if (!exportNames.has(en)) continue;
    for (const tag of HTML_TAGS) {
      const before = c;
      c = replaceClassElement(c, tag, cn, exportFn === en ? `${en}Root` : en);
      if (c !== before) used.add(en);
    }
  }

  for (const cls of classes) {
    const en = pascal(cls);
    if (!exportNames.has(en)) continue;
    const openTag = exportFn === en ? `${en}Root` : en;
    for (const tag of HTML_TAGS) {
      const before = c;
      c = replaceClassElement(c, tag, cls, openTag);
      if (c !== before) used.add(en);
    }
  }

  c = addStylesImport(c, base, used, exportFn);

  fs.writeFileSync(tsxPath, c);
  return used.size > 0;
}

function applyDocRegister(tsxPath) {
  let c = fs.readFileSync(tsxPath, 'utf8');
  if (!c.includes('DocumentRegisterView.css') && !c.includes('MyDraftsView.css')) return false;

  c = c.replace(/import '\.\/DocumentRegisterView\.css';\n?/g, '');
  c = c.replace(/import '\.\/MyDraftsView\.css';\n?/g, '');
  if (!c.includes("from './DocumentRegisterView.styles'")) {
    c = `import * as S from './DocumentRegisterView.styles';\n${c}`;
  }

  const map = [
    ['div', 'my-drafts', 'S.MyDrafts'],
    ['div', 'my-drafts-empty-state', 'S.MyDraftsEmptyState'],
    ['h3', 'my-drafts-empty-title', 'S.MyDraftsEmptyTitle'],
    ['p', 'my-drafts-empty-text', 'S.MyDraftsEmptyText'],
    ['div', 'doc-register', 'S.DocRegister'],
    ['section', 'doc-card', 'S.DocCard'],
    ['div', 'doc-card-header', 'S.DocCardHeader'],
    ['div', 'doc-card-toolbar', 'S.DocCardToolbar'],
    ['div', 'doc-card-title-group', 'S.DocCardTitleGroup'],
    ['div', 'doc-card-actions', 'S.DocCardActions'],
    ['div', 'doc-form-grid', 'S.DocFormGrid'],
    ['div', 'doc-select-wrap', 'S.DocSelectWrap'],
    ['div', 'doc-date-wrap', 'S.DocDateWrap'],
    ['div', 'doc-reg-table-wrap', 'S.DocRegTableWrap'],
    ['div', 'doc-table-wrap', 'S.DocTableWrap'],
    ['div', 'doc-table-loading', 'S.DocTableLoading'],
    ['div', 'doc-register-empty-state', 'S.DocRegisterEmptyState'],
    ['div', 'doc-table-footer', 'S.DocTableFooter'],
    ['div', 'doc-pagination', 'S.DocPagination'],
    ['div', 'doc-reg-check-cell', 'S.DocRegCheckCell'],
    ['div', 'doc-reg-code-cell', 'S.DocRegCodeCell'],
    ['span', 'doc-reg-code-text', 'S.DocRegCodeText'],
    ['div', 'doc-reg-stack', 'S.DocRegStack'],
    ['div', 'doc-reg-action-grid', 'S.DocRegActionGrid'],
    ['div', 'doc-resubmit-actions', 'S.DocResubmitActions'],
    ['div', 'doc-row-actions', 'S.DocRowActions'],
    ['span', 'doc-reg-bookmark', 'S.DocRegBookmark'],
    ['span', 'doc-reg-avatar', 'S.DocRegAvatar'],
    ['span', 'doc-date-icon', 'S.DocDateIcon'],
    ['span', 'doc-select-chevron', 'S.DocSelectChevron'],
    ['span', 'doc-table-count', 'S.DocTableCount'],
    ['span', 'doc-page-ellipsis', 'S.DocPageEllipsis'],
    ['span', 'doc-reg-round-spacer', 'S.DocRegRoundSpacer'],
    ['span', 'doc-reg-stack-primary', 'S.DocRegStackPrimary'],
    ['span', 'doc-reg-stack-secondary', 'S.DocRegStackSecondary'],
    ['h2', 'doc-card-title', 'S.DocCardTitle'],
    ['h3', 'doc-register-empty-title', 'S.DocRegisterEmptyTitle'],
    ['p', 'doc-card-subtitle', 'S.DocCardSubtitle'],
    ['p', 'doc-register-empty-text', 'S.DocRegisterEmptyText'],
    ['p', 'doc-rejection-hint', 'S.DocRejectionHint'],
    ['label', 'doc-form-label', 'S.DocFormLabel'],
    ['span', 'doc-form-hint', 'S.DocFormHint'],
    ['span', 'doc-required', 'S.DocRequired'],
    ['table', 'doc-reg-table', 'S.DocRegTable'],
    ['table', 'doc-table', 'S.DocTable'],
    ['td', 'doc-reg-title-cell', 'S.DocRegTitleCell'],
    ['td', 'doc-code', 'S.DocCode'],
    ['td', 'doc-date-cell', 'S.DocDateCell'],
    ['button', 'doc-btn doc-btn-outline', 'S.DocBtnOutline'],
    ['button', 'doc-btn doc-btn-primary', 'S.DocBtnPrimary'],
    ['button', 'doc-reg-round-btn doc-reg-round-btn-primary', 'S.DocRegRoundBtnPrimary'],
    ['button', 'doc-reg-round-btn doc-reg-round-btn-danger', 'S.DocRegRoundBtnDanger'],
    ['button', 'doc-reg-round-btn', 'S.DocRegRoundBtn'],
    ['button', 'doc-reg-info-btn', 'S.DocRegInfoBtn'],
    ['button', 'doc-reg-copy-btn', 'S.DocRegCopyBtn'],
    ['button', 'doc-reg-code-link', 'S.DocRegCodeLink'],
    ['button', 'doc-action-btn doc-action-btn-danger', 'S.DocActionBtnDanger'],
    ['button', 'doc-action-btn', 'S.DocActionBtn'],
    ['button', 'doc-resubmit-btn doc-resubmit-btn-primary', 'S.DocResubmitBtnPrimary'],
    ['button', 'doc-resubmit-btn', 'S.DocResubmitBtn'],
    ['button', 'doc-page-btn active', 'S.DocPageBtn'],
    ['button', 'doc-page-btn', 'S.DocPageBtn'],
    ['textarea', 'doc-input doc-textarea', 'S.DocTextarea'],
    ['input', 'doc-input doc-date', 'S.DocDate'],
    ['select', 'doc-input doc-select', 'S.DocSelect'],
    ['input', 'doc-input', 'S.DocInput'],
    ['input', 'doc-reg-checkbox', 'S.DocRegCheckbox'],
    ['input', 'doc-hidden-file-input', 'S.DocHiddenFileInput'],
    ['div', 'doc-form-field wide', 'S.DocFormField'],
    ['div', 'doc-form-field', 'S.DocFormField'],
    ['tr', 'doc-table-row-clickable', 'S.DocTableRowClickable'],
    ['tr', 'doc-reg-row selected', 'S.DocRegRow'],
    ['tr', 'doc-reg-row', 'S.DocRegRow'],
    ['div', 'doc-alert doc-alert-error', 'S.DocAlert'],
    ['div', 'doc-alert doc-alert-success', 'S.DocAlert'],
    ['div', 'doc-alert', 'S.DocAlert'],
    ['div', 'doc-card-icon doc-card-icon-blue', 'S.DocCardIcon'],
  ];

  for (const [tag, cls, repl] of map) {
    c = replaceClassElement(c, tag, cls, repl);
  }

  c = c.replace(
    /className=\{\`doc-badge \$\{documentTypeBadgeClass\(doc\.type\)\}\`\}/g,
    'as={S.DocBadge} $variant={S.badgeVariantFromClass(documentTypeBadgeClass(doc.type))}',
  );
  c = c.replace(
    /className=\{\`doc-reg-type-pill \$\{documentTypeBadgeClass\(doc\.type\)\}\`\}/g,
    'as={S.DocRegTypePill} $variant={S.badgeVariantFromClass(documentTypeBadgeClass(doc.type))}',
  );
  c = c.replace(
    /className=\{\`doc-reg-pill \$\{getRegisterStatusClass\(doc\)\}\`\}/g,
    'as={S.DocRegPill} $variant={S.pillVariantFromClass(getRegisterStatusClass(doc))}',
  );
  c = c.replace(/className="doc-badge badge-draft"/g, 'as={S.DocBadge} $variant="draft"');
  c = c.replace(
    /className=\{\`doc-reg-origin-icon \$\{doc\.documentOrigin === 'External' \? 'external' : 'internal'\}\`\}/g,
    'as={S.DocRegOriginIcon} $external={doc.documentOrigin === \'External\'}',
  );

  fs.writeFileSync(tsxPath, c);
  return true;
}

// DocumentRegisterView.styles extras
const drsPath = path.join(root, 'features/documents/components/DocumentRegisterView.styles.ts');
let drs = fs.readFileSync(drsPath, 'utf8');
if (!drs.includes('MyDrafts =')) {
  drs = drs.replace(
    'export const DocRegister = styled.div',
    `export const MyDrafts = styled.div\`
  display: flex;
  flex-direction: column;
  gap: 16px;
\`;

export const MyDraftsEmptyState = styled.div\`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px 56px;
  text-align: center;
\`;

export const MyDraftsEmptyTitle = styled.h3\`
  margin: 8px 0 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
\`;

export const MyDraftsEmptyText = styled.p\`
  margin: 8px 0 0;
  max-width: 360px;
  font-size: 14px;
  line-height: 1.5;
  color: #64748b;
\`;

export function pillVariantFromClass(className: string): string {
  return className.replace(/^doc-reg-pill-/, '');
}

export const DocRegister = styled.div`,
  );
}
if (!drs.includes('DocPageBtn = styled.button<{')) {
  drs = drs.replace(
    /export const DocPageBtn = styled\.button`([\s\S]*?)`;/,
    `export const DocPageBtn = styled.button<{ $active?: boolean }>\`$1
  \${({ $active }) =>
    $active &&
    css\`
      background: #2563eb;
      border-color: #2563eb;
      color: white;
    \`}\`;`,
  );
}
if (!drs.includes('DocCardIcon = styled.div<{')) {
  drs = drs.replace(
    /export const DocCardIcon = styled\.div`([\s\S]*?)`;/,
    `export const DocCardIcon = styled.div<{ $blue?: boolean }>\`$1
  \${({ $blue }) =>
    $blue &&
    css\`
      background: #eff6ff;
      color: #2563eb;
    \`}\`;`,
  );
}
if (!drs.includes('DocFormField = styled.div<{')) {
  drs = drs.replace(
    /export const DocFormField = styled\.div`([\s\S]*?)`;/,
    `export const DocFormField = styled.div<{ $wide?: boolean }>\`$1
  \${({ $wide }) =>
    $wide &&
    css\`
      grid-column: span 2;
    \`}\`;`,
  );
}
if (!drs.includes('DocRegRow = styled.tr<{')) {
  drs = drs.replace(
    /export const DocRegRow = styled\.tr`([\s\S]*?)`;/,
    `export const DocRegRow = styled.tr<{ $selected?: boolean }>\`$1
  \${({ $selected }) =>
    $selected &&
    css\`
      & td {
        background: #f8fbff;
      }
    \`}\`;`,
  );
}
if (!drs.includes('DocAlert = styled.div<{')) {
  drs = drs.replace(
    /export const DocAlert = styled\.div`([\s\S]*?)`;/,
    `export const DocAlert = styled.div<{ $variant?: 'error' | 'success' }>\`$1
  \${({ $variant }) =>
    $variant === 'error' &&
    css\`
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
    \`}\n  \${({ $variant }) =>
    $variant === 'success' &&
    css\`
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #16a34a;
    \`}\`;`,
  );
}
fs.writeFileSync(drsPath, drs);

nodeFixKeyframes();

function nodeFixKeyframes() {
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith('.styles.ts')) {
        let s = fs.readFileSync(p, 'utf8');
        s = s.replace(
          /export const (\w+) = keyframes\{([\s\S]*?)\};/g,
          'export const $1 = keyframes`$2`;',
        );
        fs.writeFileSync(p, s);
      }
    }
  }
  walk(root);
}

const docFiles = [
  'features/documents/components/DocumentRegisterView.tsx',
  'features/documents/components/MyDraftsView.tsx',
  'features/documents/components/RegisterSelect.tsx',
];
for (const f of docFiles) applyDocRegister(path.join(root, f));

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith('.tsx')) {
      if (docFiles.some((d) => p.endsWith(d.replace(/\//g, path.sep)))) continue;
      applyStandard(p);
    }
  }
}
walk(root);

// OptionPickerMenu -> DocumentTypeMenu.styles
const opPath = path.join(root, 'features/documents/components/OptionPickerMenu.tsx');
let op = fs.readFileSync(opPath, 'utf8');
if (op.includes('DocumentTypeMenu.css')) {
  op = op.replace(/import '\.\/DocumentTypeMenu\.css';\n?/, '');
  const stylesPath = path.join(root, 'features/documents/components/DocumentTypeMenu.styles.ts');
  const cssPath = path.join(root, 'features/documents/components/DocumentTypeMenu.css');
  const stylesSrc = fs.readFileSync(stylesPath, 'utf8');
  const exportNames = new Set([...stylesSrc.matchAll(/^export const (\w+) = styled/gm)].map((x) => x[1]));
  const css = fs.readFileSync(cssPath, 'utf8');
  const used = new Set();
  for (const cls of [...css.matchAll(/^\.([a-z0-9-]+)/gm)].map((x) => x[1])) {
    const en = pascal(cls);
    if (!exportNames.has(en)) continue;
    for (const tag of HTML_TAGS) {
      const before = op;
      op = replaceClassElement(op, tag, cls, en);
      if (op !== before) used.add(en);
    }
  }
  if (used.size) {
    op = `import {\n  ${[...used].sort().join(',\n  ')},\n} from './DocumentTypeMenu.styles';\n${op}`;
  }
  fs.writeFileSync(opPath, op);
}

// PdfDocumentPreview - remove word css import; word styles merged via shared classes in word styles file
const pdfPath = path.join(root, 'features/documents/components/PdfDocumentPreview.tsx');
let pdf = fs.readFileSync(pdfPath, 'utf8');
pdf = pdf.replace(/import '\.\/WordDocumentPreview\.css';\n?/, '');
fs.writeFileSync(pdfPath, pdf);
applyStandard(pdfPath);

console.log('migration applied');
