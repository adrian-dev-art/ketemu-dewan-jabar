import os
import sys
import time

try:
    import win32com.client
except ImportError:
    print("win32com not installed, installing pywin32...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pywin32"])
    import win32com.client

wdFormatPDF = 17

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIR = os.path.join(BASE_DIR, "docs")

files = [
    ("HUDANG_SOP_Alur_Kerja.docx", "HUDANG_SOP_Alur_Kerja.pdf"),
    ("HUDANG_Spesifikasi_Teknis.docx", "HUDANG_Spesifikasi_Teknis.pdf"),
    ("HUDANG_Spesifikasi_Teknis_Screenshot_Kode.docx", "HUDANG_Spesifikasi_Teknis_Screenshot_Kode.pdf")
]

def convert():
    print("[PDF CONVERSION] Starting Word Automation (DispatchEx)...", flush=True)
    word = win32com.client.DispatchEx("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0

    try:
        for docx_name, pdf_name in files:
            docx_path = os.path.join(DOCS_DIR, docx_name)
            pdf_path = os.path.join(DOCS_DIR, pdf_name)
            
            if not os.path.exists(docx_path):
                print(f"[ERROR] Source file not found: {docx_path}", flush=True)
                continue
                
            print(f"[CONVERTING] {docx_name} -> {pdf_name}...", flush=True)
            doc = word.Documents.Open(
                FileName=docx_path,
                ReadOnly=True,
                ConfirmConversions=False,
                AddToRecentFiles=False,
                Visible=False
            )
            
            # Export to native PDF
            doc.SaveAs2(FileName=pdf_path, FileFormat=wdFormatPDF)
            doc.Close(SaveChanges=False)
            
            if os.path.exists(pdf_path):
                print(f"[COMPLETED] Generated: {pdf_path} ({os.path.getsize(pdf_path):,} bytes)", flush=True)
            else:
                print(f"[ERROR] Failed to generate {pdf_path}", flush=True)
    finally:
        print("[CLEANUP] Closing Word process...", flush=True)
        word.Quit()
        print("[SUCCESS] All PDF conversions completed!", flush=True)

if __name__ == "__main__":
    convert()
