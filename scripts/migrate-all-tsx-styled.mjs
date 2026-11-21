import fs from 'fs';
import path from 'path';

const root = path.resolve('src');

function pascal(name) {
  return name
    .split('-')
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : ''))
    .join('');
}

function patchSimpleComponent(tsxPath, stylesBase) {
  const dir = path.dirname(tsxPath);
  const base = stylesBase || path.basename(tsxPath, '.tsx');
  const stylesPath = path.join(dir, `${base}.styles.ts`);
  if (!fs.existsSync(stylesPath)) return false;

  const stylesSrc = fs.readFileSync(stylesPath, 'utf8');
  const exportNames = [...stylesSrc.matchAll(/^export const (\w+) = styled/gm)].map((x) => x[1]);
  const cssPath = path.join(dir, `${base}.css`);
  const classToExport = new Map();
  if (fs.existsSync(cssPath)) {
    const css = fs.readFileSync(cssPath, 'utf8');
    for (const cls of [...css.matchAll(/^\.([a-z0-9-]+)/gm)].map((x) => x[1])) {
      const en = pascal(cls);
      if (exportNames.includes(en)) classToExport.set(cls, en);
    }
  }

  let c = fs.readFileSync(tsxPath, 'utf8');
  const cssImportRe = new RegExp(`import '\\./${base}\\.css';\\s*`, 'g');
  if (!cssImportRe.test(c) && !c.includes(`./${base}.css`)) return false;
  c = fs.readFileSync(tsxPath, 'utf8');
  c = c.replace(new RegExp(`import '\\./${base}\\.css';\\n?`, 'g'), '');
  c = c.replace(new RegExp(`import "\\./${base}\\.css";\\n?`, 'g'), '');

  const used = new Set();
  const tags =
    'div|section|nav|header|footer|span|p|h1|h2|h3|h4|button|a|label|input|select|textarea|table|thead|tbody|tr|td|th|ul|li|form|svg|img|article|main|aside|Link';

  for (const [cls, en] of classToExport) {
    const esc = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`<(${tags}) className="${esc}"`, 'g');
    c = c.replace(re, (match, tag) => {
      used.add(en);
      return `<${en}`;
    });
    const re2 = new RegExp(`<(${tags}) className='${esc}'`, 'g');
    c = c.replace(re2, (match, tag) => {
      used.add(en);
      return `<${en}`;
    });
  }

  if (used.size && !c.includes(`from './${base}.styles'`)) {
    const imports = [...used].sort().join(',\n  ');
    c = `import {\n  ${imports},\n} from './${base}.styles';\n${c}`;
  }
  fs.writeFileSync(tsxPath, c);
  return used.size;
}

