#!/usr/bin/env python3
"""
Scraper Data Perjalanan Dinas & Kunjungan Kerja DPRD Provinsi Jawa Barat
Mendukung ekstraksi otomatis dari:
1. Google News RSS Feeds (Berita & Rilis Publik Terkini)
2. Portal Resmi DPRD Jabar (dprd.jabarprov.go.id)
Output: JSON dan CSV
"""

import sys
import json
import csv
import re
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime

# Daftar kata kunci pencarian perjalanan dinas DPRD Jawa Barat
SEARCH_QUERIES = [
    'DPRD Jawa Barat "kunjungan kerja"',
    'DPRD Jawa Barat "perjalanan dinas"',
    'DPRD Jabar "reses"',
    'DPRD Jawa Barat "studi banding"',
    'DPRD Jawa Barat Komisi "kunker"'
]

REGIONS = [
    "Bandung", "Cimahi", "Bandung Barat", "Bogor", "Sukabumi", "Cianjur",
    "Garut", "Tasikmalaya", "Ciamis", "Banjar", "Pangandaran", "Kuningan",
    "Cirebon", "Majalengka", "Sumedang", "Indramayu", "Subang", "Purwakarta",
    "Karawang", "Bekasi", "Depok", "Jakarta", "Bali", "Yogyakarta", "Semarang", "Surabaya"
]

def extract_komisi(text):
    text_lower = text.lower()
    if "komisi i\b" in text_lower or "komisi 1" in text_lower or "komisi i " in text_lower:
        return "Komisi I"
    elif "komisi ii" in text_lower or "komisi 2" in text_lower:
        return "Komisi II"
    elif "komisi iii" in text_lower or "komisi 3" in text_lower:
        return "Komisi III"
    elif "komisi iv" in text_lower or "komisi 4" in text_lower:
        return "Komisi IV"
    elif "komisi v" in text_lower or "komisi 5" in text_lower:
        return "Komisi V"
    elif "banggar" in text_lower or "badan anggaran" in text_lower:
        return "Badan Anggaran"
    elif "banmus" in text_lower or "badan musyawarah" in text_lower:
        return "Badan Musyawarah"
    elif "reses" in text_lower:
        return "Seluruh Anggota (Reses Dapil)"
    return "DPRD Jabar / Pimpinan"

def extract_category(text):
    text_lower = text.lower()
    if "reses" in text_lower:
        return "Reses"
    elif "studi banding" in text_lower or "kaji terap" in text_lower:
        return "Studi Banding"
    elif "kunjungan kerja" in text_lower or "kunker" in text_lower:
        return "Kunjungan Kerja"
    elif "perjalanan dinas" in text_lower:
        return "Perjalanan Dinas"
    return "Kunjungan Kerja"

def extract_location(text):
    found_locations = []
    for reg in REGIONS:
        if re.search(r'\b' + re.escape(reg) + r'\b', text, re.IGNORECASE):
            found_locations.append(reg)
    return ", ".join(found_locations) if found_locations else "Jawa Barat / Terkait"

def fetch_rss_data():
    results = []
    seen_links = set()

    print("🔍 Mengambil data perjalanan dinas & kunker dari Google News RSS...")
    for query in SEARCH_QUERIES:
        encoded_query = urllib.parse.quote(f"{query} when:1y")
        url = f"https://news.google.com/rss/search?q={encoded_query}&hl=id&gl=ID&ceid=ID:id"

        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                xml_content = response.read()
                root = ET.fromstring(xml_content)

                for item in root.findall("./channel/item"):
                    title = item.find("title").text if item.find("title") is not None else ""
                    link = item.find("link").text if item.find("link") is not None else ""
                    pub_date = item.find("pubDate").text if item.find("pubDate") is not None else ""
                    source = item.find("source").text if item.find("source") is not None else "Media Publik"

                    if link in seen_links or not title:
                        continue
                    seen_links.add(link)

                    full_text = f"{title}"
                    results.append({
                        "id": f"PD-{len(results) + 1:03d}",
                        "judul": title,
                        "kategori": extract_category(full_text),
                        "komisi": extract_komisi(full_text),
                        "lokasi_terdeteksi": extract_location(full_text),
                        "tanggal_publikasi": pub_date,
                        "sumber": source,
                        "url": link
                    })
        except Exception as e:
            print(f"⚠️ Gagal mengambil query '{query}': {e}", file=sys.stderr)

    return results

def save_to_files(data, json_path="perjalanan_dinas_jabar.json", csv_path="perjalanan_dinas_jabar.csv"):
    # Simpan JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"✅ Data JSON berhasil disimpan ke: {json_path}")

    # Simpan CSV
    if data:
        keys = data[0].keys()
        with open(csv_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            writer.writerows(data)
        print(f"✅ Data CSV berhasil disimpan ke: {csv_path}")

if __name__ == "__main__":
    data = fetch_rss_data()
    print(f"\n📊 Total data terkumpul: {len(data)} item")
    save_to_files(data)
