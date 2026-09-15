import os
import subprocess
import tempfile

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html_file = os.path.abspath("docs/diagrams/spec_topo_docker.html")
png_file = os.path.abspath("docs/diagrams/spec_topo_docker.png")

user_dir = tempfile.mkdtemp()
file_url = "file:///" + html_file.replace("\\", "/")

cmd = [
    EDGE_PATH,
    "--headless",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    f"--user-data-dir={user_dir}",
    "--force-device-scale-factor=2",
    f"--screenshot={png_file}",
    "--window-size=1200,820",
    file_url
]

print("Running command...")
try:
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
    print("Returncode:", res.returncode)
    print("PNG exists:", os.path.exists(png_file), "Size:", os.path.getsize(png_file) if os.path.exists(png_file) else 0)
except subprocess.TimeoutExpired:
    print("Timed out!")
