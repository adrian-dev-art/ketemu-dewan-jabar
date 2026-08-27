/**
 * Node.js Scraper Data Perjalanan Dinas & Kunjungan Kerja DPRD Provinsi Jawa Barat
 * Menggunakan Native Fetch & XML parsing tanpa external dependency
 * Output: JSON & CSV
 */

import fs from 'fs';
import path from 'path';

const SEARCH_QUERIES = [
  'DPRD Jawa Barat "kunjungan kerja"',
  'DPRD Jawa Barat "perjalanan dinas"',
  'DPRD Jabar "reses"',
  'DPRD Jawa Barat "studi banding"',
  'DPRD Jawa Barat Komisi "kunker"'
];

const REGIONS = [
  'Bandung', 'Cimahi', 'Bandung Barat', 'Bogor', 'Sukabumi', 'Cianjur',
  'Garut', 'Tasikmalaya', 'Ciamis', 'Banjar', 'Pangandaran', 'Kuningan',
  'Cirebon', 'Majalengka', 'Sumedang', 'Indramayu', 'Subang', 'Purwakarta',
  'Karawang', 'Bekasi', 'Depok', 'Jakarta', 'Bali', 'Yogyakarta', 'Semarang', 'Surabaya'
];

function extractKomisi(text) {
  const t = text.toLowerCase();
  if (t.includes('komisi i') || t.includes('komisi 1')) return 'Komisi I';
  if (t.includes('komisi ii') || t.includes('komisi 2')) return 'Komisi II';
  if (t.includes('komisi iii') || t.includes('komisi 3')) return 'Komisi III';
  if (t.includes('komisi iv') || t.includes('komisi 4')) return 'Komisi IV';
  if (t.includes('komisi v') || t.includes('komisi 5')) return 'Komisi V';
  if (t.includes('banggar') || t.includes('badan anggaran')) return 'Badan Anggaran';
  if (t.includes('banmus') || t.includes('badan musyawarah')) return 'Badan Musyawarah';
  if (t.includes('reses')) return 'Seluruh Anggota (Reses Dapil)';
  return 'DPRD Jabar / Pimpinan';
}

function extractCategory(text) {
  const t = text.toLowerCase();
  if (t.includes('reses')) return 'Reses';
  if (t.includes('studi banding') || t.includes('kaji terap')) return 'Studi Banding';
  if (t.includes('kunjungan kerja') || t.includes('kunker')) return 'Kunjungan Kerja';
  if (t.includes('perjalanan dinas')) return 'Perjalanan Dinas';
  return 'Kunjungan Kerja';
}

function extractLocation(text) {
  const matched = REGIONS.filter(reg => new RegExp(`\\b${reg}\\b`, 'i').test(text));
  return matched.length > 0 ? matched.join(', ') : 'Jawa Barat / Terkait';
}

function parseXMLItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemBlock = match[1];
    const getTag = (tag) => {
      const tagMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i').exec(itemBlock);
      return tagMatch ? tagMatch[1].replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1').trim() : '';
    };

    const title = getTag('title');
    const link = getTag('link');
    const pubDate = getTag('pubDate');
    const source = getTag('source') || 'Media Publik';

    if (title && link) {
      items.push({ title, link, pubDate, source });
    }
  }

  return items;
}

async function runScraper() {
  console.log('🚀 Memulai penarikan data perjalanan dinas DPRD Jawa Barat...');
  const allResults = [];
  const seenLinks = new Set();

  for (const query of SEARCH_QUERIES) {
    const encoded = encodeURIComponent(`${query} when:1y`);
    const url = `https://news.google.com/rss/search?q=${encoded}&hl=id&gl=ID&ceid=ID:id`;

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!res.ok) {
        console.warn(`⚠️ HTTP ${res.status} untuk query "${query}"`);
        continue;
      }

      const xml = await res.text();
      const items = parseXMLItems(xml);

      for (const item of items) {
        if (!seenLinks.has(item.link)) {
          seenLinks.add(item.link);
          allResults.push({
            id: `PD-${String(allResults.length + 1).padStart(3, '0')}`,
            judul: item.title,
            kategori: extractCategory(item.title),
            komisi: extractKomisi(item.title),
            lokasi: extractLocation(item.title),
            tanggal_publikasi: item.pubDate,
            sumber: item.source,
            url: item.link
          });
        }
      }
    } catch (err) {
      console.error(`❌ Gagal fetch query "${query}":`, err.message);
    }
  }

  console.log(`\n📊 Berhasil mengumpulkan ${allResults.length} data perjalanan dinas/kunker.`);

  // Simpan JSON
  const jsonPath = path.resolve(process.cwd(), 'perjalanan_dinas_jabar.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`💾 JSON tersimpan di: ${jsonPath}`);

  // Simpan CSV
  if (allResults.length > 0) {
    const csvPath = path.resolve(process.cwd(), 'perjalanan_dinas_jabar.csv');
    const headers = Object.keys(allResults[0]).join(',');
    const rows = allResults.map(r =>
      Object.values(r)
        .map(v => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    fs.writeFileSync(csvPath, [headers, ...rows].join('\n'), 'utf-8');
    console.log(`💾 CSV tersimpan di: ${csvPath}`);
  }
}

runScraper();
