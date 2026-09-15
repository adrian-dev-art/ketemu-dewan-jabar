const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, 'SOP_ALUR_KERJA_PLATFORM_HUDANG.md');
let mdContent = fs.readFileSync(mdPath, 'utf8');

function mdToHtml(md) {
  let lines = md.split(/\r?\n/);
  let html = [];
  let inTable = false;
  let tableRows = [];
  let inAlert = false;
  let alertType = '';
  let alertContent = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let trimmed = line.trim();

    // Table handling
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
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
    let alertMatch = trimmed.match(/^>\s*\[!(NOTE|IMPORTANT|WARNING|TIP|CAUTION)\]/i);
    if (alertMatch) {
      inAlert = true;
      alertType = alertMatch[1].toLowerCase();
      alertContent = [];
      continue;
    } else if (inAlert) {
      if (trimmed.startsWith('>')) {
        let text = trimmed.replace(/^>\s*/, '');
        alertContent.push(text);
        continue;
      } else {
        html.push(renderAlert(alertType, alertContent));
        inAlert = false;
        alertContent = [];
      }
    }

    if (trimmed.startsWith('# ')) {
      html.push('<h1 class="doc-title">' + escapeHtml(trimmed.slice(2)) + '</h1>');
    } else if (trimmed.startsWith('## ')) {
      html.push('<h2 class="doc-h2">' + escapeHtml(trimmed.slice(3)) + '</h2>');
    } else if (trimmed.startsWith('### ')) {
      html.push('<h3 class="doc-h3">' + escapeHtml(trimmed.slice(4)) + '</h3>');
    } else if (trimmed === '---') {
      html.push('<hr class="doc-hr" />');
    } else if (trimmed.startsWith('![')) {
      let match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
      if (match) {
        let alt = match[1];
        let src = match[2];
        let absImgPath = path.resolve(__dirname, src);
        if (fs.existsSync(absImgPath)) {
          let b64 = fs.readFileSync(absImgPath).toString('base64');
          let ext = path.extname(absImgPath).replace('.', '') || 'png';
          html.push('<div class="diagram-box"><img src="data:image/' + ext + ';base64,' + b64 + '" alt="' + escapeHtml(alt) + '" /><div class="caption">' + escapeHtml(alt) + '</div></div>');
        } else {
          html.push('<div class="diagram-box"><div class="caption">[Gambar: ' + escapeHtml(alt) + ']</div></div>');
        }
      }
    } else if (trimmed.length > 0) {
      let formatted = trimmed
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/<br>/g, '<br/>');

      if (/^[0-9]+(\.[0-9]+)*\.\s/.test(trimmed)) {
        html.push('<p class="numbered-item">' + formatted + '</p>');
      } else {
        html.push('<p class="body-p">' + formatted + '</p>');
      }
    }
  }

  if (inTable) {
    html.push(renderTable(tableRows));
  }
  if (inAlert) {
    html.push(renderAlert(alertType, alertContent));
  }

  return html.join('\n');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderAlert(type, contentLines) {
  let title = type.toUpperCase();
  let text = contentLines.join(' ')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
  return `<div class="alert-box alert-${type}">
    <div class="alert-title alert-title-${type}">${title}</div>
    <div class="alert-content">${text}</div>
  </div>`;
}

function renderTable(rows) {
  if (rows.length === 0) return '';
  let out = ['<div class="table-wrap"><table>'];
  let isHeader = true;
  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    if (row.every(c => /^:?-+:?$/.test(c))) {
      isHeader = false;
      continue;
    }
    out.push('<tr>');
    for (let c of row) {
      let formatted = c
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/<br>/g, '<br/>');
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

const bodyHtml = mdToHtml(mdContent);

const completeHtml = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<title>SOP PENGELOLAAN ASPIRASI DAN E-AUDIENSI PLATFORM HUDANG</title>
<style>
  @page {
    size: A4 portrait;
    margin: 18mm 14mm 18mm 14mm;
  }
  * { box-sizing: border-box; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 10.5pt;
    line-height: 1.42;
    color: #111;
    background: #fff;
    margin: 0;
    padding: 15px;
  }
  .doc-title {
    font-size: 13pt;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    margin-bottom: 3pt;
  }
  .doc-h2 {
    font-size: 11pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 14pt;
    margin-bottom: 5pt;
    border-bottom: 1.5pt solid #000;
    padding-bottom: 2pt;
    page-break-after: avoid;
  }
  .doc-h3 {
    font-size: 10.5pt;
    font-weight: bold;
    margin-top: 9pt;
    margin-bottom: 3pt;
    page-break-after: avoid;
  }
  .doc-hr {
    border: none;
    border-top: 1pt solid #000;
    margin: 8pt 0;
  }
  .body-p {
    text-align: justify;
    margin-bottom: 5pt;
    text-indent: 18pt;
  }
  .numbered-item {
    text-align: justify;
    margin-top: 2.5pt;
    margin-bottom: 2.5pt;
    padding-left: 18pt;
    text-indent: -18pt;
  }
  .table-wrap {
    width: 100%;
    margin: 8pt 0;
    page-break-inside: avoid;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9pt;
    line-height: 1.35;
  }
  th, td {
    border: 1pt solid #000;
    padding: 3.5pt 5pt;
    vertical-align: top;
  }
  th {
    background: #f2f2f2;
    font-weight: bold;
    text-align: center;
  }
  .alert-box {
    margin: 7pt 0;
    padding: 5pt 9pt;
    border-left: 3pt solid #333;
    background: #f8f9fa;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  .alert-note { border-left-color: #0d6efd; background: #f0f7ff; }
  .alert-important { border-left-color: #6f42c1; background: #f8f5fc; }
  .alert-warning { border-left-color: #fd7e14; background: #fff9f4; }
  .alert-tip { border-left-color: #198754; background: #f2faf5; }
  .alert-caution { border-left-color: #dc3545; background: #fdf3f4; }
  .alert-title {
    font-weight: bold;
    text-transform: uppercase;
    font-size: 8.5pt;
    margin-bottom: 2pt;
    letter-spacing: 0.5pt;
  }
  .alert-title-note { color: #0d6efd; }
  .alert-title-important { color: #6f42c1; }
  .alert-title-warning { color: #fd7e14; }
  .alert-title-tip { color: #198754; }
  .alert-title-caution { color: #dc3545; }
  .alert-content {
    color: #222;
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
    border: 1pt solid #000;
  }
  .caption {
    font-size: 9pt;
    font-weight: bold;
    margin-top: 4pt;
    color: #000;
  }
  code {
    font-family: 'Courier New', monospace;
    background: #f4f4f4;
    padding: 1pt 3pt;
    font-size: 8.5pt;
  }
</style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'sop_print.html'), completeHtml, 'utf8');
console.log('Successfully generated upgraded sop_print.html');