/** Document register shared styles */
function patchDocRegisterFamily(tsxPath) {
  let c = fs.readFileSync(tsxPath, 'utf8');
  if (!c.includes('DocumentRegisterView.css') && !c.includes('MyDraftsView.css')) return 0;

  c = c.replace(/import '\.\/DocumentRegisterView\.css';\n?/g, '');
  c = c.replace(/import '\.\/MyDraftsView\.css';\n?/g, '');

  if (!c.includes("from './DocumentRegisterView.styles'")) {
    c = `import * as S from './DocumentRegisterView.styles';\n${c}`;
  }

  const replacements = [
    [/className="my-drafts"/g, 'as={S.MyDrafts}'],
    [/className="my-drafts-empty-state"/g, 'as={S.MyDraftsEmptyState}'],
    [/className="my-drafts-empty-title"/g, 'as={S.MyDraftsEmptyTitle}'],
    [/className="my-drafts-empty-text"/g, 'as={S.MyDraftsEmptyText}'],
    [/className="doc-register"/g, 'as={S.DocRegister}'],
    [/className="doc-card"/g, 'as={S.DocCard}'],
    [/className="doc-card-header"/g, 'as={S.DocCardHeader}'],
    [/className="doc-card-toolbar"/g, 'as={S.DocCardToolbar}'],
    [/className="doc-card-title-group"/g, 'as={S.DocCardTitleGroup}'],
    [/className="doc-card-actions"/g, 'as={S.DocCardActions}'],
    [/className="doc-form-grid"/g, 'as={S.DocFormGrid}'],
    [/className="doc-select-wrap"/g, 'as={S.DocSelectWrap}'],
    [/className="doc-date-wrap"/g, 'as={S.DocDateWrap}'],
    [/className="doc-reg-table-wrap"/g, 'as={S.DocRegTableWrap}'],
    [/className="doc-table-wrap"/g, 'as={S.DocTableWrap}'],
    [/className="doc-table-loading"/g, 'as={S.DocTableLoading}'],
    [/className="doc-register-empty-state"/g, 'as={S.DocRegisterEmptyState}'],
    [/className="doc-table-footer"/g, 'as={S.DocTableFooter}'],
    [/className="doc-pagination"/g, 'as={S.DocPagination}'],
    [/className="doc-reg-check-cell"/g, 'as={S.DocRegCheckCell}'],
    [/className="doc-reg-code-cell"/g, 'as={S.DocRegCodeCell}'],
    [/className="doc-reg-code-text"/g, 'as={S.DocRegCodeText}'],
    [/className="doc-reg-stack"/g, 'as={S.DocRegStack}'],
    [/className="doc-reg-action-grid"/g, 'as={S.DocRegActionGrid}'],
    [/className="doc-resubmit-actions"/g, 'as={S.DocResubmitActions}'],
    [/className="doc-row-actions"/g, 'as={S.DocRowActions}'],
    [/className="doc-reg-bookmark"/g, 'as={S.DocRegBookmark}'],
    [/className="doc-reg-avatar"/g, 'as={S.DocRegAvatar}'],
    [/className="doc-date-icon"/g, 'as={S.DocDateIcon}'],
    [/className="doc-select-chevron"/g, 'as={S.DocSelectChevron}'],
    [/className="doc-table-count"/g, 'as={S.DocTableCount}'],
    [/className="doc-page-ellipsis"/g, 'as={S.DocPageEllipsis}'],
    [/className="doc-reg-round-spacer"/g, 'as={S.DocRegRoundSpacer}'],
    [/className="doc-reg-stack-primary"/g, 'as={S.DocRegStackPrimary}'],
    [/className="doc-reg-stack-secondary"/g, 'as={S.DocRegStackSecondary}'],
    [/className="doc-card-title"/g, 'as={S.DocCardTitle}'],
    [/className="doc-register-empty-title"/g, 'as={S.DocRegisterEmptyTitle}'],
    [/className="doc-card-subtitle"/g, 'as={S.DocCardSubtitle}'],
    [/className="doc-register-empty-text"/g, 'as={S.DocRegisterEmptyText}'],
    [/className="doc-rejection-hint"/g, 'as={S.DocRejectionHint}'],
    [/className="doc-form-label"/g, 'as={S.DocFormLabel}'],
    [/className="doc-form-hint"/g, 'as={S.DocFormHint}'],
    [/className="doc-required"/g, 'as={S.DocRequired}'],
    [/className="doc-reg-table"/g, 'as={S.DocRegTable}'],
    [/className="doc-table"/g, 'as={S.DocTable}'],
    [/className="doc-reg-title-cell"/g, 'as={S.DocRegTitleCell}'],
    [/className="doc-code"/g, 'as={S.DocCode}'],
    [/className="doc-date-cell"/g, 'as={S.DocDateCell}'],
    [/className="doc-btn doc-btn-outline"/g, 'as={S.DocBtnOutline}'],
    [/className="doc-btn doc-btn-primary"/g, 'as={S.DocBtnPrimary}'],
    [/className="doc-reg-round-btn doc-reg-round-btn-primary"/g, 'as={S.DocRegRoundBtnPrimary}'],
    [/className="doc-reg-round-btn doc-reg-round-btn-danger"/g, 'as={S.DocRegRoundBtnDanger}'],
    [/className="doc-reg-round-btn"/g, 'as={S.DocRegRoundBtn}'],
    [/className="doc-reg-info-btn"/g, 'as={S.DocRegInfoBtn}'],
    [/className="doc-reg-copy-btn"/g, 'as={S.DocRegCopyBtn}'],
    [/className="doc-reg-code-link"/g, 'as={S.DocRegCodeLink}'],
    [/className="doc-action-btn doc-action-btn-danger"/g, 'as={S.DocActionBtnDanger}'],
    [/className="doc-action-btn"/g, 'as={S.DocActionBtn}'],
    [/className="doc-resubmit-btn doc-resubmit-btn-primary"/g, 'as={S.DocResubmitBtnPrimary}'],
    [/className="doc-resubmit-btn"/g, 'as={S.DocResubmitBtn}'],
    [/className="doc-page-btn active"/g, 'as={S.DocPageBtn} $active'],
    [/className="doc-page-btn"/g, 'as={S.DocPageBtn}'],
    [/className="doc-input doc-textarea"/g, 'as={S.DocTextarea}'],
    [/className="doc-input doc-date"/g, 'as={S.DocDate}'],
    [/className="doc-input doc-select"/g, 'as={S.DocSelect}'],
    [/className="doc-input"/g, 'as={S.DocInput}'],
    [/className="doc-reg-checkbox"/g, 'as={S.DocRegCheckbox}'],
    [/className="doc-hidden-file-input"/g, 'as={S.DocHiddenFileInput}'],
    [/className="doc-card-icon doc-card-icon-blue"/g, 'as={S.DocCardIcon} $blue'],
    [/className="doc-form-field wide"/g, 'as={S.DocFormField} $wide'],
    [/className="doc-form-field"/g, 'as={S.DocFormField}'],
    [/className="doc-table-row-clickable"/g, 'as={S.DocTableRowClickable}'],
    [/className="doc-reg-row selected"/g, 'as={S.DocRegRow} $selected'],
    [/className="doc-reg-row"/g, 'as={S.DocRegRow}'],
    [/className="doc-alert doc-alert-error"/g, 'as={S.DocAlert} $variant="error"'],
    [/className="doc-alert doc-alert-success"/g, 'as={S.DocAlert} $variant="success"'],
    [/className="doc-alert"/g, 'as={S.DocAlert}'],
  ];

  for (const [re, rep] of replacements) {
    c = c.replace(re, rep);
  }

  // badges
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
  return 1;
}

