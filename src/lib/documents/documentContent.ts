import mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';

const PDF_EXPORT_STYLES = `
  .pdf-export-root {
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #0f172a;
    padding: 24px;
    max-width: 800px;
  }
  .pdf-export-root h1 { font-size: 22pt; margin: 0 0 12px; }
  .pdf-export-root h2 { font-size: 16pt; margin: 18px 0 8px; }
  .pdf-export-root h3 { font-size: 13pt; margin: 14px 0 6px; }
  .pdf-export-root p { margin: 0 0 10px; }
  .pdf-export-root ul, .pdf-export-root ol { margin: 0 0 10px 24px; padding: 0; }
  .pdf-export-root li { margin-bottom: 4px; }
  .pdf-export-root strong { font-weight: 700; }
  .pdf-export-root em { font-style: italic; }
`;

export async function parseDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    { includeDefaultStyleMap: true },
  );
  return result.value || '<p></p>';
}

export async function parseTextFile(file: File): Promise<string> {
  const text = await file.text();
  const paragraphs = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('');

  return paragraphs || '<p></p>';
}

export function isEditorContentEmpty(html: string): boolean {
  const stripped = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.length === 0;
}

export async function htmlToPdfFile(html: string, fileName: string): Promise<File> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = 'white';

  const root = document.createElement('div');
  root.className = 'pdf-export-root';
  root.innerHTML = html;
  container.appendChild(root);

  const style = document.createElement('style');
  style.textContent = PDF_EXPORT_STYLES;
  container.appendChild(style);

  document.body.appendChild(container);

  try {
    const blob = await html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(root)
      .outputPdf('blob');

    return new File([blob], fileName, { type: 'application/pdf' });
  } finally {
    document.body.removeChild(container);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
