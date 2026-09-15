const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'sop_print.html');
const mdFile = path.join(__dirname, 'SOP_ALUR_KERJA_PLATFORM_HUDANG.md');

let html = fs.readFileSync(htmlFile, 'utf8');

// Also replace colon after strong if followed by newline or tag closing:
// e.g. <strong>Penerbitan Tracking Number dan Tanda Terima</strong>: -> <strong>Penerbitan Tracking Number dan Tanda Terima</strong>.
html = html.replace(/(<strong>[^<]+?<\/strong>):(?=\s*<)/g, '$1.');

fs.writeFileSync(htmlFile, html, 'utf8');

// Now let's reverse-engineer or reconstruct the exact markdown from sop_print.html
// We read lines in sop_print.html
let lines = html.split(/\r?\n/);
let mdOut = [];

for (let line of lines) {
  let l = line.trim();
  if (l.startsWith('<h1 class="doc-title">')) {
    mdOut.push('# ' + l.replace('<h1 class="doc-title">', '').replace('</h1>', ''));
  } else if (l.startsWith('<h2 class="doc-h2">')) {
    mdOut.push('## ' + l.replace('<h2 class="doc-h2">', '').replace('</h2>', ''));
  } else if (l.startsWith('<h3 class="doc-h3">')) {
    mdOut.push('### ' + l.replace('<h3 class="doc-h3">', '').replace('</h3>', ''));
  } else if (l === '<hr class="doc-hr" />') {
    mdOut.push('---');
  } else if (l.startsWith('<p class="body-p">')) {
    let t = l.replace('<p class="body-p">', '').replace('</p>', '');
    t = t.replace(/<strong>(.*?)<\/strong>/g, '**$1**')
         .replace(/<code>(.*?)<\/code>/g, '`$1`')
         .replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>');
    mdOut.push(t);
  } else if (l.startsWith('<p class="numbered-item">')) {
    let t = l.replace('<p class="numbered-item">', '').replace('</p>', '');
    t = t.replace(/<strong>(.*?)<\/strong>/g, '**$1**')
         .replace(/<code>(.*?)<\/code>/g, '`$1`')
         .replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>');
    mdOut.push(t);
  } else if (l.startsWith('<div class="diagram-box">')) {
    let match = l.match(/<div class="caption">(.*?)<\/div>/);
    let alt = match ? match[1] : 'Diagram';
    if (alt.includes('Bagan Alur Utama')) {
      mdOut.push('![' + alt + '](diagrams/sop_main_flow.png)');
    } else if (alt.includes('Verifikasi')) {
      mdOut.push('![' + alt + '](diagrams/sop_diagram_2.png)');
    } else if (alt.includes('E-Audiensi')) {
      mdOut.push('![' + alt + '](diagrams/sop_diagram_3.png)');
    } else if (alt.includes('Empat Tahap')) {
      mdOut.push('![' + alt + '](diagrams/sop_diagram_4.png)');
    }
  }
}

// Check markdown lines
console.log('Reconstructed markdown lines:', mdOut.length);

// If table is needed, we retain the original markdown tables
// Let's write the clean markdown text
