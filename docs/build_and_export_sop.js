const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

const htmlPath = path.join(__dirname, 'sop_print.html');
const mdPath = path.join(__dirname, 'SOP_ALUR_KERJA_PLATFORM_HUDANG.md');
const pdfPath = path.join(__dirname, 'SOP_ALUR_KERJA_PLATFORM_HUDANG.pdf');

console.log('--- Step 1: Generating sop_print.html from SOP_ALUR_KERJA_PLATFORM_HUDANG.md ---');
execSync('node "' + path.join(__dirname, 'convert_sop_to_html.js') + '"', { stdio: 'inherit' });

console.log('--- Step 2: Exporting to PDF via Edge/Chrome Headless ---');
let browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
if (!fs.existsSync(browserPath)) {
  browserPath = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';
}
if (!fs.existsSync(browserPath)) {
  browserPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

console.log('Browser path:', browserPath);
const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

const args = [
  '--headless=new',
  '--disable-gpu',
  '--no-pdf-header-footer',
  '--run-all-compositor-stages-before-draw',
  '--virtual-time-budget=8000',
  '--print-to-pdf=' + pdfPath,
  fileUrl
];

console.log('Executing print to PDF...');
const proc = spawnSync(browserPath, args, { stdio: 'inherit', timeout: 30000 });

if (fs.existsSync(pdfPath)) {
  const stats = fs.statSync(pdfPath);
  console.log(`PDF successfully created: ${pdfPath} (${stats.size} bytes)`);
} else {
  console.error('PDF creation failed or timed out.');
}
