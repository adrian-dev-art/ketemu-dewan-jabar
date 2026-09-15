import os, subprocess, tempfile, shutil

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
OUTPUT_DIR = os.path.abspath("docs/diagrams")

missing = ['spec_fsm_ticket', 'spec_transcription', 'spec_egress_hls', 'spec_pitr_backup']

for name in missing:
    html_file = os.path.join(OUTPUT_DIR, f"{name}.html")
    png_file = os.path.join(OUTPUT_DIR, f"{name}.png")
    
    if not os.path.exists(html_file):
        print(f"Missing HTML: {html_file}")
        continue
    
    temp_dir = tempfile.mkdtemp()
    file_url = "file:///" + os.path.abspath(html_file).replace("\\", "/")
    
    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        f"--user-data-dir={temp_dir}",
        "--force-device-scale-factor=2",
        f"--screenshot={png_file}",
        "--window-size=1200,820",
        file_url
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        print(f"Rendered {name}: {os.path.exists(png_file)} ({os.path.getsize(png_file)} bytes)")
    except Exception as e:
        print(f"Error {name}: {e}")
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

print("Finished rendering missing diagrams.")
