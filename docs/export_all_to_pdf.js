const fs = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

console.log('================================================================');
console.log('      PROSES PEMBUATAN DOKUMEN CETAK DAN EKSPOR PDF RESMI       ');
console.log('  1. SOP Pengelolaan Aspirasi dan E-Audiensi (PermenPAN-RB)     ');
console.log('  2. Spesifikasi Teknis dan Arsitektur Sistem Rekayasa SPBE     ');
console.log('================================================================\n');

// 1. Convert SOP to HTML
console.log('[STEP 1/4] Mengonversi SOP_ALUR_KERJA_PLATFORM_HUDANG.md ke HTML...');
execSync('node "' + path.join(__dirname, 'convert_sop_to_html.js') + '"', { stdio: 'inherit' });

// 2. Convert Spec to HTML
console.log('\n[STEP 2/4] Mengonversi SPESIFIKASI_TEKNIS_PLATFORM_HUDANG.md ke HTML...');
execSync('node "' + path.join(__dirname, 'convert_spec_to_html.js') + '"', { stdio: 'inherit' });

// Locate Headless Browser (Edge or Chrome)
let browserPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
if (!fs.existsSync(browserPath)) {
  browserPath = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';
}
if (!fs.existsSync(browserPath)) {
  browserPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
}

if (!fs.existsSync(browserPath)) {
  console.error('ERROR: Microsoft Edge atau Google Chrome tidak ditemukan di sistem.');
  process.exit(1);
}

console.log(`\nPeramban headless terdeteksi: ${browserPath}`);

function printPdf(htmlFilename, pdfFilename, timeoutMs = 60000) {
  const htmlFile = path.join(__dirname, htmlFilename);
  const pdfFile = path.join(__dirname, pdfFilename);
  const fileUrl = 'file:///' + htmlFile.replace(/\\/g, '/');

  console.log(`Mencetak ${htmlFilename} -> ${pdfFilename}...`);

  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    '--virtual-time-budget=12000',
    '--print-to-pdf=' + pdfFile,
    fileUrl
  ];

  const proc = spawnSync(browserPath, args, { stdio: 'inherit', timeout: timeoutMs });

  if (fs.existsSync(pdfFile)) {
    const stats = fs.statSync(pdfFile);
    console.log(`SUKSES: ${pdfFilename} berhasil diterbitkan (${(stats.size / 1024).toFixed(1)} KB)`);
    return true;
  } else {
    console.error(`GAGAL: ${pdfFilename} tidak berhasil dibuat.`);
    return false;
  }
}

// 3. Export SOP PDF
console.log('\n[STEP 3/4] Mengekspor Dokumen SOP ke Format PDF Resmi...');
const sopOk = printPdf('sop_print.html', 'SOP_ALUR_KERJA_PLATFORM_HUDANG.pdf', 60000);

// 4. Export Spec PDF
console.log('\n[STEP 4/4] Mengekspor Dokumen Spesifikasi Teknis ke Format PDF Resmi...');
const specOk = printPdf('spec_print.html', 'SPESIFIKASI_TEKNIS_PLATFORM_HUDANG.pdf', 90000);

console.log('\n================================================================');
if (sopOk && specOk) {
  console.log('   SEMUA DOKUMEN BERHASIL DITERBITKAN KE FORMAT PDF RESMI!     ');
} else {
  console.log('   TERDAPAT PERINGATAN SAAT PEMBUATAN DOKUMEN PDF.             ');
}
console.log('================================================================');