// Append MyDrafts + helpers to DocumentRegisterView.styles if missing
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
  // DocPageBtn $active
  if (!drs.includes('$active')) {
    drs = drs.replace(
      /export const DocPageBtn = styled\.button`([\s\S]*?)`;/,
      (m, body) =>
        `export const DocPageBtn = styled.button<{ $active?: boolean }>\`${body}\n  \${({ $active }) =>
    $active &&
    css\`
      background: #2563eb;
      border-color: #2563eb;
      color: white;
    \`}\`;`,
    );
  }
  if (!drs.includes('DocCardIcon')) {
    // skip
  } else if (!drs.match(/DocCardIcon = styled[\s\S]*\$blue/)) {
    drs = drs.replace(
      /export const DocCardIcon = styled\.div`([\s\S]*?)`;/,
      (m, body) =>
        `export const DocCardIcon = styled.div<{ $blue?: boolean }>\`${body}\n  \${({ $blue }) =>
    $blue &&
    css\`
      background: #eff6ff;
      color: #2563eb;
    \`}\`;`,
    );
  }
  if (!drs.match(/DocFormField = styled[\s\S]*\$wide/)) {
    drs = drs.replace(
      /export const DocFormField = styled\.div`([\s\S]*?)`;/,
      (m, body) =>
        `export const DocFormField = styled.div<{ $wide?: boolean }>\`${body}\n  \${({ $wide }) =>
    $wide &&
    css\`
      grid-column: span 2;
    \`}\`;`,
    );
  }
  if (!drs.match(/DocRegRow = styled[\s\S]*\$selected/)) {
    drs = drs.replace(
      /export const DocRegRow = styled\.tr`([\s\S]*?)`;/,
      (m, body) =>
        `export const DocRegRow = styled.tr<{ $selected?: boolean }>\`${body}\n  \${({ $selected }) =>
    $selected &&
    css\`
      & td {
        background: #f8fbff;
      }
    \`}\`;`,
    );
  }
  if (!drs.match(/DocAlert = styled[\s\S]*\$variant/)) {
    drs = drs.replace(
      /export const DocAlert = styled\.div`([\s\S]*?)`;/,
      (m, body) =>
        `export const DocAlert = styled.div<{ $variant?: 'error' | 'success' }>\`${body}\n  \${({ $variant }) =>
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
}

const docFiles = [
  'features/documents/components/DocumentRegisterView.tsx',
  'features/documents/components/MyDraftsView.tsx',
  'features/documents/components/RegisterSelect.tsx',
];
for (const f of docFiles) {
  patchDocRegisterFamily(path.join(root, f));
  console.log('doc register family', f);
}

// Fix RegisterSelect - use S. components on div/select
let rs = fs.readFileSync(path.join(root, 'features/documents/components/RegisterSelect.tsx'), 'utf8');
rs = rs.replace('<div as={S.DocSelectWrap}>', '<S.DocSelectWrap>');
rs = rs.replace('<select\n        as={S.DocSelect}', '<S.DocSelect');
rs = rs.replace('<span as={S.DocSelectChevron}>', '<S.DocSelectChevron>');
fs.writeFileSync(path.join(root, 'features/documents/components/RegisterSelect.tsx'), rs);

// Fix MyDrafts - div as={S.X} -> S.X
for (const f of docFiles) {
  let c = fs.readFileSync(path.join(root, f), 'utf8');
  c = c.replace(/<(div|section|span|p|h2|h3|button|table|tr|td|label|input|select|textarea) as=\{S\.(\w+)\}/g, '<S.$2');
  fs.writeFileSync(path.join(root, f), c);
}

const skip = new Set([
  'DocumentRegisterView.tsx',
  'MyDraftsView.tsx',
  'RegisterSelect.tsx',
]);

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name.endsWith('.tsx') && !skip.has(ent.name)) {
      const n = patchSimpleComponent(p);
      if (n) console.log('patched', p, n);
    }
  }
}
walk(root);

console.log('done');
