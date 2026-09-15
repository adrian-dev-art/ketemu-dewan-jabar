const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'SPESIFIKASI_TEKNIS_PLATFORM_HUDANG.md');
const mdContent = fs.readFileSync(mdPath, 'utf8');

function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  const html = [];
  let inTable = false;
  let tableRows = [];
  let inAlert = false;
  let alertType = '';
  let alertContent = [];
  let inCodeBlock = false;
  let codeLang = '';
  let codeLines = [];
  let inMathBlock = false;
  let mathLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Code block handling (```)
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        // flush any pending table or alert
        if (inTable) { html.push(renderTable(tableRows)); tableRows = []; inTable = false; }
        if (inAlert) { html.push(renderAlert(alertType, alertContent)); alertContent = []; inAlert = false; }

        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
        codeLines = [];
        continue;
      } else {
        inCodeBlock = false;
        if (codeLang.toLowerCase() === 'mermaid') {
          html.push('<div class="mermaid-wrap"><div class="mermaid">\n' + codeLines.join('\n') + '\n</div></div>');
        } else {
          html.push(renderCodeBlock(codeLang, codeLines));
        }
        codeLines = [];
        codeLang = '';
        continue;
      }
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    // Display Math Block ($$ ... $$)
    if (trimmed.startsWith('$$')) {
      if (!inMathBlock) {
        if (inTable) { html.push(renderTable(tableRows)); tableRows = []; inTable = false; }
        if (inAlert) { html.push(renderAlert(alertType, alertContent)); alertContent = []; inAlert = false; }

        inMathBlock = true;
        mathLines = [];
        let rest = trimmed.slice(2);
        if (rest.endsWith('$$') && rest.length > 2) {
          mathLines.push(rest.slice(0, -2));
          html.push('<div class="math-block"><code>' + escapeHtml(mathLines.join('\n')) + '</code></div>');
          inMathBlock = false;
          mathLines = [];
        } else if (rest.length > 0) {
          mathLines.push(rest);
        }
        continue;
      } else {
        inMathBlock = false;
        html.push('<div class="math-block"><code>' + escapeHtml(mathLines.join('\n')) + '</code></div>');
        mathLines = [];
        continue;
      }
    }

    if (inMathBlock) {
      if (trimmed.endsWith('$$')) {
        mathLines.push(trimmed.slice(0, -2));
        html.push('<div class="math-block"><code>' + escapeHtml(mathLines.join('\n')) + '</code></div>');
        inMathBlock = false;
        mathLines = [];
      } else {
        mathLines.push(line);
      }
      continue;
    }

    // Table handling
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (inAlert) { html.push(renderAlert(alertType, alertContent)); alertContent = []; inAlert = false; }
      inTable = true;
      let cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
      tableRows.push(cells);
      continue;
    } else if (inTable) {
      html.push(renderTable(tableRows));
      tableRows = [];
      inTable = false;
    }

    // Alert Callout handling (> [!NOTE] etc)
    const alertMatch = trimmed.match(/^>\s*\[!(NOTE|IMPORTANT|WARNING|TIP|CAUTION)\]/i);
    if (alertMatch) {
      inAlert = true;
      alertType = alertMatch[1].toLowerCase();
      alertContent = [];
      continue;
    } else if (inAlert) {
      if (trimmed.startsWith('>')) {
        const text = trimmed.replace(/^>\s*/, '');
        alertContent.push(text);
        continue;
      } else {
        html.push(renderAlert(alertType, alertContent));
        inAlert = false;
        alertContent = [];
      }
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      html.push('<h1 class="doc-title">' + escapeHtml(trimmed.slice(2)) + '</h1>');
    } else if (trimmed.startsWith('## ')) {
      html.push('<h2 class="doc-h2">' + escapeHtml(trimmed.slice(3)) + '</h2>');
    } else if (trimmed.startsWith('### ')) {
      html.push('<h3 class="doc-h3">' + escapeHtml(trimmed.slice(4)) + '</h3>');
    } else if (trimmed.startsWith('#### ')) {
      html.push('<h4 class="doc-h4">' + escapeHtml(trimmed.slice(5)) + '</h4>');
    } else if (trimmed === '---') {
      html.push('<hr class="doc-hr" />');
    } else if (trimmed.startsWith('![')) {
      const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        const alt = match[1];
        const src = match[2];
        const absImgPath = path.resolve(__dirname, src);
        if (fs.existsSync(absImgPath)) {
          const b64 = fs.readFileSync(absImgPath).toString('base64');
          const ext = path.extname(absImgPath).replace('.', '') || 'png';
          html.push('<div class="diagram-box"><img src="data:image/' + ext + ';base64,' + b64 + '" alt="' + escapeHtml(alt) + '" /><div class="caption">' + escapeHtml(alt) + '</div></div>');
        } else {
          html.push('<div class="diagram-box"><div class="caption">[Gambar: ' + escapeHtml(alt) + ']</div></div>');
        }
      }
    } else if (trimmed.length > 0) {
      const formatted = formatInline(trimmed);

      if (/^[0-9]+(\.[0-9]+)*\.\s/.test(trimmed)) {
        html.push('<p class="numbered-item">' + formatted + '</p>');
      } else {
        html.push('<p class="body-p">' + formatted + '</p>');
      }
    }
  }

  if (inTable) { html.push(renderTable(tableRows)); }
  if (inAlert) { html.push(renderAlert(alertType, alertContent)); }
  if (inCodeBlock) { html.push(renderCodeBlock(codeLang, codeLines)); }

  return html.join('\n');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatInline(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\$([^\$]+)\$/g, '<code class="math-inline">$1</code>')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<br>/g, '<br/>');
}

function renderCodeBlock(lang, lines) {
  const content = escapeHtml(lines.join('\n'));
  const badge = lang ? `<div class="code-lang-badge">${lang.toUpperCase()}</div>` : '';
  return `<div class="code-container">${badge}<pre class="code-block"><code>${content}</code></pre></div>`;
}

function renderAlert(type, contentLines) {
  const title = type.toUpperCase();
  const text = formatInline(contentLines.join(' '));
  return `<div class="alert-box alert-${type}">
    <div class="alert-title alert-title-${type}">${title}</div>
    <div class="alert-content">${text}</div>
  </div>`;
}

function renderTable(rows) {
  if (rows.length === 0) return '';
  const out = ['<div class="table-wrap"><table>'];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.every(c => /^:?-+:?$/.test(c))) {
      continue;
    }
    out.push('<tr>');
    for (let c of row) {
      const formatted = formatInline(c);
      if (i === 0) {
        out.push('<th>' + formatted + '</th>');
      } else {
        out.push('<td>' + formatted + '</td>');
      }
    }
    out.push('</tr>');
  }
  out.push('</table></div>');
  return out.join('\n');
}

console.log('Parsing markdown to HTML...');
const bodyHtml = mdToHtml(mdContent);

// Check if local mermaid.min.js exists, embed as base64 to ensure 100% offline rendering!
const localMermaidPath = path.join(__dirname, 'mermaid.min.js');
let mermaidScriptTag = '';
if (fs.existsSync(localMermaidPath)) {
  const mermaidCode = fs.readFileSync(localMermaidPath, 'utf8');
  mermaidScriptTag = `<script>${mermaidCode}</script>`;
} else {
  mermaidScriptTag = `<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>`;
}

const completeHtml = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>SPESIFIKASI TEKNIS DAN ARSITEKTUR SISTEM PLATFORM HUDANG</title>
<style>
  @page {
    size: A4 portrait;
    margin: 15mm 12mm 15mm 12mm;
    @bottom-right {
      content: counter(page);
    }
  }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 9.5pt;
    line-height: 1.45;
    color: #1e293b;
    background: #fff;
    margin: 0;
    padding: 10px;
  }
  .doc-title {
    font-size: 13pt;
    font-weight: 800;
    text-align: center;
    text-transform: uppercase;
    color: #0f172a;
    margin-bottom: 3pt;
    letter-spacing: 0.5pt;
  }
  .doc-h2 {
    font-size: 11pt;
    font-weight: 700;
    text-transform: uppercase;
    color: #1e3a8a;
    margin-top: 16pt;
    margin-bottom: 6pt;
    border-bottom: 2pt solid #1e3a8a;
    padding-bottom: 2pt;
    page-break-after: avoid;
  }
  .doc-h3 {
    font-size: 10pt;
    font-weight: 700;
    color: #0369a1;
    margin-top: 11pt;
    margin-bottom: 4pt;
    page-break-after: avoid;
  }
  .doc-h4 {
    font-size: 9.5pt;
    font-weight: 700;
    color: #334155;
    margin-top: 8pt;
    margin-bottom: 3pt;
    page-break-after: avoid;
  }
  .doc-hr {
    border: none;
    border-top: 1pt solid #cbd5e1;
    margin: 10pt 0;
  }
  .body-p {
    text-align: justify;
    margin-bottom: 5pt;
    text-indent: 14pt;
  }
  .numbered-item {
    text-align: justify;
    margin-top: 3pt;
    margin-bottom: 3pt;
    padding-left: 18pt;
    text-indent: -18pt;
  }
  .table-wrap {
    width: 100%;
    margin: 8pt 0;
    page-break-inside: avoid;
    overflow-x: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    line-height: 1.35;
  }
  th, td {
    border: 1pt solid #94a3b8;
    padding: 3.5pt 5pt;
    vertical-align: top;
  }
  th {
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    text-align: center;
  }
  .alert-box {
    margin: 8pt 0;
    padding: 6pt 10pt;
    border-left: 3.5pt solid #3b82f6;
    background: #f8fafc;
    font-size: 9pt;
    page-break-inside: avoid;
    border-radius: 0 4pt 4pt 0;
  }
  .alert-note { border-left-color: #2563eb; background: #eff6ff; }
  .alert-important { border-left-color: #7c3aed; background: #f5f3ff; }
  .alert-warning { border-left-color: #d97706; background: #fffbeb; }
  .alert-tip { border-left-color: #059669; background: #ecfdf5; }
  .alert-caution { border-left-color: #dc2626; background: #fef2f2; }
  .alert-title {
    font-weight: 800;
    text-transform: uppercase;
    font-size: 8pt;
    margin-bottom: 2pt;
    letter-spacing: 0.5pt;
  }
  .alert-title-note { color: #1d4ed8; }
  .alert-title-important { color: #6d28d9; }
  .alert-title-warning { color: #b45309; }
  .alert-title-tip { color: #047857; }
  .alert-title-caution { color: #b91c1c; }
  .alert-content {
    color: #334155;
    text-align: justify;
  }
  .diagram-box {
    text-align: center;
    margin: 10pt 0;
    page-break-inside: avoid;
  }
  .diagram-box img {
    max-width: 100%;
    height: auto;
    border: 1pt solid #cbd5e1;
    border-radius: 4pt;
  }
  .mermaid-wrap {
    text-align: center;
    margin: 12pt 0;
    padding: 8pt;
    border: 1pt solid #e2e8f0;
    background: #fafafa;
    border-radius: 4pt;
    page-break-inside: avoid;
  }
  .mermaid {
    display: inline-block;
    max-width: 100%;
  }
  .mermaid svg {
    max-width: 100% !important;
    height: auto !important;
  }
  .caption {
    font-size: 8.5pt;
    font-weight: 700;
    margin-top: 4pt;
    color: #475569;
  }
  .code-container {
    position: relative;
    margin: 8pt 0;
    page-break-inside: avoid;
  }
  .code-lang-badge {
    position: absolute;
    top: 4pt;
    right: 6pt;
    font-size: 6.5pt;
    font-weight: 800;
    color: #94a3b8;
    background: #334155;
    padding: 1pt 4pt;
    border-radius: 3pt;
    letter-spacing: 0.5pt;
  }
  .code-block {
    background: #0f172a;
    color: #f8fafc;
    padding: 8pt 10pt;
    border-radius: 4pt;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 7.8pt;
    line-height: 1.35;
    overflow-x: auto;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .math-block {
    background: #f8fafc;
    border: 1pt solid #e2e8f0;
    padding: 6pt 10pt;
    margin: 6pt 0;
    border-radius: 4pt;
    text-align: center;
    font-family: 'Times New Roman', serif;
    font-size: 10pt;
    color: #0f172a;
    page-break-inside: avoid;
  }
  code {
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    background: #f1f5f9;
    color: #0f172a;
    padding: 1pt 3pt;
    border-radius: 2pt;
    font-size: 8.5pt;
  }
  .code-block code {
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: inherit;
  }
</style>
${mermaidScriptTag}
<script>
  document.addEventListener('DOMContentLoaded', () => {
    if (window.mermaid) {
      mermaid.initialize({
        startOnLoad: true,
        theme: 'neutral',
        securityLevel: 'loose',
        flowchart: { useMaxWidth: true, htmlLabels: true },
        sequence: { useMaxWidth: true }
      });
    }
  });
</script>
</head>
<body>
${bodyHtml}
</body>
</html>`;

const outPath = path.join(__dirname, 'spec_print.html');
fs.writeFileSync(outPath, completeHtml, 'utf8');
console.log(`Successfully generated ${outPath} (${fs.statSync(outPath).size} bytes)`);
