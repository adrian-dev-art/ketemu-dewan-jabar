import zipfile
import shutil
import os
import re
import xml.etree.ElementTree as ET

docx_path = r'e:\project\DPRD\MEETDEWAN\proper\HD_A2_01_Dodi_Sukmayana_Konsep_Proper_Hari_Ke_3.docx'
backup_path = docx_path + '.bak'

# Create backup if not already present
if not os.path.exists(backup_path):
    shutil.copyfile(docx_path, backup_path)
    print(f'Created backup at {backup_path}')
else:
    print(f'Backup already exists at {backup_path}')

# Read zip entries
tmp_dir = r'e:\project\DPRD\MEETDEWAN\proper\_tmp_docx'
if os.path.exists(tmp_dir):
    shutil.rmtree(tmp_dir)

with zipfile.ZipFile(backup_path, 'r') as z:
    z.extractall(tmp_dir)

doc_xml_path = os.path.join(tmp_dir, 'word', 'document.xml')

with open(doc_xml_path, 'r', encoding='utf-8') as f:
    xml_str = f.read()

# Let's inspect all <w:t> elements and replace HUDANG precisely inside text nodes
root = ET.fromstring(xml_str)
namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
ET.register_namespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')
ET.register_namespace('r', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships')
ET.register_namespace('m', 'http://schemas.openxmlformats.org/officeDocument/2006/math')
ET.register_namespace('v', 'urn:schemas-microsoft-com:vml')
ET.register_namespace('wp', 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing')
ET.register_namespace('w10', 'urn:schemas-microsoft-com:office:word')
ET.register_namespace('w14', 'http://schemas.microsoft.com/office/word/2010/wordml')

replaced_count = 0
for t in root.findall('.//w:t', namespaces):
    if t.text and 'HUDANG' in t.text:
        text = t.text
        print(f"Original [{replaced_count+1}]:", text)
        
        # 1. Hadirkeun Usulan, Dangukeun Aspirasi, Nyatakeun Gagasan case
        text = re.sub(
            r'sistem informasi aspirasi digital terintegrasi yang diberi nama [“"\'\`«]?HUDANG [–\-—] Hadirkeun Usulan, Dangukeun Aspirasi, Nyatakeun Gagasan[”"\'\`»]?',
            'platform berbasis aplikasi penyampaian aspirasi digital terintegrasi',
            text
        )
        
        # 2. Fitur Utama HUDANG:
        text = text.replace('Fitur Utama HUDANG:', 'Fitur Utama Platform berbasis Aplikasi:')
        
        # 3. Implementasi HUDANG memberikan
        text = text.replace('Implementasi HUDANG memberikan', 'Implementasi platform berbasis aplikasi memberikan')
        
        # 4. Tabel 6. Nilai Tambah HUDANG bagi Pemangku Kepentingan
        text = text.replace('Tabel 6. Nilai Tambah HUDANG bagi Pemangku Kepentingan', 'Tabel 6. Nilai Tambah Platform berbasis Aplikasi bagi Pemangku Kepentingan')
        
        # 5. Analisis kebermanfaatan (benefit) HUDANG dilakukan
        text = text.replace('Analisis kebermanfaatan (benefit) HUDANG dilakukan', 'Analisis kebermanfaatan (benefit) platform berbasis aplikasi dilakukan')
        
        # 6. Tabel 7. Analisis Efisiensi Biaya: Mekanisme Konvensional vs. HUDANG (Estimasi per Tahun)
        text = text.replace('vs. HUDANG (Estimasi per Tahun)', 'vs. Platform berbasis Aplikasi (Estimasi per Tahun)')
        
        # 7. HUDANG (Digital)
        text = text.replace('HUDANG (Digital)', 'Platform berbasis Aplikasi (Digital)')
        
        # 8. kebermanfaatan HUDANG juga diukur
        text = text.replace('kebermanfaatan HUDANG juga diukur', 'kebermanfaatan platform berbasis aplikasi juga diukur')
        
        # 9. Tabel 8. Indikator Efektivitas Layanan Sebelum dan Sesudah Implementasi HUDANG
        text = text.replace('Sebelum dan Sesudah Implementasi HUDANG', 'Sebelum dan Sesudah Implementasi Platform berbasis Aplikasi')
        
        # 10. target implementasi HUDANG.
        text = text.replace('target implementasi HUDANG.', 'target implementasi platform berbasis aplikasi.')
        
        # 11. implementasi HUDANG diperkirakan
        text = text.replace('implementasi HUDANG diperkirakan', 'implementasi platform berbasis aplikasi diperkirakan')
        
        # 12. meskipun implementasi HUDANG dihadapkan
        text = text.replace('meskipun implementasi HUDANG dihadapkan', 'meskipun implementasi platform berbasis aplikasi dihadapkan')

        # Fallback for any other HUDANG string
        if 'HUDANG' in text:
            text = text.replace('HUDANG', 'platform berbasis aplikasi')
            
        print(f"Replaced [{replaced_count+1}]:", text)
        t.text = text
        replaced_count += 1

print(f"\nTotal elements updated: {replaced_count}")

# Save updated XML back to file using ET or string replacement
new_xml_bytes = ET.tostring(root, encoding='utf-8', xml_declaration=True)

with open(doc_xml_path, 'wb') as f:
    f.write(new_xml_bytes)

# Re-zip to docx
with zipfile.ZipFile(docx_path, 'w', zipfile.ZIP_DEFLATED) as z_out:
    for root_dir, dirs, files in os.walk(tmp_dir):
        for file in files:
            full_path = os.path.join(root_dir, file)
            arcname = os.path.relpath(full_path, tmp_dir)
            z_out.write(full_path, arcname)

shutil.rmtree(tmp_dir)
print('DOCX successfully saved to:', docx_path)
