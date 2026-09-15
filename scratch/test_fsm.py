import subprocess, os
edge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html = os.path.abspath("docs/diagrams/spec_fsm_ticket.html")
png = os.path.abspath("docs/diagrams/spec_fsm_ticket.png")
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
res = subprocess.run(cmd, capture_output=True, timeout=15)
print("Result:", res.returncode, os.path.exists(png), os.path.getsize(png) if os.path.exists(png) else 0)
