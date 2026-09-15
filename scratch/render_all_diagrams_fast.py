import os, subprocess, sys

# Import DIAGRAMS from scripts/generate_all_diagrams.py
sys.path.insert(0, os.path.abspath("scripts"))
from generate_all_diagrams import DIAGRAMS, OUTPUT_DIR, EDGE_PATH

print(f"Total diagrams to process: {len(DIAGRAMS)}", flush=True)

for name, html_content in DIAGRAMS.items():
    html_file = os.path.join(OUTPUT_DIR, f"{name}.html")
    png_file = os.path.join(OUTPUT_DIR, f"{name}.png")
    
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    if os.path.exists(png_file) and os.path.getsize(png_file) > 20000:
        print(f"Skipping already rendered: {name}.png ({os.path.getsize(png_file):,} bytes)", flush=True)
        continue

    file_url = "file:///" + os.path.abspath(html_file).replace("\\", "/")
    cmd = [
        EDGE_PATH,
        "--headless=new",
        "--disable-gpu",
        "--force-device-scale-factor=2",
        f"--screenshot={png_file}",
        "--window-size=1200,820",
        file_url
    ]
    print(f"Rendering {name}...", flush=True)
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=12)
        if res.returncode == 0 and os.path.exists(png_file):
            print(f"SUCCESS: {name}.png ({os.path.getsize(png_file):,} bytes)", flush=True)
        else:
            print(f"FAIL {name}: returncode {res.returncode}, stderr: {res.stderr[:200]}", flush=True)
    except subprocess.TimeoutExpired:
        print(f"TIMEOUT {name}", flush=True)

print("ALL DIAGRAM PROCESSING COMPLETE!", flush=True)
