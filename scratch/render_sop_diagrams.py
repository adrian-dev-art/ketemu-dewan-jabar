import os
import subprocess

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(EDGE_PATH):
    EDGE_PATH = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

DIAG_DIR = os.path.abspath("docs/diagrams")

DIAGRAMS = [
    ("sop_diagram_2", 1400, 900),
    ("sop_diagram_4", 1400, 900),
    ("sop_main_flow", 1800, 1200),
    ("sop_permenpan_table", 1600, 1200)
]

for name, width, height in DIAGRAMS:
    html_file = os.path.join(DIAG_DIR, f"{name}.html")
    png_file = os.path.join(DIAG_DIR, f"{name}.png")
    
    if not os.path.exists(html_file):
        print(f"Skipping {html_file}, not found")
        continue
        
    cmd = [
        EDGE_PATH,
        "--headless",
        "--disable-gpu",
        "--force-device-scale-factor=2",
        f"--screenshot={png_file}",
        f"--window-size={width},{height}",
        f"file:///{html_file.replace(os.sep, '/')}"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode == 0 and os.path.exists(png_file):
        print(f"[SUCCESS] Rendered {png_file} ({os.path.getsize(png_file):,} bytes)")
    else:
        print(f"[FAILED] {name}: {res.stderr}")

print("Rendering complete.")
