import subprocess, os
edge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

for name in ['spec_egress_hls', 'spec_pitr_backup']:
    html = os.path.abspath(f"docs/diagrams/{name}.html")
    png = os.path.abspath(f"docs/diagrams/{name}.png")
    file_url = "file:///" + html.replace("\\", "/")
    cmd = [
        edge,
        "--headless=new",
        "--disable-gpu",
        "--force-device-scale-factor=2",
        f"--screenshot={png}",
        "--window-size=1200,820",
        file_url
    ]
    print(f"Starting {name}...", flush=True)
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        stdout, stderr = p.communicate(timeout=30)
        print(f"Done {name}, exists: {os.path.exists(png)} ({os.path.getsize(png) if os.path.exists(png) else 0} bytes)", flush=True)
    except subprocess.TimeoutExpired:
        p.kill()
        print(f"Timed out {name}!", flush=True)

print("All done!", flush=True)
