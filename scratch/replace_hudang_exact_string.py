import zipfile
import shutil
import os
import re

docx_path = r'e:\project\DPRD\MEETDEWAN\proper\HD_A2_01_Dodi_Sukmayana_Konsep_Proper_Hari_Ke_3.docx'
backup_path = docx_path + '.bak'

# Read original document.xml from backup
tmp_dir = r'e:\project\DPRD\MEETDEWAN\proper\_tmp_docx_exact'
if os.path.exists(tmp_dir):
    shutil.rmtree(tmp_dir)

with zipfile.ZipFile(backup_path, 'r') as z:
    z.extractall(tmp_dir)

doc_xml_path = os.path.join(tmp_dir, 'word', 'document.xml')

with open(doc_xml_path, 'r', encoding='utf-8') as f:
    xml_str = f.read()

original_length = len(xml_str)

# 1. Hadirkeun Usulan...
xml_str = re.sub(
    r'sistem informasi aspirasi digital terintegrasi yang diberi nama [^\s<]+HUDANG [^\s<]+ Hadirkeun Usulan, Dangukeun Aspirasi, Nyatakeun Gagasan[^\s<]+',
    'platform berbasis aplikasi penyampaian aspirasi digital terintegrasi.',
    xml_str
)

# 2. Fitur Utama HUDANG:
xml_str = xml_str.replace('Fitur Utama HUDANG:', 'Fitur Utama Platform berbasis Aplikasi:')

# 3. Implementasi HUDANG memberikan
xml_str = xml_str.replace('Implementasi HUDANG memberikan', 'Implementasi platform berbasis aplikasi memberikan')

# 4. Tabel 6. Nilai Tambah HUDANG bagi Pemangku Kepentingan
xml_str = xml_str.replace('Tabel 6. Nilai Tambah HUDANG bagi Pemangku Kepentingan', 'Tabel 6. Nilai Tambah Platform berbasis Aplikasi bagi Pemangku Kepentingan')

# 5. Analisis kebermanfaatan (benefit) HUDANG dilakukan
xml_str = xml_str.replace('Analisis kebermanfaatan (benefit) HUDANG dilakukan', 'Analisis kebermanfaatan (benefit) platform berbasis aplikasi dilakukan')

# 6. Tabel 7. Analisis Efisiensi Biaya: Mekanisme Konvensional vs. HUDANG (Estimasi per Tahun)
xml_str = xml_str.replace('Mekanisme Konvensional vs. HUDANG', 'Mekanisme Konvensional vs. Platform berbasis Aplikasi')

# 7. HUDANG (Digital)
xml_str = xml_str.replace('HUDANG (Digital)', 'Platform berbasis Aplikasi (Digital)')

# 8. kebermanfaatan HUDANG juga diukur
xml_str = xml_str.replace('kebermanfaatan HUDANG juga diukur', 'kebermanfaatan platform berbasis aplikasi juga diukur')

# 9. Tabel 8. Indikator Efektivitas Layanan Sebelum dan Sesudah Implementasi HUDANG
xml_str = xml_str.replace('Sebelum dan Sesudah Implementasi HUDANG', 'Sebelum dan Sesudah Implementasi Platform berbasis Aplikasi')

# 10. target implementasi HUDANG.
xml_str = xml_str.replace('target implementasi HUDANG.', 'target implementasi platform berbasis aplikasi.')

# 11. implementasi HUDANG diperkirakan
xml_str = xml_str.replace('implementasi HUDANG diperkirakan', 'implementasi platform berbasis aplikasi diperkirakan')

# 12. meskipun implementasi HUDANG dihadapkan
xml_str = xml_str.replace('meskipun implementasi HUDANG dihadapkan', 'meskipun implementasi platform berbasis aplikasi dihadapkan')

# Verify remaining HUDANG count
remaining_matches = list(re.finditer(r'HUDANG', xml_str, re.IGNORECASE))
print(f'Remaining HUDANG count in XML string: {len(remaining_matches)}')
if remaining_matches:
    for m in remaining_matches:
        print('  Remaining match:', repr(xml_str[max(0, m.start()-50):min(len(xml_str), m.end()+50)]))

with open(doc_xml_path, 'w', encoding='utf-8') as f:
    f.write(xml_str)

# Re-zip docx
with zipfile.ZipFile(docx_path, 'w', zipfile.ZIP_DEFLATED) as z_out:
    for root_dir, dirs, files in os.walk(tmp_dir):
        for file in files:
            full_path = os.path.join(root_dir, file)
            arcname = os.path.relpath(full_path, tmp_dir)
            z_out.write(full_path, arcname)

shutil.rmtree(tmp_dir)
print('Exact string replaced DOCX successfully saved!')
