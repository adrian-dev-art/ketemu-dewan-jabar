import zipfile
import shutil
import os
import re

docx_path = r'e:\project\DPRD\MEETDEWAN\proper\HD_A2_01_Dodi_Sukmayana_Konsep_Proper_Hari_Ke_3.docx'
backup_path = docx_path + '.bak'

tmp_dir = r'e:\project\DPRD\MEETDEWAN\proper\_tmp_docx_refine'
if os.path.exists(tmp_dir):
    shutil.rmtree(tmp_dir)

# Extract docx
with zipfile.ZipFile(docx_path, 'r') as z:
    z.extractall(tmp_dir)

doc_xml_path = os.path.join(tmp_dir, 'word', 'document.xml')

with open(doc_xml_path, 'r', encoding='utf-8') as f:
    xml_str = f.read()

# Refinements
replacements = [
    # 1. Smoother sentence in Bab 7 Paragraf 1
    (
        'dirumuskan gagasan inovasi berupa pengembangan platform berbasis aplikasi penyampaian aspirasi digital terintegrasi.',
        'dirumuskan gagasan inovasi berupa pengembangan platform penyampaian aspirasi digital berbasis aplikasi yang terintegrasi.'
    ),
    # 2. Capitalization in Sub-heading
    (
        'Fitur Utama Platform berbasis Aplikasi:',
        'Fitur Utama Platform Berbasis Aplikasi:'
    ),
    # 3. Capitalization in Table 6 Caption
    (
        'Tabel 6. Nilai Tambah Platform berbasis Aplikasi bagi Pemangku Kepentingan',
        'Tabel 6. Nilai Tambah Platform Berbasis Aplikasi bagi Pemangku Kepentingan'
    ),
    # 4. Capitalization in Table 7 Caption
    (
        'Tabel 7. Analisis Efisiensi Biaya: Mekanisme Konvensional vs. Platform berbasis Aplikasi (Estimasi per Tahun)',
        'Tabel 7. Analisis Efisiensi Biaya: Mekanisme Konvensional vs. Platform Berbasis Aplikasi (Estimasi per Tahun)'
    ),
    # 5. Redundancy fix in Table 7 Column Header
    (
        'Platform berbasis Aplikasi (Digital)',
        'Platform Berbasis Aplikasi'
    ),
    # 6. Capitalization in Table 8 Caption
    (
        'Tabel 8. Indikator Efektivitas Layanan Sebelum dan Sesudah Implementasi Platform berbasis Aplikasi',
        'Tabel 8. Indikator Efektivitas Layanan Sebelum dan Sesudah Implementasi Platform Berbasis Aplikasi'
    ),
]

for old_str, new_str in replacements:
    if old_str in xml_str:
        xml_str = xml_str.replace(old_str, new_str)
        print(f"Refined: '{old_str[:40]}...' -> '{new_str[:40]}...'")
    else:
        print(f"WARNING: Target not found: '{old_str[:40]}...'")

with open(doc_xml_path, 'w', encoding='utf-8') as f:
    f.write(xml_str)

# Re-zip docx to a temp output file first
out_docx_path = docx_path + '.tmp'
with zipfile.ZipFile(out_docx_path, 'w', zipfile.ZIP_DEFLATED) as z_out:
    for root_dir, dirs, files in os.walk(tmp_dir):
        for file in files:
            full_path = os.path.join(root_dir, file)
            arcname = os.path.relpath(full_path, tmp_dir)
            z_out.write(full_path, arcname)

shutil.rmtree(tmp_dir)

try:
    os.replace(out_docx_path, docx_path)
    print('DOCX successfully refined!')
except Exception as e:
    print(f'Saved to {out_docx_path} (could not overwrite {docx_path} directly: {e})')

