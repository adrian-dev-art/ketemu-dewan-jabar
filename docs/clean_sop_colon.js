const fs = require('fs');
const path = require('path');

const htmlFile = path.join(__dirname, 'sop_print.html');
const mdFile = path.join(__dirname, 'SOP_ALUR_KERJA_PLATFORM_HUDANG.md');

let html = fs.readFileSync(htmlFile, 'utf8');

// Regex to extract all numbered items
let matches = html.match(/<p class="numbered-item">(.*?)<\/p>/g);
console.log('Total items in sop_print:', matches ? matches.length : 0);

// We can read original sop_print.html and clean the : after bold titles
let cleanedHtml = html.replace(/(<strong>[^<]+?<\/strong>):\s+/g, '$1. ');
fs.writeFileSync(htmlFile, cleanedHtml, 'utf8');
console.log('Successfully updated sop_print.html without colon after bold titles.');
